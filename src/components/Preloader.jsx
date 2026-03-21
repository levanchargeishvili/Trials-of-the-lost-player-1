import { useState, useEffect } from 'react';
import './Preloader.css';

// List all critical assets to preload
const ASSETS_TO_PRELOAD = {
  images: [
    new URL('../assets/images/b510_cjq1_210826.jpg', import.meta.url).href,
    new URL('../assets/eldenring/background.png', import.meta.url).href,
    new URL('../assets/eldenring/boss.png', import.meta.url).href,
    new URL('../assets/eldenring/boss_exhausted.png', import.meta.url).href,
    new URL('../assets/eldenring/drone.png', import.meta.url).href,
    new URL('../assets/eldenring/float.png', import.meta.url).href,
    new URL('../assets/eldenring/gold_coin.png', import.meta.url).href,
    new URL('../assets/eldenring/cheese.webp', import.meta.url).href,
    // Book images for library gate
    ...Array.from({ length: 24 }, (_, i) => new URL(`../assets/magicbook/64x64/book_image_${i + 1}.png`, import.meta.url).href),
    // Bee images
    new URL('../assets/bees-png/gojo.png', import.meta.url).href,
    new URL('../assets/bees-png/hakari.png', import.meta.url).href,
    new URL('../assets/bees-png/sukuna.png', import.meta.url).href,
    new URL('../assets/bees-png/killua.png', import.meta.url).href,
    new URL('../assets/bees-png/zoro.png', import.meta.url).href,
    new URL('../assets/bees-png/jon_snow.png', import.meta.url).href,
    new URL('../assets/bees-png/tyrion.png', import.meta.url).href,
    // Catan resources
    new URL('../assets/catan/blue.png', import.meta.url).href,
    new URL('../assets/catan/brick.png', import.meta.url).href,
    new URL('../assets/catan/desert.png', import.meta.url).href,
    new URL('../assets/catan/green.png', import.meta.url).href,
    new URL('../assets/catan/ore.png', import.meta.url).href,
    new URL('../assets/catan/red.png', import.meta.url).href,
    new URL('../assets/catan/sheep.png', import.meta.url).href,
    new URL('../assets/catan/wheat.png', import.meta.url).href,
    new URL('../assets/catan/wood.png', import.meta.url).href,
    new URL('../assets/catan/white.png', import.meta.url).href,
  ],
  audio: [
    new URL('../assets/audio/Game of Thrones.mp3', import.meta.url).href,
    new URL('../assets/audio/Bee Swarm Simulator  OST - Wax.mp3', import.meta.url).href,
    new URL('../assets/audio/Catan Universe Menu Theme.mp3', import.meta.url).href,
    new URL('../assets/audio/HAVA NAGILA (HARDTEKK).mp3', import.meta.url).href,
    new URL('../assets/audio/hava nagila.mp3', import.meta.url).href,
    new URL('../assets/bee-audio/hakari.mp3', import.meta.url).href,
  ]
};

function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Show skip button after 5 seconds
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 5000);

    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    const preloadAssets = async () => {
      const totalAssets = ASSETS_TO_PRELOAD.images.length + ASSETS_TO_PRELOAD.audio.length;
      let loaded = 0;

      const updateProgress = () => {
        loaded++;
        setLoadedCount(loaded);
        setProgress((loaded / totalAssets) * 100);
      };

      // Preload images
      setStatus('Loading images...');
      const imagePromises = ASSETS_TO_PRELOAD.images.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            updateProgress();
            resolve();
          };
          img.onerror = () => {
            // Continue even if an asset fails to load
            updateProgress();
            resolve();
          };
          img.src = src;
        });
      });

      // Preload audio
      setStatus('Loading audio...');
      const audioPromises = ASSETS_TO_PRELOAD.audio.map(src => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.oncanplaythrough = () => {
            updateProgress();
            resolve();
          };
          audio.onerror = () => {
            // Continue even if an asset fails to load
            updateProgress();
            resolve();
          };
          audio.src = src;
        });
      });

      // Wait for all assets to load
      await Promise.all([...imagePromises, ...audioPromises]);

      setStatus('Complete!');

      // Small delay before calling onComplete
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    preloadAssets();
  }, [onComplete]);

  return (
    <div className="preloader-container">
      <div className="preloader-content">
        <div className="preloader-title">TRIALS OF THE LOST PLAYER</div>
        <div className="preloader-subtitle">Loading Experience...</div>

        <div className="preloader-bar-container">
          <div className="preloader-bar">
            <div
              className="preloader-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="preloader-percentage">{Math.round(progress)}%</div>
        </div>

        <div className="preloader-status">
          {status}
          <div className="preloader-count">
            {loadedCount} / {ASSETS_TO_PRELOAD.images.length + ASSETS_TO_PRELOAD.audio.length} assets
          </div>
        </div>

        <div className="preloader-hint">
          This may take a moment depending on your connection...
        </div>

        {showSkip && progress < 100 && (
          <button className="preloader-skip" onClick={onComplete}>
            Skip and Continue →
          </button>
        )}
      </div>

      <div className="preloader-background">
        <div className="preloader-stars"></div>
        <div className="preloader-twinkling"></div>
      </div>
    </div>
  );
}

export default Preloader;
