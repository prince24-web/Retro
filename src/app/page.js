"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(""); // ✅ Store the AI answer
  const [sources, setSources] = useState([]); // ✅ Store source documents

  // 🧠 Extract text + metadata per page (your existing code is fine)
  const extractTextFromPDF = async (pdfFile) => {
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      const text = strings.join(" ");

      pages.push({
        pageContent: text,
        metadata: {
          pageNumber: i,
          source: pdfFile.name,
        },
      });
    }

    return pages;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);

    try {
      const pages = await extractTextFromPDF(selectedFile);

      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs: pages }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Embedded chunks:", data.chunks);
        setText(pages.map(p => p.pageContent).join("\n\n---\n\n"));
      } else {
        console.error("Embedding API error:", data.error);
        setText("❌ Embedding API error");
      }
    } catch (err) {
      console.error("❌ PDF extraction or embedding failed:", err);
      setText("❌ Failed to extract text from PDF.");
    }

    setLoading(false);
  };

  // 💬 FIXED: Ask a question about the PDF
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(""); // Clear previous answer
    setSources([]); // Clear previous sources

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      console.log("🔍 Full API response:", data); // Debug log
      
      if (res.ok) {
        // ✅ Correct response structure
        setAnswer(data.answer || "No answer generated");
        setSources(data.sources || []);
      } else {
        console.error("❌ Query error:", data.error);
        setAnswer("Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Query request failed:", err);
      setAnswer("Error: Failed to get response from server");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass rounded-2xl p-6 text-center"
      >
        <h1 className="text-2xl font-semibold mb-4">📄 Upload your PDF</h1>

        <label
          htmlFor="file-upload"
          className="cursor-pointer border border-gray-700 rounded-lg py-3 px-6 hover:bg-gray-800 transition"
        >
          {file ? "📂 " + file.name : "Choose File"}
        </label>

        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {loading && <p className="mt-4 text-gray-400 animate-pulse">Processing...</p>}

        {text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-gray-300 text-sm text-left bg-gray-900/50 p-4 rounded-lg max-h-64 overflow-y-auto"
          >
            <p>{text}</p>
          </motion.div>
        )}

        {text && (
          <div className="mt-6">
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 outline-none"
            />
            <button
              onClick={handleAskQuestion}
              disabled={loading}
              className="mt-3 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>
        )}

        {/* ✅ Display AI Answer */}
        {answer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-left bg-gray-900/50 p-4 rounded-lg"
          >
            <h2 className="text-lg font-semibold mb-2">🤖 Answer:</h2>
            <p className="text-gray-300 text-sm">{answer}</p>
          </motion.div>
        )}

        {/* ✅ Display Sources (renamed from "results") */}
        {sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-left bg-gray-900/50 p-4 rounded-lg"
          >
            <h2 className="text-lg font-semibold mb-2">📚 Sources:</h2>
            <ul className="space-y-3">
              {sources.map((source, i) => (
                <li key={i} className="text-gray-300 text-sm border-l-2 border-purple-500 pl-3">
                  <div className="mb-1">
                    <strong>Source:</strong> {source.metadata?.source || "Unknown"}
                    {source.metadata?.pageNumber && ` (Page ${source.metadata.pageNumber})`}
                  </div>
                  <div className="text-gray-400">{source.content}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}