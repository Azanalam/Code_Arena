"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { Avatar } from "@/components/Avatar";
import type { LandingUser } from "./types";

export function Navbar({ user }: { user: LandingUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/70 border-b border-white/10 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-200 to-stone-400 flex items-center justify-center text-sm text-zinc-950 shadow-lg shadow-black/40">
            &lt;/&gt;
          </span>
          Code<span className="text-gradient">Arena</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/problems" className="hover:text-white transition-colors">Problems</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="/lobby" className="hover:text-white transition-colors">Play</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-300">
              <Avatar name={user.name} image={user.image} size={28} className="ring-1" />
              <span className="max-w-[120px] truncate">{user.name}</span>
            </div>
          ) : null}
          {user ? (
            <button
              onClick={() => signOut({ redirectTo: "/" })}
              className="hidden sm:inline-flex text-sm px-3.5 py-1.5 rounded-lg border border-white/15 hover:bg-white/10 text-zinc-300 transition-all"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn("google", { redirectTo: "/lobby" })}
              className="hidden sm:inline text-sm text-zinc-300 hover:text-white transition-colors"
            >
              Sign in
            </button>
          )}
          <Link
            href="/lobby"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 shadow-lg shadow-black/30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Play Now
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-zinc-300 p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden glass mx-4 mb-3 rounded-xl p-4 flex flex-col gap-3 text-sm text-zinc-300">
          <Link href="/problems" onClick={() => setOpen(false)} className="hover:text-white">Problems</Link>
          <Link href="/leaderboard" onClick={() => setOpen(false)} className="hover:text-white">Leaderboard</Link>
          <Link href="/lobby" onClick={() => setOpen(false)} className="hover:text-white">Play</Link>
          {user ? (
            <button onClick={() => signOut({ redirectTo: "/" })} className="text-left hover:text-white">Sign out</button>
          ) : (
            <button onClick={() => signIn("google", { redirectTo: "/lobby" })} className="text-left hover:text-white">Sign in</button>
          )}
        </div>
      )}
    </header>
  );
}