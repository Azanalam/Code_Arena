"use client";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}

const COLORS = ["bg-zinc-300", "bg-stone-400", "bg-neutral-500", "bg-zinc-500", "bg-stone-300", "bg-neutral-400"];

export function Avatar({ name, image, size = 32, className = "" }: AvatarProps) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const colorIndex = (name ?? "").length % COLORS.length;

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? ""}
        style={{ width: size, height: size }}
        className={`rounded-full ring-2 ring-zinc-700 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      className={`rounded-full flex items-center justify-center font-bold text-zinc-950 ${COLORS[colorIndex]} flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
