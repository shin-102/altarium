import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown, Music, Pause, Play, Volume2,
  RotateCcw, Repeat, Link2, Loader2,
} from "lucide-react";
import { SOUNDS, ambient, type SoundId } from "@/lib/ambient-audio";
import { extractVideoId, fetchYTMeta, type YTMeta } from "@/lib/youtube";
import { cn } from "@/lib/utils";

// ── TypeScript declarations ──────────────────────────────────────────────────

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLIFrameElement, opts: YTPlayerOptions) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
  interface YTPlayer {
    destroy():                                        void;
    pauseVideo():                                     void;
    playVideo():                                      void;
    loadVideoById(opts: { videoId: string }):         void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime():                                 number;
    getDuration():                                    number;
  }
  interface YTPlayerOptions {
    events?: {
      onReady?:       (e: { target: YTPlayer }) => void;
      onStateChange?: (e: { data: number; target: YTPlayer }) => void;
    };
  }
}

type Tab = "ambient" | "youtube";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(s: number): string {
  if (!isFinite(s) || s <= 0) return "0:00";
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

// ── YouTube player component ──────────────────────────────────────────────────
// Encapsulates the iframe + all player state so no refs leak into the parent.

interface YTPlayerHandle {
  loadVideo(videoId: string): void;
  togglePlay():                void;
  seek(delta: number):         void;
  toggleLoop():                void;
  playing:     boolean;
  loop:        boolean;
  duration:    number;
  currentTime: number;
  iframeContainerRef: React.RefObject<HTMLDivElement | null>;
}

function useYTPlayer(): YTPlayerHandle {
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef          = useRef<YTPlayer | null>(null);
  const tickRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef            = useRef(false);

  const [playing,     setPlaying]     = useState(false);
  const [loop,        setLoop]        = useState(false);
  const [duration,    setDuration]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => { loopRef.current = loop; }, [loop]);

  useEffect(() => {
    const initPlayer = () => {
      const container = iframeContainerRef.current;
      if (!container || !window.YT?.Player) return;

      const iframe = document.createElement("iframe");
      iframe.src           = "https://www.youtube.com/embed/?enablejsapi=1&controls=0";
      iframe.allow         = "autoplay";
      iframe.title         = "yt-audio";
      iframe.style.cssText = "width:0;height:0;border:none;position:absolute;pointer-events:none";
      container.appendChild(iframe);

      playerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady() {
            // Optional: setDuration(playerRef.current.getDuration());
          },
          onStateChange(e: { data: number; target: YTPlayer }) {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
              setPlaying(true);
              setDuration(playerRef.current?.getDuration() ?? 0);
              tickRef.current = setInterval(() => {
                setCurrentTime(playerRef.current?.getCurrentTime() ?? 0);
              }, 500);
            } else {
              setPlaying(false);
              if (tickRef.current) {
                clearInterval(tickRef.current);
                tickRef.current = null;
              }
              if (e.data === S.ENDED && loopRef.current) {
                playerRef.current?.playVideo();
              }
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src   = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const loadVideo = (videoId: string) => {
    playerRef.current?.loadVideoById({ videoId });
    setDuration(0);
    setCurrentTime(0);
    setPlaying(false);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    // FIXED: Use if/else instead of naked ternary expression
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seek = (delta: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo((playerRef.current.getCurrentTime() ?? 0) + delta, true);
  };

  const toggleLoop = () => setLoop((l) => !l);

  return {
    playing, loop, duration, currentTime,
    loadVideo, togglePlay, seek, toggleLoop,
    iframeContainerRef
  };
}

// 2. Export the container to be used in the JSX
export function YTContainer({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    />
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function AmbientPanel() {
  const [tab, setTab] = useState<Tab>("ambient");
  const [current, setCurrent] = useState<SoundId | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [urlInput, setUrlInput] = useState("");
  const [activeVideo, setActiveVideo] = useState<YTMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // FIXED: Use the hook instead of redefining all the logic here
  const {
    playing, loop, duration, currentTime,
    loadVideo, togglePlay, seek, toggleLoop,
    iframeContainerRef
  } = useYTPlayer();

  const progress = activeVideo && duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => () => ambient.stop(), []);

  const toggleSound = (id: SoundId) => {
    if (current === id) { ambient.stop(); setCurrent(null); }
    else { ambient.play(id); setCurrent(id); }
  };

  const setVol = (v: number) => { setVolume(v); ambient.setVolume(v); };

  const loadUrl = async () => {
    const id = extractVideoId(urlInput.trim());
    if (!id) { setLoadError("Couldn't find a video ID in that URL."); return; }
    setLoading(true);
    setLoadError("");
    try {
      const meta = await fetchYTMeta(id);
      setActiveVideo(meta);
      loadVideo(meta.videoId);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Failed to load video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root modal={false}>
      {/* Hidden container — always in the DOM, never conditional */}
      <div
        ref={iframeContainerRef}
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      />

      <Dialog.Trigger asChild>
        <button className="glass h-11 px-4 rounded-full flex items-center gap-2 text-sm hover:scale-[1.02] transition">
          <Music className="h-4 w-4" />
          <span className="font-light tracking-wide">Ambient</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          className="fixed bottom-20 right-6 glass-strong w-80 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 z-50 focus:outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <Dialog.Title className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Soundscape
              </Dialog.Title>
            </div>
            <Dialog.Close className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition">
              <ChevronDown className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Tab bar */}
          <div className="flex px-4 pt-3 gap-2">
            {(["ambient", "youtube"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-1.5 text-xs rounded-lg transition capitalize",
                  tab === t ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70",
                )}
              >
                {t === "youtube" ? "YouTube" : "Ambient"}
              </button>
            ))}
          </div>

          {/* ── Ambient tab ── */}
          {tab === "ambient" && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {SOUNDS.map((s) => {
                  const active = current === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSound(s.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border text-xs transition",
                        active
                          ? "bg-white/15 border-white/40 text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90",
                      )}
                    >
                      {active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span className="font-light">{s.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-white/40 shrink-0" />
                <input
                  type="range" min={0} max={1} step={0.01}
                  value={volume}
                  onChange={(e) => setVol(parseFloat(e.target.value))}
                  className="flex-1 accent-white h-1 cursor-pointer"
                />
                <span className="text-[11px] text-white/40 min-w-7 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* ── YouTube tab ── */}
          {tab === "youtube" && (
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") loadUrl(); }}
                    placeholder="Paste YouTube URL…"
                    className="w-full bg-white/7 border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30 transition"
                  />
                </div>
                <button
                  onClick={loadUrl}
                  disabled={loading}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs text-white transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Load"}
                </button>
              </div>

              {loadError && <p className="text-xs text-red-400/80">{loadError}</p>}

              {activeVideo && (
                <>
                  <div className="flex items-center gap-2.5 p-2 bg-white/5 border border-white/10 rounded-xl">
                    <img
                      src={activeVideo.thumbnail}
                      className="w-14 h-9 rounded object-cover shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white truncate">{activeVideo.title}</p>
                      {activeVideo.isLive && <span className="text-[10px] text-red-400/80">● Live</span>}
                    </div>
                  </div>

                  <div className="bg-white/7 border border-white/12 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => seek(-10)}
                        aria-label="Rewind 10 seconds"
                        className="text-white/60 hover:text-white transition p-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={togglePlay}
                        aria-label={playing ? "Pause" : "Play"}
                        className="bg-white/15 hover:bg-white/25 transition h-8 w-8 rounded-full flex items-center justify-center text-white"
                      >
                        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => seek(10)}
                        aria-label="Forward 10 seconds"
                        className="text-white/60 hover:text-white transition p-1 scale-x-[-1]"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={toggleLoop}
                        aria-label="Toggle loop"
                        className={cn("transition p-1", loop ? "text-white" : "text-white/30 hover:text-white/60")}
                      >
                        <Repeat className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/70 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/35">
                      <span>{fmt(currentTime)}</span>
                      <span>{activeVideo.isLive ? "∞ live" : fmt(duration)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Volume2 className="h-4 w-4 text-white/40 shrink-0" />
                <input
                  type="range" min={0} max={1} step={0.01}
                  value={volume}
                  onChange={(e) => setVol(parseFloat(e.target.value))}
                  className="flex-1 accent-white h-1 cursor-pointer"
                />
                <span className="text-[11px] text-white/40 min-w-7 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          )}

          <Dialog.Description className="sr-only">
            Ambient sound selection and YouTube audio player with volume control
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
