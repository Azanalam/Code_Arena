"use client";

import { useState } from "react";
import { getSocket } from "@/lib/socket";

export function AiHint() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleHint = () => {
    if (loading || cooldown > 0) return;
    setLoading(true);
    getSocket().emit("request-hint");
    setLoading(false);
    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <button
      onClick={handleHint}
      disabled={loading || cooldown > 0}
      className="px-3 py-1.5 text-xs font-medium rounded bg-zinc-200 hover:bg-zinc-100 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 transition-colors"
    >
      {cooldown > 0 ? `Hint (${cooldown}s)` : loading ? "Thinking..." : "AI Hint"}
    </button>
  );
}
