import { useState, useRef, useEffect } from 'react';
import './GateMusic.css';

/**
 * Simple music player for individual gates
 * @param {string} src - Audio file path
 * @param {boolean} autoplay - Whether to autoplay (default: true)
 * @param {number} initialVolume - Starting volume 0-1 (default: 0.2 = 20%)
 */
function GateMusic({ src, autoplay = true, initialVolume = 0.2, onTrackChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (autoplay) {
      // Small delay to ensure audio context is ready
      const timer = setTimeout(() => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((error) => {
              console.log('Autoplay prevented:', error);
              setIsPlaying(false);
              // Auto-retry once after a delay
              setTimeout(() => {
                audio.play()
                  .then(() => setIsPlaying(true))
                  .catch(() => setIsPlaying(false));
              }, 1000);
            });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [src, autoplay, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Notify parent when track changes (for Gate 4 phase switching)
    if (onTrackChange) {
      onTrackChange(src);
    }
  }, [src, onTrackChange]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <>
      <div className="gate-music-toggle">
        <button
          className="gate-music-btn"
          onClick={() => setShowControls(!showControls)}
          title="Music Controls"
        >
          🎵
        </button>
      </div>

      {showControls && (
        <div className="gate-music-panel">
          <button className="gate-music-close" onClick={() => setShowControls(false)}>
            ✕
          </button>
          <div className="gate-music-controls">
            <button className="gate-music-play-btn" onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="gate-music-volume">
              <span className="gate-music-vol-label">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="gate-music-slider"
              />
              <span className="gate-music-vol-value">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} loop>
        <source src={src} type="audio/mpeg" />
      </audio>
    </>
  );
}

export default GateMusic;
