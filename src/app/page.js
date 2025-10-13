"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ChatBubble from "../app/components/ChatBubble";
import FileUploader from "../app/components/FileUploader";
import ThemeToggle from "../app/components/ThemeToggle";
import AI_Input_Search from "../app/components copy/kokonutui/ai-input-search"

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

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

    // 🧩 Include sources along with the AI answer
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
    <div className={`${theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-white text-black"} min-h-screen flex flex-col transition-all duration-300`}>
     <header className="p-4 flex items-center justify-between border-b border-gray-700/40">
        <h1 className="text-xl font-semibold pr-3">Retro</h1>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </header>


      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
       
        <FileUploader 
          onFileProcessed={(file) => console.log("File processed:", file)}
          theme={theme}
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
          theme={theme} // "dark" or "light"
        />
      </footer>
    </div>
  );
}
