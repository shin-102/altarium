import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const hour = now.getHours();
  const greet = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="text-center select-none">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">{greet}</div>
      <div className="text-7xl md:text-8xl font-extralight tabular-nums tracking-tight">{time}</div>
      <div className="mt-3 text-sm font-light text-muted-foreground tracking-wide">{date}</div>
    </div>
  );
}
