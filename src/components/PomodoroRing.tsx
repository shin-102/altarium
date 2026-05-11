import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

export function PomodoroRing() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [seconds, setSeconds] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          const next = mode === "focus" ? "break" : "focus";
          setMode(next);
          return next === "focus" ? FOCUS : BREAK;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, mode]);

  const total = mode === "focus" ? FOCUS : BREAK;
  const progress = 1 - seconds / total;
  const r = 22;
  const c = 2 * Math.PI * r;
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  const reset = () => { setRunning(false); setMode("focus"); setSeconds(FOCUS); };

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 50 50" className="h-full w-full -rotate-90">
          <circle cx="25" cy="25" r={r} stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" fill="none" />
          <circle
            cx="25" cy="25" r={r}
            stroke="currentColor" strokeWidth="3" fill="none"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] tabular-nums font-medium">
          {m}:{s}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {mode === "focus" ? "Focus" : "Break"}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setRunning((r) => !r)}
            className="h-7 w-7 rounded-full glass flex items-center justify-center hover:scale-105 transition"
            aria-label={running ? "Pause" : "Start"}
          >
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
          <button
            onClick={reset}
            className="h-7 w-7 rounded-full glass flex items-center justify-center hover:scale-105 transition"
            aria-label="Reset"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
