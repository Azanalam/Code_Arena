"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getSocket } from "@/lib/socket";

export function Chat() {
  const [input, setInput] = useState("");
  const { chatMessages, myUserId, roomId } = useGameStore();

  const handleSend = () => {
    if (!input.trim()) return;
    getSocket().emit("chat-message", { roomId, text: input.trim() });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-sm font-medium text-zinc-400 border-b border-zinc-700">
        Chat
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${msg.userId === "ai" ? "text-emerald-400" : msg.userId === myUserId ? "text-blue-400" : "text-zinc-300"}`}
          >
            <span className="font-medium">{msg.name}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-zinc-700">
        <input
          className="w-full bg-zinc-800 text-sm text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
      </div>
    </div>
  );
}
