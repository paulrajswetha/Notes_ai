from flask import Flask, request, jsonify
import os
import fitz  # PyMuPDF for text-based PDFs
import google.generativeai as genai
import pytesseract
from pdf2image import convert_from_path
import cv2
import numpy as np
from flask_cors import CORS
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_fixed
import json

# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for React frontend

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyBOalGe9DPKNtzfJ2F-5bZs1PRsYq4V4sE"
if not GEMINI_API_KEY:
    raise ValueError("Missing Gemini API Key. Set it in the .env file.")
genai.configure(api_key=GEMINI_API_KEY)

# Set Tesseract path (adjust based on your OS)
pytesseract.pytesseract.tesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

# Function to Extract Text from Text-based PDFs
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = "\n".join(page.get_text("text") for page in doc if page.get_text("text"))
        return text.strip() if text else None
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

# Function to Preprocess Image for OCR
def preprocess_image(image):
    img = np.array(image)  # Convert PIL image to NumPy array
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)  # Reduce noise
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)  # Binarization
    return binary

def extract_text_from_scanned_pdf(pdf_path):
    try:
        images = convert_from_path(pdf_path, dpi=400)
        extracted_text = ""
        for image in images:
            processed_image = preprocess_image(image)
            if processed_image is None:
                continue
            custom_config = r'--oem 3 --psm 3'  
            page_text = pytesseract.image_to_string(processed_image, config=custom_config, lang='eng')
            extracted_text += page_text + "\n"
        return extracted_text.strip() if extracted_text else None
    except Exception as e:
        print(f"Error performing OCR on scanned PDF: {e}")
        return None

# Function to Generate AI Responses
def generate_gemini_response(prompt):
    try:
        model = genai.GenerativeModel("models/gemini-2.0-pro-exp-02-05")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"⚠ ERROR: {e}"

def generate_mcqs_gemini(text):
    try:
        prompt = f"Create 10 MCQs with 4 answer choices each from the following text. Clearly indicate the correct answer: \n\n{text}"
        response = generate_gemini_response(prompt)
        mcqs = response.split("\n\n")
        structured_mcqs = []
        for mcq in mcqs:
            lines = mcq.split("\n")
            if len(lines) >= 5:  
                question = lines[0]
                choices = lines[1:5]
                correct_answer = choices[-1] 
                structured_mcqs.append({
                    "question": question,
                    "options": choices,
                    "answer": correct_answer
                })
        return structured_mcqs
    except Exception as e:
        return f"⚠ ERROR: {e}"

# Retry mechanism for short notes generation
@retry(stop=stop_after_attempt(5), wait=wait_fixed(2))
def generate_short_notes_with_retry(extracted_text):
    prompt = f"Create concise short notes from:\n\n{extracted_text}"
    response = generate_gemini_response(prompt)
    if "⚠ ERROR" in response:
        raise Exception("Retrying due to resource exhaustion...")
    return response

def process_flashcards(response_text):
    try:
        flashcards_list = response_text.split("\n\n")
        structured_flashcards = []
        for flashcard in flashcards_list:
            parts = flashcard.split("\n")
            if len(parts) >= 2:  # Ensure both front and back exist
                structured_flashcards.append({
                    "front": parts[0].strip(),
                    "back": parts[1].strip()
                })
        return structured_flashcards
    except Exception as e:
        return [{"front": "Error", "back": str(e)}]  

# API Route for Uploading PDFs
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({"error": "Invalid file. Please upload a PDF."}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    extracted_text = extract_text_from_pdf(filepath)
    if not extracted_text:
        print("Text-based extraction failed. Trying OCR for scanned PDF...")
        extracted_text = extract_text_from_scanned_pdf(filepath)

    if not extracted_text:
        return jsonify({"error": "Failed to extract text. Try another PDF."}), 400

    summary = generate_gemini_response(f"Summarize this:\n\n{extracted_text}")
    flashcards = generate_gemini_response(f"Create 5 flashcards (Q&A) from:\n\n{extracted_text}")
    mcqs = generate_mcqs_gemini(extracted_text)
    
    # Use retry logic for short notes
    try:
        short_notes = generate_short_notes_with_retry(extracted_text)
    except Exception as e:
        short_notes = f"⚠ ERROR: {e}"

    return jsonify({
        "summary": summary,
        "flashcards": process_flashcards(flashcards),
        "mcqs": mcqs,
        "short_notes": short_notes
    })

# Run Flask App Locally
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)