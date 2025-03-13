import { useState, useRef } from "react";
import Chatbot from "./Components/Chatbot";
import FileUploader from "./Components/FileUploader";
import axios from "axios";

function App() {
  const [content, setContent] = useState({
    summary: "",
    notes: "",
    mcqs: [],
    flashcards: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [flipped, setFlipped] = useState([]);
  const [score, setScore] = useState(0); // Track user's MCQ score
  const [mcqResults, setMcqResults] = useState({}); // Track MCQ results (correct/wrong)

  const speechSynthesisRef = useRef(window.speechSynthesis);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Remove stars (**) from content
      const cleanSummary = response.data.summary.replace(/\*\*/g, "");
      const cleanNotes = response.data.short_notes.replace(/\*\*/g, "");
      const cleanFlashcards = response.data.flashcards.map((card) => ({
        front: card.front.replace(/\*\*/g, ""),
        back: card.back.replace(/\*\*/g, ""),
      }));
      const cleanMcqs = response.data.mcqs.map((mcq) => ({
        ...mcq,
        question: mcq.question.replace(/\*\*/g, ""),
        options: mcq.options.map((option) => option.replace(/\*\*/g, "")),
      }));

      setContent({
        summary: cleanSummary,
        notes: cleanNotes,
        mcqs: cleanMcqs,
        flashcards: cleanFlashcards,
      });

      setFlipped(Array(response.data.flashcards.length).fill(false));
      setMcqResults({}); // Reset MCQ results
      setScore(0); // Reset score
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process the file.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    let utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current.speak(utterance);
  };

  const downloadContent = () => {
    const data = `Summary:\n${content.summary}\n\nShort Notes:\n${content.notes}\n\nFlashcards:\n${content.flashcards
      .map((f) => `Q: ${f.front} | A: ${f.back}`)
      .join("\n")}\n\nMCQs:\n${content.mcqs
      .map((m) => `Q: ${m.question} | Options: ${m.options.join(", ")}`)
      .join("\n")}`;
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "study_notes.txt";
    link.click();
  };

  const handleFlip = (index) => {
    setFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleMCQAnswer = (questionIndex, selectedOption) => {
    const mcq = content.mcqs[questionIndex];
    const isCorrect = selectedOption === mcq.answer;

    // Update MCQ results
    setMcqResults((prev) => ({
      ...prev,
      [questionIndex]: isCorrect ? "Correct" : "Wrong",
    }));

    // Update score if correct
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 via-purple-400 to-pink-500 text-transparent bg-clip-text">
          AI Learning Assistant
        </h1>
        <p className="text-center text-purple-200 mb-8">
          Upload your content and get AI-powered summaries, notes, quizzes, and flashcards
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold mb-4 text-pink-400">Upload Content</h2>
              <FileUploader onFileUpload={handleFileUpload} />
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-4 text-purple-300 text-lg">Analyzing your content...</p>
              </div>
            )}

            {/* Summary */}
            {content.summary && (
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-purple-500/20">
                <h2 className="text-xl font-semibold mb-4 text-pink-400">Summary</h2>
                <p className="text-purple-200 whitespace-pre-line">{content.summary}</p>
                <button
                  onClick={() => speakText(content.summary)}
                  className="mt-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  🔊 Read Aloud
                </button>
              </div>
            )}

            {/* Short Notes */}
            {content.notes && (
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-purple-500/20">
                <h2 className="text-xl font-semibold mb-4 text-pink-400">Short Notes</h2>
                <ul className="text-purple-200 list-disc list-inside">
                  {content.notes.split("\n").map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
                <button
                  onClick={() => speakText(content.notes)}
                  className="mt-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  🔊 Read Aloud
                </button>
              </div>
            )}

            {/* Flashcards */}
            {content.flashcards.length > 0 && (
              <div className="bg-gray-900 rounded-xl shadow-lg p-7 border border-purple-500/20">
                <h2 className="text-xl font-semibold mb-4 text-blue-400">Flashcards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  {content.flashcards.map((card, index) => (
                    <div
                      key={index}
                      className="relative w-full h-40 cursor-pointer perspective"
                      onClick={() => handleFlip(index)}
                    >
                      <div
                        className={`relative w-full h-full  transition-transform duration-500 transform-style preserve-3d ${
                          flipped[index] ? "rotate-y-180" : ""
                        }`}
                      >
                        {/* Front (Question) */}
                        <div className="absolute p-10 py-4 w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-md rounded-xl shadow-lg backface-hidden">
                          {card.front}
                        </div>

                        {/* Back (Answer) */}
                        <div className="absolute p-10 py-4 w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-md rounded-xl shadow-lg rotate-y-180 backface-hidden">
                          {card.back}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MCQs */}
            {content.mcqs.length > 0 && (
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-purple-500/20">
                <h2 className="text-xl font-semibold mb-4 text-pink-400 text-center">MCQs</h2>
                <div className="space-y-6">
                  {content.mcqs.map((mcq, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 border border-gray-300">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800">{mcq.question}</h3>
                      <ul className="space-y-2">
                        {mcq.options.map((option, optionIndex) => (
                          <li key={optionIndex}>
                            <button
                              onClick={() => handleMCQAnswer(index, option)}
                              className="w-full text-left py-2 px-4 border rounded-lg hover:bg-blue-100 transition"
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                      {/* Display correct/wrong result below the question */}
                      {mcqResults[index] && (
                        <p
                          className={`mt-2 text-sm font-semibold ${
                            mcqResults[index] === "Correct" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {mcqResults[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-purple-200">Your Score: {score}</p>
              </div>
            )}

            {/* Download Notes Button */}
            <button
              onClick={downloadContent}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4 hover:bg-green-600"
            >
              ⬇ Download Notes
            </button>
          </div>

          {/* Chatbot Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold mb-4 text-pink-400">Ask Questions</h2>
              <Chatbot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;