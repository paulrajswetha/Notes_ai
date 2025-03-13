import google.generativeai as genai

genai.configure(api_key="AIzaSyB0d0oLb0vu80aMBF0XWzm-8ya0dVQJ6uo")

try:
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content("Hello")
    print(response.text)
except Exception as e:
    print("Error:", e)
