import { useEffect, useState } from "react";

export function useAutoHide(timeoutMs = 5000) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let t: number | undefined;
    const reset = () => {
      setVisible(true);
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => setVisible(false), timeoutMs);
    };
    reset();
    const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (t) window.clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeoutMs]);

  return visible;
}
