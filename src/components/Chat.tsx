"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { getSocket } from "@/lib/socket";

export function Chat() {
  const [input, setInput] = useState("");
  const { chatMessages, myUserId, roomId } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    getSocket().emit("chat-message", { roomId, text: input.trim() });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
        Chat
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs leading-relaxed ${
              msg.userId === "ai" ? "text-emerald-400 bg-emerald-900/10 p-1.5 rounded" :
              msg.userId === "system" ? "text-zinc-500 italic" :
              msg.userId === myUserId ? "text-blue-400" : "text-zinc-300"
            }`}
          >
            <span className="font-medium">{msg.name}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 border-t border-zinc-800">
        <div className="flex gap-1.5">
          <input
            className="flex-1 bg-zinc-800 text-xs text-white rounded-md px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-600"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-700 text-white text-xs rounded-md transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
