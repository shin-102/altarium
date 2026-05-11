import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, NotebookPen, X } from "lucide-react";
import { PomodoroRing } from "./PomodoroRing";

type Item = { id: string; text: string; at: number };
const KEY = "deepfocus.distractions";

export function DistractionPanel() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => [{ id: crypto.randomUUID(), text: t, at: Date.now() }, ...prev]);
    setText("");
  };

  return (
    <Dialog.Root modal={false}>
      <Dialog.Trigger asChild>
        <button className="glass h-11 px-4 rounded-full flex items-center gap-2 text-sm hover:scale-[1.02] transition">
          <NotebookPen className="h-4 w-4" />
          <span className="font-light tracking-wide">Focus log</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          className="fixed bottom-20 left-6 glass-strong w-80 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 z-50 focus:outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <PomodoroRing />
            <Dialog.Close className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition" aria-label="Close">
              <ChevronDown className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="px-4 py-3">
            <Dialog.Title className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Distraction Log
            </Dialog.Title>

            <div className="max-h-56 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground italic font-light">
                  Park intrusive thoughts here. Return to them later.
                </p>
              )}
              {items.map((it) => (
                <div
                  key={it.id}
                  className="group flex items-start gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 transition"
                >
                  <p className="flex-1 text-sm leading-snug wrap-break-word">{it.text}</p>
                  <button
                    onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}
                    className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 focus-within:border-white/30 transition">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") add(); }}
                placeholder="Dump a thought..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 outline-none"
              />
              <button
                onClick={add}
                className="text-xs font-medium tracking-wide px-3 py-1.5 mr-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Log
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
