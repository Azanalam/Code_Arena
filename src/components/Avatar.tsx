"use client";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}

const COLORS = ["bg-blue-600", "bg-emerald-600", "bg-purple-600", "bg-rose-600", "bg-amber-600", "bg-cyan-600"];

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
      className={`rounded-full flex items-center justify-center font-bold text-white ${COLORS[colorIndex]} flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
