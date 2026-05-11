import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, X, Wallpaper as ImageIcon } from "lucide-react";
import { WALLPAPERS, type Wallpaper } from "@/lib/wallpapers";
import { cn } from "@/lib/utils";

type Props = {
  current: Wallpaper;
  onSelect: (w: Wallpaper) => void;
};

const gradients = WALLPAPERS.filter((w) => !w.imageUrl);
const photos    = WALLPAPERS.filter((w) =>  w.imageUrl);

function WallpaperThumb({
  wallpaper,
  className,
}: {
  wallpaper: Wallpaper;
  className?: string;
}) {
  if (wallpaper.imageUrl) {
    return (
      <div
        className={cn("absolute inset-0 bg-cover bg-center transition-transform duration-500", className)}
        style={{ backgroundImage: `url(${wallpaper.imageUrl})` }}
      />
    );
  }
  return <div className={cn(`absolute inset-0 ${wallpaper.className}`, className)} />;
}

export function WallpaperPicker({ current, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const select = (w: Wallpaper) => {
    // Retains the current rain toggle state even when changing wallpapers.
    // If you prefer wallpapers to reset to their default rain state, just pass `w` instead.
    onSelect({ ...w, rain: current.rain });
    setOpen(false);
  };

  const toggleRain = () => {
    onSelect({ ...current, rain: !current.rain });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <Dialog.Trigger asChild>
        <button
          aria-label="Change wallpaper"
          className="group relative h-12 w-12 rounded-full overflow-hidden border border-white/20 shadow-lg transition-transform active:scale-95 hover:scale-110"
        >
          <WallpaperThumb
            wallpaper={current}
            className="group-hover:scale-110 blur-md"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          <ImageIcon className="relative z-10 h-4 w-4 m-auto text-white drop-shadow-md" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl overflow-y-auto max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <Dialog.Title className="text-xl font-medium tracking-tight text-white">
              Appearance
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          <p className="text-sm text-white/50 mb-5">
            Select a theme to set the mood of your workspace.
          </p>

          {/* Real photos (Full Cards) */}
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 my-3">
            Photos
          </p>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((w) => (
              <WallpaperCard
                key={w.id}
                wallpaper={w}
                isActive={w.id === current.id}
                onSelect={select}
              />
            ))}
          </div>

          {/* Gradient moods (Simple Circles) */}
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 my-3">
            Moods
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
            {gradients.map((w) => (
              <MoodCircle
                key={w.id}
                wallpaper={w}
                isActive={w.id === current.id}
                onSelect={select}
              />
            ))}
          </div>

          {/* Rain Toggle Element */}
          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <h4 className="text-sm font-medium text-white">Rain Overlay</h4>
              <p className="text-xs text-white/50 mt-0.5">Add falling rain to your current background</p>
            </div>
            <button
              role="switch"
              aria-checked={current.rain || false}
              onClick={toggleRain}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                current.rain ? "bg-blue-500" : "bg-white/20"
              )}
            >
              <span className="sr-only">Toggle rain</span>
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  current.rain ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <Dialog.Description className="sr-only">
            Choose a wallpaper or mood theme for your workspace background.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

{/* New MoodCircle Component */}
function MoodCircle({
  wallpaper,
  isActive,
  onSelect,
}: {
  wallpaper: Wallpaper;
  isActive: boolean;
  onSelect: (w: Wallpaper) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onSelect(wallpaper)}
        className={cn(
          "group relative h-14 w-14 overflow-hidden rounded-full transition-all shrink-0",
          isActive
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900"
            : "ring-1 ring-white/10 hover:ring-white/30"
        )}
      >
        <WallpaperThumb wallpaper={wallpaper} className="group-hover:scale-110" />

        {isActive && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Check className="h-5 w-5 text-white drop-shadow-md stroke-3" />
          </div>
        )}
      </button>
      <span className="text-[10px] font-medium text-white/70 text-center leading-tight">
        {wallpaper.name}
      </span>
    </div>
  );
}

{/* Original WallpaperCard Component */}
function WallpaperCard({
  wallpaper,
  isActive,
  onSelect,
}: {
  wallpaper: Wallpaper;
  isActive: boolean;
  onSelect: (w: Wallpaper) => void;
}) {
  return (
    <button
      onClick={() => onSelect(wallpaper)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-xl border-2 transition-all",
        isActive
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-transparent hover:border-white/30"
      )}
    >
      <WallpaperThumb wallpaper={wallpaper} className="group-hover:scale-110" />

      {/* Bottom gradient for label readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

      <span className="absolute bottom-2 left-2 text-[11px] font-medium text-white/90">
        {wallpaper.name}
      </span>

      {isActive && (
        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
          <Check className="h-3 w-3 stroke-3" />
        </div>
      )}
    </button>
  );
}
