"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";

export function ProblemPanel() {
  const { problem, status } = useGameStore();
  const [tab, setTab] = useState<"description" | "examples">("description");

  if (!problem) {
    return (
      <div className="h-full bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          {status === "waiting" ? (
            <>
              <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-zinc-500 text-xs">Waiting for host to start...</p>
            </>
          ) : (
            <>
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-zinc-600 text-xs">Loading problem...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const diffColor =
    problem.difficulty === "easy" ? "text-green-400 bg-green-900/20" :
    problem.difficulty === "medium" ? "text-yellow-400 bg-yellow-900/20" :
    "text-red-400 bg-red-900/20";

  return (
    <div className="h-full flex flex-col bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
        <h2 className="text-white font-semibold text-sm">{problem.title}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${diffColor}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="flex border-b border-zinc-800 text-xs">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            tab === "description"
              ? "text-white border-b-2 border-blue-500 bg-blue-900/10"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setTab("description")}
        >
          Description
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            tab === "examples"
              ? "text-white border-b-2 border-blue-500 bg-blue-900/10"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setTab("examples")}
        >
          Examples
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm text-zinc-300 space-y-4">
        {tab === "description" ? (
          <div
            className="prose prose-invert prose-sm max-w-none [&_code]:text-blue-300 [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_li]:text-zinc-300 [&_ol]:space-y-2"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        ) : (
          <div className="space-y-3">
            {problem.examples.map((ex: any, i: number) => (
              <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-zinc-500">Example {i + 1}</div>
                <div>
                  <span className="text-zinc-500 text-xs">Input:</span>
                  <pre className="mt-0.5 text-white font-mono text-xs bg-zinc-900/50 p-2 rounded">{ex.input}</pre>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Output:</span>
                  <pre className="mt-0.5 text-green-300 font-mono text-xs bg-zinc-900/50 p-2 rounded">{ex.output}</pre>
                </div>
                {ex.explanation && (
                  <div>
                    <span className="text-zinc-500 text-xs">Explanation:</span>
                    <p className="mt-0.5 text-xs text-zinc-400">{ex.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
