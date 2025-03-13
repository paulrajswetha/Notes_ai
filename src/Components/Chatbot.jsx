import React, { useState } from "react";

function Chatbot({ content }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [conversationStage, setConversationStage] = useState(0); // Track conversation stage

    // Predefined bot questions to guide the conversation
    const botQuestions = [
        "Hi! Let's generate some notes. What topic are you studying?",
        "Great! Can you provide a brief overview of the topic?",
        "What are the key concepts or ideas related to this topic?",
        "Can you explain the first key concept in detail?",
        "What about the second key concept?",
        "Are there any important formulas or equations related to this topic?",
        "Can you list some examples or applications of this topic?",
        "What are the main challenges or common mistakes related to this topic?",
        "Do you have any specific questions or areas you'd like to focus on?",
        "Let's summarize what we have so far. Does this look good?",
        "Would you like to add any additional notes or details?",
        "Do you want to create flashcards for the key concepts?",
        "Should we generate some MCQs for practice?",
        "What type of MCQs would you like? (e.g., multiple-choice, true/false)",
        "How many MCQs would you like to generate?",
        "Do you want to include explanations for the answers?",
        "Would you like to review the notes before finalizing?",
        "Do you want to download the notes as a file?",
        "Is there anything else you'd like to add?",
        "Thank you for using the AI Learning Assistant! Your notes are ready.",
    ];

    // Predefined bot responses based on user input
    const botResponses = [
        "Got it! Let's dive deeper into the topic.",
        "That's a great overview. Let's break it down further.",
        "Interesting! Let's explore those concepts in detail.",
        "Thanks for the explanation. Let's move to the next concept.",
        "Noted! Let's proceed to the next step.",
        "Formulas are important. Let's make sure we include them.",
        "Examples are a great way to understand the topic better.",
        "Challenges are crucial for a comprehensive understanding.",
        "Let's focus on those areas to make your notes more useful.",
        "Here's a summary of what we've discussed so far:",
        "Additional details can make your notes more comprehensive.",
        "Flashcards are a great way to review key concepts.",
        "MCQs are excellent for testing your understanding.",
        "Let's tailor the MCQs to your needs.",
        "We'll generate the specified number of MCQs.",
        "Explanations can help clarify the answers.",
        "Reviewing ensures your notes are accurate and complete.",
        "Downloading your notes makes them easily accessible.",
        "Let's make sure we haven't missed anything.",
        "Your notes have been successfully generated!",
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const newMessage = { text: input, sender: "user", timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        // Simulate bot response after a delay
        setTimeout(() => {
            let botResponse = "";

            if (conversationStage < botQuestions.length) {
                // Bot asks the next question
                botResponse = botQuestions[conversationStage];
                setConversationStage((prev) => prev + 1);
            } else {
                // End of conversation
                botResponse = "We've completed the note generation process. Thank you!";
            }

            // Add bot response
            setMessages((prev) => [
                ...prev,
                { text: botResponse, sender: "bot", timestamp: new Date().toISOString() },
            ]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[500px] border border-purple-500/20 rounded-lg bg-gradient-to-br from-gray-900 to-black">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${message.sender === "user"
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                : "bg-gray-800 text-purple-200"
                                }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="border-t border-purple-500/20 p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your response..."
                        className="flex-1 border border-purple-500/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-900 text-purple-200 placeholder-purple-400"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Chatbot;