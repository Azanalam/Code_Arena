"use client";

import { signIn, signOut } from "next-auth/react";

interface HeroProps {
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export function Hero({ user }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">
          Code<span className="text-blue-500">Arena</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Real-time multiplayer coding battles. Solve problems, compete with friends,
          level up your skills.
        </p>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              {user.image && (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
              )}
              <span className="text-zinc-300">{user.name}</span>
            </div>
            <div className="flex gap-3 justify-center">
              <a
                href="/lobby"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                Play Now
              </a>
              <button
                onClick={() => signOut()}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => signIn("github")}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
            >
              Sign in with GitHub
            </button>
            <button
              onClick={() => signIn("google")}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
