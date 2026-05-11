import { type Wallpaper } from "@/lib/wallpapers";

export function WallpaperLayer({ wallpaper }: { wallpaper: Wallpaper }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {wallpaper.imageUrl ? (
        <div
          className="wp-anim absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${wallpaper.imageUrl})` }}
        />
      ) : (
        <div className={`wp-anim ${wallpaper.className}`} />
      )}

      {wallpaper.rain && <div className="rain-overlay" />}
      <div className="vignette" />
    </div>
  );
}
