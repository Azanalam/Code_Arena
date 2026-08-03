"use client";

import { useEffect, useState } from "react";

const SNIPPETS = [
  `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) {
      return [seen.get(diff), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
  `function maxSubarray(nums) {
  let best = nums[0];
  let run = nums[0];
  for (let i = 1; i < nums.length; i++) {
    run = Math.max(nums[i], run + nums[i]);
    best = Math.max(best, run);
  }
  return best;
}`,
  `function isPalindrome(x) {
  if (x < 0) return false;
  let rev = 0, n = x;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return rev === x;
}`,
];

const TOKEN = /(\/\/.*$)|(\b(?:const|let|function|return|new|if|else|for|while|true|false|of)\b)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\b)/gm;

function highlight(line: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(TOKEN.source, "gm");
  let i = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(<span key={i++}>{line.slice(last, m.index)}</span>);
    const full = m[0];
    const cls = m[1] ? "text-zinc-500 italic"
      : m[2] ? "text-blue-400"
      : m[3] ? "text-amber-300"
      : m[4] ? "text-zinc-400"
      : "";
    out.push(<span key={i++} className={cls}>{full}</span>);
    last = m.index + full.length;
  }
  if (last < line.length) out.push(<span key={i++}>{line.slice(last)}</span>);
  return out;
}

function Typer({ code, onDone }: { code: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const done = count >= code.length;
  const lines = code.split("\n");

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 2600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c + 1), 14);
    return () => clearTimeout(t);
  }, [count, done, code, onDone]);

  return (
    <pre className="text-[13px] leading-6 font-mono text-zinc-300 overflow-hidden">
      {lines.map((line, li) => {
        const lineStart = lines.slice(0, li).join("\n").length + li;
        const visible = Math.max(0, count - lineStart);
        return (
          <div key={li} className="flex">
            <span className="w-8 shrink-0 text-right pr-4 text-zinc-700 select-none">{li + 1}</span>
            <span className="whitespace-pre">{highlight(line.slice(0, visible))}</span>
          </div>
        );
      })}
      <span className="inline-block w-2 h-4 bg-zinc-200 align-middle animate-caret" />
    </pre>
  );
}

export function TypingCode() {
  const [index, setIndex] = useState(0);

  return (
    <Typer
      key={index}
      code={SNIPPETS[index]}
      onDone={() => setIndex((i) => (i + 1) % SNIPPETS.length)}
    />
  );
}