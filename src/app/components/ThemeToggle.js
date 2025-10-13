"use client";

import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ theme, setTheme }) {
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-gray-700/50 hover:bg-gray-800 transition-transform duration-500"
    >
      <div
        className={`transition-transform duration-500 ${
          theme === "dark" ? "rotate-180" : "rotate-0"
        }`}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-300" />
        )}
      </div>
    </button>
  );
}
