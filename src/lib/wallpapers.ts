import Nier from "@/assets/nier ruins of a forgotten.webp"
import ForestTemple from "@/assets/zelda forest temple.webp"
import PlainField from "@/assets/zelda plain fields.webp"
import Borealis from "@/assets/gabriel nagypal - Borealis Portal.webp"
import SnowRunner from "@/assets/andrey bezrodnykh - snowrunner.webp"
import Canyon from "@/assets/aaron limonick - canyons.webp"

export type Wallpaper = {
  id: string;
  name: string;
  className: string;
  imageUrl?: string;   // if set, real photo; otherwise CSS gradient
  rain?: boolean;
};

export const WALLPAPERS: Wallpaper[] = [
  // ── Real images ────────────────────────────
  {
    id: "nier",
    name: "Ruins of a Forgotten",
    className: "wp-photo",
    imageUrl: Nier
  },
  {
    id: "zelda-forest",
    name: "Forest Temple",
    className: "wp-photo",
    imageUrl: ForestTemple
  },
  {
    id: "zelda-plain",
    name: "Plain Fields",
    className: "wp-photo",
    imageUrl: PlainField
  },
  {
    id: "borealis",
    name: "Borealis Portal",
    className: "wp-photo",
    imageUrl: Borealis
  },
  {
    id: "snowrunner",
    name: "Snowrunner",
    className: "wp-photo",
    imageUrl: SnowRunner
  },
  {
    id: "canyon",
    name: "Canyons",
    className: "wp-photo",
    imageUrl: Canyon
  },

  // ── Gradient moods ──────────────────────────────────────────────────────
  { id: "indigo",    name: "Indigo", className: "wp-indigo"    },
  { id: "emerald",  name: "Emerald",   className: "wp-emerald"  },
  { id: "amber", name: "Amber",   className: "wp-amber" },
  { id: "violet",   name: "Violet",     className: "wp-violet"   },
  { id: "azure",   name: "Azure",     className: "wp-azure"   },
  { id: "crimson",  name: "Crimson",  className: "wp-crimson"  }
];
