"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";

export function ProblemPanel() {
  const { problem } = useGameStore();
  const [tab, setTab] = useState<"description" | "examples">("description");

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Waiting for problem...
      </div>
    );
  }

  const diffColor =
    problem.difficulty === "easy"
      ? "text-green-400"
      : problem.difficulty === "medium"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-700">
        <h2 className="text-white font-semibold">{problem.title}</h2>
        <span className={`text-xs font-medium ${diffColor}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="flex border-b border-zinc-700 text-sm">
        <button
          className={`px-4 py-2 ${tab === "description" ? "text-white border-b-2 border-blue-500" : "text-zinc-500"}`}
          onClick={() => setTab("description")}
        >
          Description
        </button>
        <button
          className={`px-4 py-2 ${tab === "examples" ? "text-white border-b-2 border-blue-500" : "text-zinc-500"}`}
          onClick={() => setTab("examples")}
        >
          Examples
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm text-zinc-300 space-y-4">
        {tab === "description" ? (
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        ) : (
          problem.examples.map((ex, i) => (
            <div key={i} className="bg-zinc-800 rounded p-3 space-y-2">
              <div>
                <span className="text-zinc-500">Input:</span>
                <pre className="mt-1 text-white font-mono text-xs">{ex.input}</pre>
              </div>
              <div>
                <span className="text-zinc-500">Output:</span>
                <pre className="mt-1 text-white font-mono text-xs">{ex.output}</pre>
              </div>
              {ex.explanation && (
                <div>
                  <span className="text-zinc-500">Explanation:</span>
                  <p className="mt-1 text-xs">{ex.explanation}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
