import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GateMusic from '../components/GateMusic';
import './LandingPage.css';

/* The Tarnished seek grace at /elden-throneroom */
/* But can you decipher where to look? */
/* Hint: The ancients knew many ciphers... */

function LandingPage() {
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const handleNowClick = (e) => {
    // Check if the text contains a zero (0) instead of letter O
    const currentText = e.target.innerText;

    if (currentText.includes('0')) {
      // N0W on the homepage should route straight to Gate 1.
      setShowErrorMessage(false);
      navigate('/gate-1-library');
      return;
    } else {
      // They fixed it! Open bookshelf (case insensitive check for "now")
      const textLower = currentText.toLowerCase();
      if (textLower.includes('now')) {
        setShowBookshelf(true);
        console.log("%c✓ Well done, Tarnished. You may proceed.", "color: #00ff00; font-size: 14px; font-weight: bold;");
      }
    }
  };

  useEffect(() => {
    // Console puzzle messages
    console.log("%c⚔️ THE FIRST GATE ⚔️", "color: #8B0000; font-size: 20px; font-weight: bold;");
    console.log("%cTarnished... you dare enter?", "color: #666; font-size: 14px;");
    console.log("%cThe ancient cipher holds the key to your descent.", "color: #888; font-size: 12px;");
    console.log("%cHint: The Caesar walked 13 steps into darkness...", "color: #555; font-size: 11px; font-style: italic;");
    console.warn("⚠️ Seven false doors. One true path. Choose wisely.");
    console.log(" ");
    console.log("%cOnly those who inspect the shadows shall see the truth.", "color: #333; font-size: 10px;");

    // Create falling numbers
    const createFallingNumber = () => {
      const numbers = ['4', '0', '1'];
      const number = numbers[Math.floor(Math.random() * numbers.length)];
      const numberElement = document.createElement('div');
      numberElement.className = 'falling-number';
      numberElement.textContent = number;
      numberElement.style.left = Math.random() * 100 + '%';
      numberElement.style.animationDuration = (Math.random() * 15 + 20) + 's'; // Slower: 20-35s
      numberElement.style.opacity = Math.random() * 0.4 + 0.2;
      numberElement.style.fontSize = (Math.random() * 8 + 16) + 'px';

      document.querySelector('.landing-container').appendChild(numberElement);

      setTimeout(() => {
        numberElement.remove();
      }, 40000);
    };

    // Create initial numbers spread across the screen
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createFallingNumber(), i * 300);
    }

    // Keep creating numbers constantly
    const interval = setInterval(() => {
      createFallingNumber();
    }, 800); // Create a new number every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">

      <GateMusic src="/src/assets/audio/Game of Thrones.mp3" />

      <div className="stars"></div>
      <div className="twinkling"></div>

      <div className="content">
        <div className="title-container">
          <div className="glitch-wrapper">
            <h1 className="title glitch" data-text="Anniversary I">
              Anniversary I
            </h1>
            <h2 className="subtitle glitch" data-text="Trials of the Lost Player">Trials of the Lost Player</h2>
          </div>
          <div className="title-border"></div>
        </div>

        <div className="lore-text">
          <p className="greeting">Tarnished...</p>

          <p>You stand at the threshold of a nightmare.<br />
          A journey from which few return whole.</p>

          <p><span className="yair-text">Yair Taito</span> has forged <span className="highlight">Four Gates</span><br />
          to test your foolish ambitions.<br />
          Each darker and more twisted than the last.</p>

          <p className="worlds">Cursed thrones. Forgotten realms. Haunted hives.<br />
          Broken roads. And the void beyond.</p>

          <div className="divider">◆ ◆ ◆</div>

          <p className="rules">The path is hidden. Only the desperate shall <span className="emphasis">SEEK</span>.</p>
          <p className="rules-detail">Trust nothing. Question everything.<br />
          The answer lies where light fears to tread.</p>

          <p className="trial-start">Your descent begins... <span className="now" onClick={handleNowClick}>N0W</span>.</p>

          <div className="silence">[May you find your way... or lose yourself trying]</div>
        </div>

        <div className="hidden-hint">Only the desperate inspect the darkness</div>
      </div>

      <div className="rune-trail" id="runeTrail"></div>

      {/* Error Message */}
      {showErrorMessage && (
        <div className="error-message-overlay">
          <div className="error-message">
            <p className="error-text">Foolish Tarnished...</p>
            <p className="error-hint">That's N 0 W.</p>
            <p className="error-hint-small">Modify N0W to NOW with inspect. GL ❤️</p>
          </div>
        </div>
      )}

      {/* Bookshelf Modal */}
      {showBookshelf && (
        <div className="bookshelf-modal" onClick={() => setShowBookshelf(false)}>
          <div className="bookshelf-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowBookshelf(false)}>✕</button>
            <div className="bookshelf-image-wrapper">
              <img src="/src/assets/images/b510_cjq1_210826.jpg" alt="Bookshelf" className="bookshelf-img" />
              {/* Death Note text overlay - positioned on one of the books */}
              <div className="death-note-text">DEATH NOTE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;

/*
  ⚠️ WARNING: YOU ARE NOT PREPARED ⚠️

  The ancients whispered in tongues of shadow and rot.
  ROT13: Svefg Tngrjnl = /rqqra-guebarbbz
  Decipher it. Or perish in ignorance.

  Four gates. Four trials. One who survives.
  The throne awaits those cursed enough to seek it.

  Hidden truths lie in:
  - The CSS abyss (seek the forbidden comments)
  - The Console void (invoke the developer tools)
  - This very source code you read
  - The HTML itself (inspect what you see)

  HINT: Not all is as it appears.
  Sometimes a 0 is not an O...
  The power to change reality lies in your hands.

  May darkness guide you, Lost Player.
*/
