"use client";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full border border-gray-700/50 hover:bg-gray-800 transition"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
