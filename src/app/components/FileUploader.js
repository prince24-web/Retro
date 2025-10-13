"use client";
import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);

    const res = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: selectedFile.name }),
    });

    setLoading(false);
  };

  return (
    <div className="border border-gray-700/40 rounded-xl p-4 text-center">
      <label
        htmlFor="file-upload"
        className="cursor-pointer px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
      >
        {file ? `📄 ${file.name}` : "Upload PDF"}
      </label>
      <input id="file-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
      {loading && <p className="text-gray-400 mt-2 animate-pulse">Processing...</p>}
    </div>
  );
}
