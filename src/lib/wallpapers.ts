export type Wallpaper = {
  id: string;
  name: string;
  className: string;
  imageUrl?: string;   // if set, real photo; otherwise CSS gradient
  rain?: boolean;
};

export const WALLPAPERS: Wallpaper[] = [
  // ── Gradient moods ──────────────────────────────────────────────────────
  { id: "rain",    name: "Rain on Window", className: "wp-rain",    rain: true },
  { id: "forest",  name: "Misty Forest",   className: "wp-forest"  },
  { id: "library", name: "Warm Library",   className: "wp-library" },
  { id: "night",   name: "Night City",     className: "wp-night"   },
  { id: "ocean",   name: "Deep Ocean",     className: "wp-ocean"   },
  { id: "sunset",  name: "Golden Sunset",  className: "wp-sunset"  },

  // ── Real photos (Unsplash, no API key needed) ────────────────────────────
  {
    id: "photo-forest",
    name: "Pine Forest",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80&fit=crop",
  },
  {
    id: "photo-rain",
    name: "Rainy Street",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=80&fit=crop",
    rain: true,
  },
  {
    id: "photo-library",
    name: "Old Library",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80&fit=crop",
  },
  {
    id: "photo-mountain",
    name: "Mountain Mist",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80&fit=crop",
  },
  {
    id: "photo-ocean",
    name: "Calm Ocean",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80&fit=crop",
  },
  {
    id: "photo-night",
    name: "City at Night",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80&fit=crop",
  },
  {
    id: "photo-cabin",
    name: "Cozy Cabin",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=1920&q=80&fit=crop",
  },
  {
    id: "photo-desert",
    name: "Desert Dusk",
    className: "wp-photo",
    imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80&fit=crop",
  },
];
