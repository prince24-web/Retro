"use client";
import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (selectedFile) => {
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

  const handleInputChange = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileChange(droppedFile);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
          }
          ${file ? "bg-gray-50" : "bg-white"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          id="file-upload" 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={handleInputChange} 
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <div className="text-center">
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer font-medium text-gray-900 hover:text-gray-700 transition-colors"
            >
              Choose a file
            </label>
            <p className="text-sm text-gray-500 mt-1">
              or drag and drop your PDF here
            </p>
          </div>
          
          <p className="text-xs text-gray-400">
            PDF files only
          </p>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
                <span className="text-red-600 text-sm">PDF</span>
              </div>
              <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                {file.name}
              </span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Processing your PDF...</p>
        </div>
      )}
    </div>
  );
}