import { useState, useEffect } from 'react';
import './Preloader.css';

// List all critical assets to preload
const ASSETS_TO_PRELOAD = {
  images: [
    '/src/assets/images/b510_cjq1_210826.jpg',
    '/assets/eldenring/background.png',
    '/assets/eldenring/boss.png',
    '/assets/eldenring/boss_exhausted.png',
    '/assets/eldenring/drone.png',
    '/assets/eldenring/float.png',
    '/assets/eldenring/gold_coin.png',
    '/assets/eldenring/cheese.webp',
    // Book images for library gate
    ...Array.from({ length: 24 }, (_, i) => `/assets/magicbook/64x64/book_image_${i + 1}.png`),
    // Bee images
    '/assets/bees-png/gojo.png',
    '/assets/bees-png/hakari.png',
    '/assets/bees-png/sukuna.png',
    '/assets/bees-png/killua.png',
    '/assets/bees-png/zoro.png',
    '/assets/bees-png/jon_snow.png',
    '/assets/bees-png/tyrion.png',
    // Catan resources
    '/assets/catan/blue.png',
    '/assets/catan/brick.png',
    '/assets/catan/desert.png',
    '/assets/catan/green.png',
    '/assets/catan/ore.png',
    '/assets/catan/red.png',
    '/assets/catan/sheep.png',
    '/assets/catan/wheat.png',
    '/assets/catan/wood.png',
    '/assets/catan/white.png',
  ],
  audio: [
    '/src/assets/audio/Game of Thrones.mp3',
    '/src/assets/audio/Bee Swarm Simulator  OST - Wax.mp3',
    '/src/assets/audio/Catan Universe Menu Theme.mp3',
    '/src/assets/audio/HAVA NAGILA (HARDTEKK).mp3',
    '/src/assets/audio/hava nagila.mp3',
    '/src/assets/bee-audio/hakari.mp3',
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
