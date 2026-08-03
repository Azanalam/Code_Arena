const ITEMS = [
  "JavaScript", "HTML", "CSS", "40+ Problems", "Easy",
  "Medium", "Hard", "Real-time", "1v1 Battles", "AI Tutor",
  "Persistent Leaderboard", "Guest Play", "GitHub Login",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative border-y border-white/10 bg-white/[0.02] py-4 overflow-hidden">
      <div className="flex gap-10 whitespace-nowrap animate-marquee w-max">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 text-sm text-zinc-500">
            <span className="uppercase tracking-wide">{item}</span>
            <span className="text-blue-500/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}