"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  profileId: string | null;
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your career assistant. I can explain your job matches, help with cover letters, or answer questions about your career. What's on your mind?",
};

export default function ChatBot({ profileId }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll na kraj kad stigne nova poruka
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input kad se otvori chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profileId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessages([...newMessages, data.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Rollback: ukloni user poruku ako je puklo
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  };

  return (
    <>
      {/* Floating button (zatvoren state) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-[#d97757] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center group"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Pulse indicator */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full">
            <span className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
          </span>
        </button>
      )}

      {/* Chat panel (otvoren state) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-4rem)] sm:w-85.5 h-150 max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-stone-900 px-4 py-3 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-[#d97757] to-orange-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-900" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">
                  Career Assistant
                </h3>
                <p className="text-stone-400 text-xs">
                  {profileId ? "Personalized" : "Ask anything"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={handleReset}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
                  aria-label="Reset conversation"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
            {!profileId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                💡 <strong>Tip:</strong> Fill out the profile form first to get
                personalized advice about your matches.
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-stone-900 text-white rounded-br-md"
                      : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-[#d97757] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-[#d97757] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-[#d97757] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-stone-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-[#d97757] focus:border-transparent outline-none resize-none disabled:opacity-50"
                style={{ maxHeight: "100px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 bg-[#d97757] hover:bg-orange-600 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5 text-center">
              Powered by Claude · Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
}
