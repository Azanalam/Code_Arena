"use client";

import { signIn, signOut } from "next-auth/react";

interface HeroProps {
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export function Hero({ user }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white px-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Code<span className="text-blue-500">Arena</span>
          </h1>
          <p className="text-zinc-500 text-base">
            Real-time multiplayer coding battles
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Problems", value: "10+" },
            { label: "Players", value: "2-4" },
            { label: "Timer", value: "10min" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              {user.image && (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full ring-2 ring-zinc-700" />
              )}
              <span className="text-zinc-400">{user.name}</span>
            </div>
            <div className="flex gap-3 justify-center">
              <a
                href="/lobby"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all"
              >
                Play Now
              </a>
              <button
                onClick={() => signOut()}
                className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <a
              href="/lobby"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all"
            >
              Play as Guest
            </a>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-zinc-950 text-zinc-600">or sign in</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => signIn("github", { redirectTo: "/" })}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-all text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </button>
              <button
                onClick={() => signIn("google", { redirectTo: "/" })}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-all text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
