import { useState } from 'react';
import './AudioEnabler.css';

/**
 * AudioEnabler - Requires user interaction to enable audio autoplay
 * This component solves the browser autoplay policy restrictions
 */
function AudioEnabler({ onEnter }) {
  const [isHovering, setIsHovering] = useState(false);

  const handleEnter = () => {
    // Play a silent audio to unlock audio context
    const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4Qw');
    silentAudio.play().catch(() => {});

    // Signal that user has interacted
    onEnter();
  };

  return (
    <div className="audio-enabler-container">
      <div className="audio-enabler-content">
        <h1 className="audio-enabler-title">TRIALS OF THE LOST PLAYER</h1>
        <p className="audio-enabler-subtitle">A Dark Interactive Experience</p>

        <div className="audio-enabler-warning">
          <div className="warning-icon">⚠️</div>
          <p>This experience contains audio and visual effects.</p>
          <p>Click below to enable sound and begin your journey.</p>
        </div>

        <button
          className={`audio-enabler-btn ${isHovering ? 'hovering' : ''}`}
          onClick={handleEnter}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <span className="btn-text">ENTER</span>
          <div className="btn-glow"></div>
        </button>

        <div className="audio-enabler-hint">
          Click anywhere to continue
        </div>
      </div>

      <div className="audio-enabler-background">
        <div className="bg-stars"></div>
        <div className="bg-twinkling"></div>
      </div>
    </div>
  );
}

export default AudioEnabler;
