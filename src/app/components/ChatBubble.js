"use client";
import { motion } from "framer-motion";

export default function ChatBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
          isUser
            ? "bg-purple-600 text-white rounded-br-none"
            : "bg-gray-800 text-gray-100 rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </motion.div>
  );
}
