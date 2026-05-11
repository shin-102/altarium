import { useEffect, useState } from "react";

const STORAGE_KEY = "altarium_intro_seen";

interface IntroScreenProps {
  onDone: () => void;
}

export default function IntroScreen({ onDone }: IntroScreenProps) {
  const [dismissing, setDismissing] = useState(false);

  const dismiss = () => {
    setDismissing(true);
    // localStorage.setItem(STORAGE_KEY, "1");
    // Wait for fade-out to finish before unmounting
    setTimeout(onDone, 700);
  };

  // Allow keyboard dismiss
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className={`intro-screen${dismissing ? " intro-screen--out" : ""}`}
      onClick={dismiss}
      role="button"
      aria-label="Enter Altarium"
      tabIndex={0}
    >
      <div className="intro-stars" aria-hidden="true" />
      <div className="intro-orb" aria-hidden="true" />

      {/* Logo mark — swap the SVG contents once you have a real logo */}
      <div className="intro-logo" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="32,6 58,54 6,54"
            stroke="rgba(180,200,255,0.6)"
            strokeWidth="1.5"
            fill="rgba(100,140,220,0.08)"
          />
          <polygon
            points="32,18 48,46 16,46"
            stroke="rgba(180,200,255,0.35)"
            strokeWidth="1"
            fill="rgba(100,140,220,0.06)"
          />
          <circle cx="32" cy="32" r="2.5" fill="rgba(200,220,255,0.9)" />
          <line
            x1="32" y1="6" x2="32" y2="58"
            stroke="rgba(180,200,255,0.15)"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      <div className="intro-wordmark">
        <h1 className="intro-title">ALTARIUM</h1>
        <p className="intro-tagline">Your sanctuary of focus</p>
      </div>

      <span className="intro-hint" aria-hidden="true">
        click anywhere to enter
      </span>

      <div className="intro-line" aria-hidden="true" />
    </div>
  );
}

/** Call this once at startup — returns true if the intro should be shown. */
/* eslint-disable */
export function shouldShowIntro(): boolean {
  return !localStorage.getItem(STORAGE_KEY);
}
