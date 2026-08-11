"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Stats {
  online: number;
  queue: number;
  rooms: number;
}

export function LiveStats({ fallback = "" }: { fallback?: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();
    const onStats = (data: Stats) => setStats(data);
    s.on("stats", onStats);
    return () => {
      s.off("stats", onStats);
    };
  }, []);

  if (!stats) return <>{fallback}</>;
  return (
    <>
      {stats.online} online · {stats.queue} in queue · {stats.rooms} rooms live
    </>
  );
}