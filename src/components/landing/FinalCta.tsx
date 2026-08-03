"use client";

import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="relative py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden px-8 py-16 sm:py-20 text-center">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-700/30 via-purple-700/20 to-fuchsia-700/30" />
            <div className="absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-500/30 blur-3xl animate-aurora" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-purple-500/30 blur-3xl animate-aurora" style={{ animationDelay: "-7s" }} />

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Ready to <span className="text-gradient">race someone</span>?
            </h2>
            <p className="mt-4 text-zinc-300 max-w-lg mx-auto leading-relaxed">
              No downloads, no setup. Jump straight into a live coding battle — your code, your pace, your crown.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a
                href="/lobby"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.03]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Start a Battle
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}