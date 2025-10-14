"use client";

import { Globe, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

export default function AI_Input_Search({ 
  question, 
  setQuestion, 
  loading, 
  handleAsk
}) {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 200,
    });
    const [showSearch, setShowSearch] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = () => {
        if (!question.trim() || loading) return;
        handleAsk();
        adjustHeight(true); 
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleContainerClick = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (e) => {
        setQuestion(e.target.value);
        adjustHeight();
    };

    return (
        <div className="w-full py-4">
            <div className="relative max-w-xl w-full mx-auto">
                <div
                    role="textbox"
                    tabIndex={0}
                    aria-label="Ask a question"
                    className={cn(
                        "relative flex flex-col rounded-xl transition-all duration-200 w-full text-left cursor-text ring-1 ring-black/10 bg-gray-100",
                        isFocused && "ring-black/20"
                    )}
                    onClick={handleContainerClick}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            handleContainerClick();
                        }
                    }}>
                    <div className="overflow-y-auto max-h-[200px]">
                        <Textarea
                            id="ai-input-04"
                            value={question}
                            placeholder="Ask a question..."
                            className={cn(
                                "w-full rounded-xl rounded-b-none px-4 py-3 border-none resize-none focus-visible:ring-0 leading-[1.2] bg-gray-100 text-black placeholder:text-black/70"
                            )}
                            ref={textareaRef}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="h-12 rounded-b-xl bg-gray-200">
                        <div className="absolute left-3 bottom-3 flex items-center gap-2">
                            {/* File attachment */}
                            <label className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-black/10">
                                <input type="file" className="hidden" disabled/>
                                <Paperclip
                                    className="w-4 h-4 transition-colors text-black/40 hover:text-black" />
                            </label>
                            
                            {/* Search toggle button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSearch(!showSearch);
                                }}
                                className={cn(
                                    "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 cursor-pointer",
                                    showSearch
                                        ? "bg-sky-500/15 border-sky-400 text-sky-500"
                                        : "bg-black/5 border-transparent text-black/40 hover:text-black"
                                )}>
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    <motion.div
                                        animate={{
                                            rotate: showSearch ? 180 : 0,
                                            scale: showSearch ? 1.1 : 1,
                                        }}
                                        whileHover={{
                                            rotate: showSearch ? 180 : 15,
                                            scale: 1.1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 10,
                                            },
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 25,
                                        }}>
                                        <Globe
                                            className={cn("w-4 h-4", showSearch
                                                ? "text-sky-500"
                                                : "text-inherit")} />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {showSearch && (
                                        <motion.span
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{
                                                width: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm overflow-hidden whitespace-nowrap text-sky-500 shrink-0">
                                            Search
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                        
                        {/* Send button */}
                        <div className="absolute right-3 bottom-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !question.trim()}
                                className={cn(
                                    "rounded-lg p-2 transition-all duration-200",
                                    loading || !question.trim()
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
                                )}>
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}