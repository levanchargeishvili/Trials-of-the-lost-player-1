import { useState, useEffect } from 'react';
import GateMusic from '../components/GateMusic';
import './BeeHiveGate.css';

// List of 15-20 bee types (PNG images)
const beeTypes = [
  { id: 1, name: 'Hakari', rarity: 'GAMBLINGGGG', color: '#efcd08', image: new URL('../assets/bees-png/hakari.png', import.meta.url).href },
  { id: 2, name: 'Jon Snow', rarity: 'MoGoat', color: '#FFA500', image: new URL('../assets/bees-png/jon_snow.png', import.meta.url).href },
  { id: 3, name: 'Tyrion Lannister', rarity: 'THE GOAT', color: '#FF4500', image: new URL('../assets/bees-png/tyrion.png', import.meta.url).href },
  { id: 4, name: 'Gojo', rarity: 'Sukuna', color: '#8B0000', image: new URL('../assets/bees-png/gojo.png', import.meta.url).href },
  { id: 5, name: 'Thukuna', rarity: 'GOJOOOO', color: '#00CED1', image: new URL('../assets/bees-png/sukuna.png', import.meta.url).href },
  { id: 6, name: 'Zoro', rarity: 'THE GOAT', color: '#ADFF2F', image: new URL('../assets/bees-png/zoro.png', import.meta.url).href },
  { id: 7, name: 'Vicious Bee', rarity: '+2 Stinger', color: '#FF69B4', image: new URL('../assets/bees-png/vicious.png', import.meta.url).href },
  { id: 8, name: 'MamaFlex', rarity: 'dedamovutyan chemi praktika', color: '#9400D3', image: new URL('../assets/bees-png/mamflex.webp', import.meta.url).href },
  { id: 9, name: 'Down D. Stairs', rarity: ':d', color: '#FF1493', image: new URL('../assets/bees-png/stairs.png', import.meta.url).href },
  { id: 10, name: 'Killua', rarity: 'THE GOAT', color: '#A0522D', image: new URL('../assets/bees-png/killua.png', import.meta.url).href },
  { id: 11, name: 'Irakli', rarity: 'BuzuBuzu', color: '#FFD700', image: new URL('../assets/bees-png/irakli.png', import.meta.url).href },
  { id: 12, name: 'Goris Vashli', rarity: 'Gemrieli', color: '#F0E68C', image: new URL('../assets/bees-png/gori.jpeg', import.meta.url).href },
  { id: 13, name: 'Mclovin', rarity: 'Sigma', color: '#8B4513', image: new URL('../assets/bees-png/foggel.png', import.meta.url).href },
  { id: 14, name: 'Bikentiis Qababi', rarity: 'Kutaisis Goatio', color: '#FF4500', image: new URL('../assets/bees-png/bikentia.jpg', import.meta.url).href },
  { id: 15, name: 'Horse', rarity: 'SUS', color: '#DC143C', image: new URL('../assets/bees-png/horse.jpg', import.meta.url).href },
  { id: 16, name: 'Microsoft Edge', rarity: 'Snail', color: '#DAA520', image: new URL('../assets/bees-png/microsoft.webp', import.meta.url).href },
  { id: 17, name: 'Radanh', rarity: 'Nightmare', color: '#8A2BE2', image: new URL('../assets/bees-png/radanh.avif', import.meta.url).href },
  { id: 18, name: 'Discord', rarity: 'W', color: '#2F4F4F', image: new URL('../assets/bees-png/discord.png', import.meta.url).href },
  { id: 19, name: 'Tskaltubos parki', rarity: 'Heaven', color: '#228B22', image: new URL('../assets/bees-png/wyaltubo.jpg', import.meta.url).href },
  { id: 20, name: 'Anbanis Koshk', rarity: 'Hell', color: '#FFB6C1', image: new URL('../assets/bees-png/anban.jpg', import.meta.url).href },
];

function BeeHiveGate() {
  const [eggs, setEggs] = useState(10); // 10 royal jellies
  const [hiveSlots, setHiveSlots] = useState([null, null, null, null, null]); // 5 slots
  const [draggedEgg, setDraggedEgg] = useState(null);
  const [showBattle, setShowBattle] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [showMeteorPuzzle, setShowMeteorPuzzle] = useState(false);
  const [meteorCode, setMeteorCode] = useState('');
  const [meteors, setMeteors] = useState([]);
  const [revealedMeteors, setRevealedMeteors] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showNoEggsWarning, setShowNoEggsWarning] = useState(false);
  const [showMathPopup, setShowMathPopup] = useState(false);
  const [currentMeteor, setCurrentMeteor] = useState(null);
  const [mathProblem, setMathProblem] = useState({ num1: 0, num2: 0, answer: 0 });
  const [mathAnswer, setMathAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(3);
  const [showGameLost, setShowGameLost] = useState(false);
  const [showMeteorMessage, setShowMeteorMessage] = useState(false);
  const [showTarnishedMessage, setShowTarnishedMessage] = useState(false);

  const revealedMeteorSequence = meteorCode
    ? meteorCode
        .split('')
        .map((char, index) => (revealedMeteors.includes(index) ? char : '_'))
        .join(' ')
    : '';

  // Generate the meteor code - 14 characters
  const generateMeteorCode = () => {
    return 'TheLastHarvest'; // 14 characters
  };

  // Generate meteors - continuous rain effect
  const generateMeteors = (code) => {
    return code.split('').map((char, index) => {
      return {
        id: index,
        char: char,
        left: Math.random() * 90 + 5, // 5-95% from left
        duration: 20, // 20 seconds to fall (slow for rain effect)
        delay: index * 1.2, // Stagger by 1.2s each (continuous rain)
        size: Math.random() * 20 + 70, // 30-50px (smaller for rain)
      };
    });
  };

  useEffect(() => {
    // Console hints
    console.log("%c🐝 GATE 2: THE HIVE 🐝", "color: #FFD700; font-size: 20px; font-weight: bold;");
    console.log("%cRoyal Jelly spawns random bees...", "color: #FFA500; font-size: 14px;");
    console.log("%cBut which bee is the strongest?", "color: #FF8C00; font-size: 12px;");
    console.log("%cHint: Some bets are safer than others...", "color: #FF6347; font-size: 11px; font-style: italic;");
  }, []);

  const handleDragStart = (e, type) => {
    setDraggedEgg(type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();

    if (eggs > 0 || draggedEgg === 'existing') {
      const newHiveSlots = [...hiveSlots];

      if (draggedEgg === 'egg') {
        // Spawn random bee
        const randomBee = beeTypes[Math.floor(Math.random() * beeTypes.length)];
        newHiveSlots[slotIndex] = randomBee;
        const newEggCount = eggs - 1;
        setEggs(newEggCount);

        // Check if eggs ran out but not all slots filled
        const allFilled = newHiveSlots.every(slot => slot !== null);
        if (newEggCount === 0 && !allFilled) {
          setShowNoEggsWarning(true);
        }
      } else if (draggedEgg === 'existing') {
        // Moving existing bee (implement later)
      }

      setHiveSlots(newHiveSlots);
      setDraggedEgg(null);
    }
  };

  const startBattle = () => {
    // Check if all slots filled
    const allFilled = hiveSlots.every(slot => slot !== null);
    if (allFilled) {
      setShowBattle(true);
    } else {
      alert('Fill all 5 hive slots first!');
    }
  };

  const placeBet = (bee) => {
    // Prevent multiple bets
    if (selectedBet) return;

    setSelectedBet(bee);

    // Check if Hakari is in hive - play audio if so
    const hakariInHive = hiveSlots.find(b => b?.name === 'Hakari');

    if (hakariInHive) {
      // Play Hakari audio
      const audio = new Audio(new URL('../assets/bee-audio/hakari.mp3', import.meta.url).href);
      audio.volume = 0.7;

      // Handle audio playback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Hakari audio playing');
          })
          .catch(err => {
            console.error('Audio play failed:', err);
            console.log('Tip: Click the page first to enable audio autoplay');
          });
      }

      // Wait 6 seconds for audio, then run battle
      setTimeout(() => {
        runBattle(bee);
      }, 6000);
    } else {
      // No Hakari, run battle immediately
      setTimeout(() => {
        runBattle(bee);
      }, 500);
    }
  };

  const runBattle = (bettedBee) => {
    const hakariInHive = hiveSlots.find(bee => bee?.name === 'Hakari');

    if (!hakariInHive) {
      // NO HAKARI - ALL DEAD
      setBattleResult({
        winner: null,
        message: 'Everyone Died On The Battle Field',
        success: false,
        allDead: true
      });

      // Show Tarnished message after 1 second
      setTimeout(() => {
        setShowTarnishedMessage(true);
      }, 1000);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowTarnishedMessage(false);
      }, 6000);
    } else if (bettedBee.name === 'Hakari') {
      // HAKARI WINS AND BET CORRECTLY - START METEOR PUZZLE
      setBattleResult({
        winner: hakariInHive,
        message: 'HAKARI WINS! You bet correctly!',
        success: true,
        allDead: false
      });

      // Show METEOR SHOWER BEGINS after 2 seconds
      setTimeout(() => {
        setShowMeteorMessage(true);
      }, 2000);

      // Start meteor puzzle after 3 seconds (1 second for message display)
      setTimeout(() => {
        // Generate code and start meteor puzzle
        const code = generateMeteorCode();
        setMeteorCode(code);
        setMeteors(generateMeteors(code));
        setShowMeteorPuzzle(true);
        setShowMeteorMessage(false);
      }, 3000);
    } else {
      // HAKARI WINS BUT WRONG BET
      setBattleResult({
        winner: hakariInHive,
        message: `HAKARI WINS! But you bet on ${bettedBee.name}...`,
        success: false,
        allDead: false
      });
    }
  };

  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    return { num1, num2, answer: num1 * num2 };
  };

  const handleMeteorClick = (meteorId) => {
    if (!revealedMeteors.includes(meteorId) && !showMathPopup) {
      const problem = generateMathProblem();
      setMathProblem(problem);
      setCurrentMeteor(meteorId);
      setMathAnswer('');
      setTimeLeft(3);
      setShowMathPopup(true);
    }
  };

  // Timer countdown for math problem
  useEffect(() => {
    if (showMathPopup && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showMathPopup && timeLeft === 0) {
      // Time's up - GAME LOST
      setShowMathPopup(false);
      setShowGameLost(true);
    }
  }, [showMathPopup, timeLeft]);

  const handleMathSubmit = (e) => {
    e.preventDefault();
    if (parseInt(mathAnswer) === mathProblem.answer) {
      // Correct! Reveal the meteor
      setRevealedMeteors([...revealedMeteors, currentMeteor]);
      setShowMathPopup(false);
      setMathAnswer('');
    } else {
      // Wrong answer - GAME LOST
      setShowMathPopup(false);
      setShowGameLost(true);
    }
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (userAnswer.toLowerCase() === meteorCode.toLowerCase()) {
      // CORRECT! Proceed to next gate
      alert('Challenge Complete! Proceeding to The Last Harvest...');
      setTimeout(() => {
        window.location.href = '/gate-3-the-last-harvest';
      }, 1500);
    } else {
      // WRONG
      alert('Incorrect sequence! Try again.');
      setUserAnswer('');
    }
  };

  const resetBattle = () => {
    // Restart the page
    window.location.reload();
  };

  const revertSlots = () => {
    // Reset to initial state
    setHiveSlots([null, null, null, null, null]);
    setEggs(10);
    setShowNoEggsWarning(false);
  };

  return (
    <div className="beehive-container">

      <GateMusic src={new URL('../assets/audio/Bee Swarm Simulator  OST - Wax.mp3', import.meta.url).href} />

      <div className="stars"></div>
      <div className="twinkling"></div>

      <div className="hive-content">
        <h1 className="hive-title glitch" data-text="Gate 2: The Hive">
          Gate 2: The Hive
        </h1>

        {!showBattle ? (
          <>
            {/* Egg Counter */}
            <div className="egg-counter">
              <span className="egg-label">Royal Jellies:</span>
              <div className="eggs-display">
                {Array(eggs).fill(0).map((_, i) => (
                  <img
                    key={i}
                    src={new URL('../assets/eggs-items/royal-jelly.png', import.meta.url).href}
                    alt="Royal Jelly"
                    className="egg"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'egg')}
                    onError={(e) => {
                      // Fallback to emoji if image not found
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ))}
              </div>
              {showNoEggsWarning && (
                <div className="no-eggs-warning">
                  <p className="warning-text">⚠️ No Jelly left! All 5 slots must be filled to start battle!</p>
                </div>
              )}
            </div>

            {/* Hive Slots */}
            <div className="hive-slots-wrapper">
              {eggs === 0 && (
                <button className="revert-btn" onClick={revertSlots} title="Reset all slots">
                  ↺ REVERT
                </button>
              )}
              <div className="hive-slots-container">
              {hiveSlots.map((bee, index) => (
                <div
                  key={index}
                  className={`hive-slot ${bee ? 'filled' : 'empty'}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {bee ? (
                    <div className="bee-in-slot" key={bee.id + '-' + index}>
                      <div className="bee-image-container">
                        <img
                          key={bee.id}
                          src={bee.image}
                          alt={bee.name}
                          className="bee-image"
                          onError={(e) => {
                            // Fallback to colored circle with emoji if image not found
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="bee-placeholder"
                          style={{ backgroundColor: bee.color, display: 'none' }}
                        >
                          🐝
                        </div>
                      </div>
                      <div className="bee-info">
                        <div className="bee-name">{bee.name}</div>
                        <div className={`bee-rarity ${bee.rarity.toLowerCase()}`}>
                          {bee.rarity}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-slot-text">Drop Jelly Here</div>
                  )}
                </div>
              ))}
              </div>
            </div>

            <button
              className="battle-btn"
              onClick={startBattle}
              disabled={!hiveSlots.every(slot => slot !== null)}
            >
              Start Battle
            </button>
          </>
        ) : (
          <div className="battle-arena">
            {!battleResult ? (
              <>
                <h2 className="battle-title bet-on-message">BET ON</h2>

                <div className="battle-bees">
                  {hiveSlots.map((bee, index) => (
                    <div
                      key={index}
                      className={`battle-bee ${selectedBet?.id === bee.id ? 'selected betting' : ''} ${selectedBet ? 'disabled' : ''}`}
                      onClick={() => !selectedBet && placeBet(bee)}
                      style={{ cursor: selectedBet ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="battle-bee-image-wrapper">
                        <img
                          key={bee.id}
                          src={bee.image}
                          alt={bee.name}
                          className="battle-bee-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="battle-bee-placeholder"
                          style={{ backgroundColor: bee.color, display: 'none' }}
                        >
                          🐝
                        </div>
                      </div>
                      <div className="bee-info">
                        <div className="battle-bee-name">{bee.name}</div>
                        <div className={`bee-rarity ${bee.rarity.toLowerCase()}`}>
                          {bee.rarity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="battle-result" >
                {battleResult.allDead ? (
                  <div className="winner-display dead-display">
                    <div className="skull-wrapper spinning">
                      <div className="skull">💀</div>
                    </div>
                    <h3 className="dead-title">{battleResult.message}</h3>
                  </div>
                ) : (
                  <div
                    className="winner-display"
                    style={{ borderColor: battleResult.winner.color }}
                  >
                    <div className="winner-image-wrapper spinning">
                      <img
                        key={battleResult.winner.id}
                        src={battleResult.winner.image}
                        alt={battleResult.winner.name}
                        className="winner-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="winner-placeholder"
                        style={{ backgroundColor: battleResult.winner.color, display: 'none' }}
                      >
                        🐝
                      </div>
                    </div>
                    <h3>{battleResult.winner.name} WINS!</h3>
                  </div>
                )}

                <p className={`result-message ${battleResult.success ? 'success' : 'failure'}`}>
                  {battleResult.message}
                </p>
                {!battleResult.success && (
                  <button style={{marginLeft:"auto",marginRight:"auto"}} className="reset-btn" onClick={resetBattle}>
                    Try Again
                  </button>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      {/* Meteor Shower Message */}
      {showMeteorMessage && (
        <div className="meteor-message-overlay">
          <div className="meteor-message">METEOR SHOWER BEGINS...</div>
        </div>
      )}

      {/* Tarnished Message */}
      {showTarnishedMessage && (
        <div className="tarnished-message-overlay">
          <div className="tarnished-message">Foul Tarnished, in search of the Yair Taito.</div>
        </div>
      )}

      {/* Meteor Puzzle */}
      {showMeteorPuzzle && (
        <div className="meteor-puzzle-overlay">
          {/* Answer Box at Top */}
          <div className="answer-box-container">
            <form onSubmit={handleAnswerSubmit} className="answer-form">
              <label className="answer-label">Enter the sequence:</label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="answer-input"
                placeholder="Click meteors to reveal..."
                maxLength={14}
                autoFocus
              />
              <button type="submit" className="answer-submit">SUBMIT</button>
            </form>
            <div className="revealed-chars">
              Revealed Pattern: {revealedMeteorSequence}
            </div>
          </div>

          {/* Falling Meteors */}
          <div className="meteors-container">
            {meteors.map((meteor) => (
              <div
                key={meteor.id}
                className={`meteor ${revealedMeteors.includes(meteor.id) ? 'exploded' : ''}`}
                style={{
                  left: `${meteor.left}%`,
                  animationDuration: `${meteor.duration}s`,
                  animationDelay: `${meteor.delay}s`,
                  width: `${meteor.size}px`,
                  height: `${meteor.size}px`,
                }}
                onClick={() => handleMeteorClick(meteor.id)}
              >
                {revealedMeteors.includes(meteor.id) ? (
                  <div className="meteor-char">
                    <div className="char-number">{meteor.id + 1}.</div>
                    <div className="char-value">{meteor.char}</div>
                  </div>
                ) : (
                  <img
                    src={new URL('../assets/eldenring/Gemini_Generated_Image_ivwmizivwmizivwm.png', import.meta.url).href}
                    alt="Meteor"
                    className="meteor-rock"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Math Popup */}
          {showMathPopup && (
            <div className="math-popup-overlay">
              <div className="math-popup">
                <div className="timer-display">{timeLeft}</div>
                <h2 className="math-question">
                  {mathProblem.num1} × {mathProblem.num2} = ?
                </h2>
                <form onSubmit={handleMathSubmit}>
                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    className="math-input"
                    autoFocus
                    placeholder="Answer"
                  />
                  <button type="submit" className="math-submit">
                    SUBMIT
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Game Lost Popup */}
          {showGameLost && (
            <div className="game-lost-overlay">
              <div className="game-lost-popup">
                <h1 className="game-lost-title">GAME LOST</h1>
                <p className="game-lost-message">You failed the math challenge!</p>
                <div className="lost-sequence-wrapper">
                  <p className="lost-sequence-label">Unlocked Letters:</p>
                  <p className="lost-sequence-value">{revealedMeteorSequence}</p>
                </div>
                <button className="return-gate-btn" onClick={() => window.location.href = '/gate-2-hive'}>
                  Return to Gate 2
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BeeHiveGate;
