"use client";
import { motion } from "framer-motion";

export default function ChatBubble({ sender, text, sources = [] }) {
  const isAI = sender === "ai";
  console.log("🧩 Source metadata:", sources);


  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`p-3 rounded-2xl max-w-[80%] ${
          isAI ? "bg-gray-800 text-white" : "bg-gray-600 text-white"
        }`}
      >
        <p>{text}</p>

        {/* 🧠 Show sources if it's an AI message and has metadata */}
        {isAI && sources.length > 0 && (
          <div className="mt-3 border-t border-gray-600/40 pt-2 text-sm text-gray-400">
            <p className="font-medium mb-1">📄 Sources:</p>
            <ul className="space-y-1">
              {sources.map((src, i) => (
                <li key={i}>
                  {src.metadata?.source || "Unknown file"}
                    {src.metadata?.pageNumber && <span> — page {src.metadata.pageNumber}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

