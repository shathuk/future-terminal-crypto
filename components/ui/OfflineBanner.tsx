"use client";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", sync); };
  }, []);
  if (online) return null;
  return (
    <div role="alert" className="sticky top-0 z-30 bg-down px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-center text-sm text-white">
      Offline. Trading is unavailable until connection is restored.
    </div>
  );
}
