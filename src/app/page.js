"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Twitter } from "lucide-react";
import ChatBubble from "../app/components/ChatBubble";
import FileUploader from "../app/components/FileUploader";
import AI_Input_Search from "../app/components copy/kokonutui/ai-input-search"

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const newMsg = { sender: "user", text: question };
    setMessages([...messages, newMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-gray-300">
        <h1 className="text-xl font-semibold pr-3">Retro</h1>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/your-username/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Github size={20} />
          </a>
          <a
            href="https://twitter.com/your-username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Twitter size={20} />
          </a>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-16">
          <div className="mb-4 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Chat with your PDFs instantly
          </div>

          <h1 className="text-5xl md:text-4xl font-bold leading-tight mb-4">
            Chat With <span className="text-blue-600">Your Documents</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mb-10">
            Upload your PDF files and start having an intelligent chat with them.
            Get instant summaries, answers, and insights powered by AI.
          </p>
        </div>
        
        <FileUploader 
          onFileProcessed={(file) => console.log("File processed:", file)}
        />
        
        {messages.map((msg, i) => (
          <ChatBubble key={i} sender={msg.sender} text={msg.text} sources={msg.sources} />
        ))}
        
        {loading && <p className="text-gray-400 animate-pulse">Thinking...</p>}
      </main>

      <footer className="p-4 flex items-center gap-2 max-w-2xl mx-auto w-full">
        <AI_Input_Search
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          handleAsk={handleAsk}
        />
      </footer>
    </div>
  );
}