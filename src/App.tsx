import { useState } from 'react'
import { WALLPAPERS } from './lib/wallpapers';
import { useAutoHide } from './hooks/useAutoHide';
import { WallpaperLayer } from './components/WallpaperLayer';
import { WallpaperPicker } from './components/WallpaperPicker';
import { DistractionPanel } from './components/DistractionPanel';
import { AmbientPanel } from './components/AmbientPanel';
import { Clock } from './components/Clock';

function App() {
  const [wp, setWp] = useState(WALLPAPERS[0]);
  const visible = useAutoHide(5000);
  const cls = `auto-hide ${visible ? "" : "auto-hide-hidden"}`;

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <WallpaperLayer wallpaper={wp} />

      {/* Top-right: Utility/Settings */}
      <div className={`fixed top-6 right-6 z-20 ${cls}`}>
        <WallpaperPicker current={wp} onSelect={setWp} />
      </div>

      {/* Center: The Anchor */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Clock />
      </div>

      {/* Bottom Bar: Action Items */}
      <div className={`fixed bottom-6 left-6 right-6 flex justify-between items-end z-20 ${cls}`}>
        {/* Left side: Focus Logic */}
        <DistractionPanel />

        {/* Right side: Audio Logic */}
        <AmbientPanel />
      </div>
    </main>
  );
}

export default App
