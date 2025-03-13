import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';

function ContentAnalyzer({ content }) {
    const [activeTab, setActiveTab] = useState(0);
    const [flippedCards, setFlippedCards] = useState({});

    const renderMCQs = (mcqs) => {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {mcqs.map((mcq, index) => (
                    <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-500/20"
                    >
                        <p className="font-semibold text-lg mb-4 text-pink-400">{mcq.question}</p>
                        <div className="space-y-3">
                            {mcq.options.map((option, optionIndex) => (
                                <motion.div
                                    key={optionIndex}
                                    whileHover={{ scale: 1.02 }}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${mcq.answer === optionIndex
                                        ? 'bg-pink-500/20 border-l-4 border-pink-500 text-purple-200'
                                        : 'bg-gray-900 hover:bg-purple-900/20 border-l-4 border-transparent text-gray-300'
                                        }`}
                                >
                                    <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    const renderFlashcards = (flashcards) => {
        const toggleCard = (index) => {
            setFlippedCards(prev => ({
                ...prev,
                [index]: !prev[index]
            }));
        };

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {flashcards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => toggleCard(index)}
                        className="cursor-pointer perspective-1000"
                    >
                        <motion.div
                            animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative preserve-3d w-full aspect-[3/2]"
                        >
                            <div className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-xl shadow-lg ${flippedCards[index] ? 'opacity-0' : 'opacity-100'
                                }`}>
                                <div className="text-white">
                                    <div className="text-sm uppercase tracking-wide mb-2">Question</div>
                                    <div className="text-lg font-medium">{card.front}</div>
                                </div>
                            </div>
                            <div className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-purple-600 to-pink-500 p-6 rounded-xl shadow-lg rotate-y-180 ${flippedCards[index] ? 'opacity-100' : 'opacity-0'
                                }`}>
                                <div className="text-white">
                                    <div className="text-sm uppercase tracking-wide mb-2">Answer</div>
                                    <div className="text-lg font-medium">{card.back}</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    const renderSummary = (summary) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-lg p-6 border border-purple-500/20"
        >
            <div className="prose max-w-none">
                <div className="text-purple-200 leading-relaxed">
                    {summary}
                </div>
            </div>
        </motion.div>
    );

    const renderNotes = (notes) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-lg p-6 border border-purple-500/20"
        >
            <div className="prose max-w-none">
                <div className="text-purple-200 leading-relaxed whitespace-pre-wrap">
                    {notes}
                </div>
            </div>
        </motion.div>
    );

    const tabs = [
        {
            name: 'Summary',
            icon: '📝',
            content: renderSummary(content.summary)
        },
        {
            name: 'Short Notes',
            icon: '📌',
            content: renderNotes(content.notes)
        },
        {
            name: 'MCQs',
            icon: '❓',
            content: renderMCQs(content.mcqs)
        },
        {
            name: 'Flashcards',
            icon: '🎴',
            content: renderFlashcards(content.flashcards)
        },
    ];

    return (
        <div className="mt-8">
            <Tab.Group onChange={setActiveTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-gradient-to-r from-gray-900 to-black p-2 shadow-lg mb-6 border border-purple-500/20">
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.name}
                            className={({ selected }) =>
                                `w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 transition-all duration-200 ease-in-out
                 ${selected
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md transform scale-105'
                                    : 'text-purple-300 hover:bg-purple-900/30'
                                }`
                            }
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </span>
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-4">
                    {tabs.map((tab, idx) => (
                        <Tab.Panel
                            key={idx}
                            className={`rounded-xl bg-black/50 p-6
                ${activeTab === idx ? 'ring-2 ring-pink-500 ring-opacity-60' : ''}`}
                        >
                            {tab.content}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}

export default ContentAnalyzer;