import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-zinc-200 to-stone-400 flex items-center justify-center text-xs text-zinc-950 shadow-lg shadow-black/40">
            &lt;/&gt;
          </span>
          Code<span className="text-gradient">Arena</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
          <Link href="/problems" className="hover:text-white transition-colors">Problems</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="/lobby" className="hover:text-white transition-colors">Play</Link>
          <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
        </nav>

        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} CodeArena · built for rapid fire brains
        </p>
      </div>
    </footer>
  );
}