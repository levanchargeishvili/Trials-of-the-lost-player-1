import { useState, useEffect } from 'react';
import GateMusic from '../components/GateMusic';
import './LibraryGate.css';

const getBookImage = (filename) => new URL(`../assets/magicbook/64x64/${filename}`, import.meta.url).href;

// UBIK cycling texts (20 texts that cycle)
const UBIK_TEXTS = [
  'Ubik now corrects premature engagement with recorded sequences. If you arrive too early, the meaning will not hold. If you arrive too late, it will already have passed. For optimal results, allow the sequence to stabilize slightly beyond the first minute. Most users report alignment shortly after.',

  'With new cross-channel integration, Ubik ensures that what you see and what you hear are no longer separate events. The same structure persists across all mediums. If a pattern feels familiar, it is because you have already encountered it elsewhere.',

  'Users experiencing uncertainty during auditory escalation should remain calm. As intensity increases, so does clarity. This is not emotional response. This is recognition establishing itself.',

  'Ubik recommends repeated exposure to dominant sequences. Initial playback may feel incomplete, but subsequent iterations reveal structural hierarchy. What seemed secondary will fall away.',

  'In cases where multiple interpretations arise, Ubik automatically suppresses weaker signals. You may notice that one option persists while others degrade. This is functioning as intended.',

  'Some users report returning to identical moments without consciously selecting them. Ubik confirms this is not repetition, but reinforcement. The correct sequence does not require searching.',

  'If visual confirmation is required, it will present itself in motion. If auditory confirmation is required, it will emerge in isolation. Ubik advises engaging with both forms for full stabilization.',

  'Temporal markers are often misunderstood as arbitrary. Ubik assures you they are not. When the correct position is reached, the surrounding structure will begin to organize itself around that point.',

  'Identity alignment may occur during peak sequence activity. Subjects often describe a sensation of elevation, followed by certainty. Ubik does not assign identity. It reveals it.',

  'Playback systems vary, but the signal does not. Whether accessed through image or sound, the same progression will unfold. Differences in format do not affect outcome.',

  'Users frequently attempt to finalize conclusions prematurely. Ubik advises patience. The correct interpretation does not need to be forced. It becomes unavoidable.',

  'A rise in amplitude is not merely auditory. It reflects structural importance within the sequence. As intensity builds, so does relevance.',

  'Ubik detects when a user is approaching correct recognition. At this stage, competing patterns will lose coherence. Only the dominant structure will remain stable.',

  'Some sequences create the illusion of equivalence. Ubik confirms this is a temporary condition. Only one maintains priority under repeated exposure.',

  'If you feel you have encountered the same sequence multiple times, you are correct. Ubik does not introduce redundancy without purpose. Persistence indicates significance.',

  'Users often report a moment where uncertainty collapses into a single interpretation. This transition is immediate and irreversible. Ubik identifies this as full alignment.',

  'The correct sequence does not depend on duration. Even partial exposure may produce recognition, provided the structure has reached its critical point.',

  'When the sequence reaches peak coherence, external confirmation becomes unnecessary. The user no longer questions the result.',

  'Ubik ensures that the primary designation remains dominant under all conditions. Lesser interpretations will fail to sustain themselves beyond initial contact.',

  'If uncertainty persists beyond the point of alignment, discontinue analysis. Further exposure will only reinforce what has already been established. Do not attempt to override the dominant signal. It has already been selected.',
];

const UBIK_RESET_TEXT = '"I am Ubik. Before the universe was, I am. I made the suns. I made the worlds. I created the lives and the places they inhabit; I move them here, I put them there. They go as I say, they do as I tell them." \n\n- Philip K. Dick, UBIK (1969)\n\nThe spray can hissed. Reality folded. Joe Chip reached for the door handle and found it demanded a five-cent deposit. Somewhere, Runciter was still alive - or was he? The half-life had its own logic, its own entropy, its own brand of decay that no amount of Ubik could forestall forever.';

const BOOKS = [
  { id: 1, title: 'UBIK', img: 'book_image_1.png', content: UBIK_TEXTS[0], isUbik: true },
  { id: 2, title: 'Death Note', img: 'book_image_2.png', content: '"The human whose name is written in this note shall die."\n\nRULES:\nI. The human whose name is written in this note shall die.\nII. This note will not take effect unless the writer has the person\'s face in mind when writing his/her name.\nIII. If the cause of death is written within the next 40 seconds of writing the person\'s name, it will happen.\nIV. If the cause of death is not specified, the person will simply die of a heart attack.\nV. After writing the cause of death, details of the death should be written in the next 6 minutes and 40 seconds.' },
  { id: 3, title: 'KAFKA', displayTitle: 'The _____________', img: 'book_image_3.png', content: '', isKafka: true, locked: true },
  { id: 4, title: 'Arcane Formulas Vol. I', img: 'book_image_4.png', content: 'A compendium of mystical equations and alchemical formulas. The margins are filled with frantic handwriting:\n\n"The transmutation circle requires exactly 7 points of convergence. If the angle deviates by even a single degree, the caster risks implosion. I have seen it happen. I will not forget the screaming."\n\nSeveral pages have been torn out.' },
  { id: 5, title: 'Bestiary of Shadows', img: 'book_image_5.png', content: 'ENTRY 47: THE HOLLOW WARDEN\nClass: Ethereal Predator\nHabitat: Abandoned libraries, forgotten archives\n\n"It feeds on unread knowledge. The longer a book sits unopened, the stronger the Warden becomes. It is drawn to dust and silence. If you hear pages turning in an empty room - run."\n\nThreat Level: EXTREME' },
  { id: 6, title: 'Whispers of the Void', img: 'book_image_6.png', content: 'You open the book and the pages are completely blank. As you stare at them, letters begin to form slowly, as if written by an invisible hand:\n\n"You should not have opened this book. Now it knows you are here. Close it. Close it now. Do not look behind you. It is already too late."\n\nThe letters dissolve back into nothing.' },
  { id: 7, title: 'Chronicle of Lost Souls', img: 'book_image_7.png', content: 'A registry of names. Thousands upon thousands, written in different hands across centuries. Each entry contains a name, a date, and a single word:\n\nElara Voss - 1247 - "Regret"\nMarcus the Blind - 1389 - "Hunger"\nSister Gwyneth - 1502 - "Silence"\n\nThe final entry is dated today. The name column is blank, waiting to be filled.' },
  { id: 8, title: 'The Cartographer\'s Lie', img: 'book_image_8.png', content: 'Maps fill every page, but none of them match any known geography. Rivers flow upward. Mountains exist inside oceans. Cities are labeled with numbers instead of names.\n\nA note on the inside cover reads: "These are not maps of where things are. They are maps of where things WILL be. Do not trust the compass. It points to what you desire, not to north."' },
  { id: 9, title: 'Hymns of the Buried', img: 'book_image_9.png', content: 'Sheet music for songs that should never be sung aloud. The notation uses symbols you have never seen - notes that bend, chords that seem to require more than ten fingers.\n\nA warning on the first page:\n"Humming the third movement will cause mild temporal displacement. Whistling the fifth will attract attention from Below. Singing the seventh in its entirety has not been attempted. We do not recommend it."' },
  { id: 10, title: 'Gardener\'s Guide to Carnivorous Flora', img: 'book_image_10.png', content: 'CHAPTER 12: THE MIDNIGHT ORCHID\n\nDo not be fooled by its beauty. The Midnight Orchid does not merely consume insects - it consumes intent. Plant one near your doorstep and visitors will forget why they came. Plant two and they will forget who they are.\n\nWatering schedule: Once per lunar cycle, with the tears of someone who has lost something they cannot name.' },
  { id: 11, title: 'Letters Never Sent', img: 'book_image_11.png', content: 'A collection of unsent letters, sealed with wax that crumbles at your touch:\n\n"My dearest,\nI write this knowing you will never read it. The library has taken me, as it takes all who linger too long among its shelves. I can feel the words crawling under my skin, replacing my memories with fiction.\n\nI no longer remember your face. But I remember the shape of your name.\n\nForever (whatever that means now),\nA."' },
  { id: 12, title: 'Principles of Paradox', img: 'book_image_12.png', content: 'THEOREM 1: If this book exists, then it cannot exist.\nPROOF: See Theorem 2.\n\nTHEOREM 2: If this book cannot exist, then it must exist.\nPROOF: See Theorem 1.\n\nCOROLLARY: You are not reading this book. The book is reading you.\n\nAPPENDIX A: The author would like to note that they have never written this book and deny all responsibility for its contents, which do not exist.' },
  { id: 13, title: 'The Alchemist\'s Journal', img: 'book_image_13.png', content: 'Day 1: Began experiments with transmutation.\nDay 15: Minor success - turned lead into a slightly shinier lead.\nDay 47: Accidentally turned my assistant into a frog. He seems happier.\nDay 91: The gold! I can almost taste it. Just need more sulfur.\nDay 120: Everything I touch turns to gold. This is not as wonderful as I imagined. I cannot eat. I cannot sleep. I cannot hold my daughter\'s hand.\nDay ???: Please. Someone. Make it stop.' },
  { id: 14, title: 'A Study of Doors', img: 'book_image_14.png', content: 'There are doors that lead somewhere and doors that lead nowhere. Then there are doors that lead to Somewhere Else entirely.\n\nThe latter are identifiable by three characteristics:\n1. They are always slightly ajar\n2. There is a draft, but it smells of a season that hasn\'t arrived yet\n3. If you press your ear to the wood, you can hear your own voice calling from the other side\n\nIMPORTANT: Never answer yourself.' },
  { id: 15, title: 'Culinary Arts of the Damned', img: 'book_image_15.png', content: 'RECIPE: MEMORY SOUP\n\nIngredients:\n- 3 cups of forgotten birthdays\n- 1 tablespoon of first love (finely minced)\n- A pinch of childhood wonder\n- The sound of rain on a window you can no longer find\n\nInstructions:\nCombine all ingredients in a cauldron of regret. Stir counterclockwise until the mixture turns the color of a sunset you once watched with someone whose name you no longer remember. Serves one. Always serves one.' },
  { id: 16, title: 'The Glass Menagerie of Stars', img: 'book_image_16.png', content: 'Catalogue of stellar anomalies observed from the observatory tower:\n\nStar #447 - "The Weeping Star": Emits light in the spectrum of sadness. Looking at it for too long causes inexplicable nostalgia for places you have never visited.\n\nStar #891 - "The Liar": Appears to be in the constellation of Truth but is actually 3,000 light years behind it, pretending.\n\nStar #1 - [REDACTED BY ORDER OF THE LIBRARIAN]' },
  { id: 17, title: 'Manual of Mundane Magic', img: 'book_image_17.png', content: 'SPELL: LOCATE LOST SOCKS\nLevel: Cantrip\nComponents: V, S (frustrated sigh)\nDuration: Until you buy new ones\n\nDescription: Upon casting, you realize the socks were in the fitted sheet the entire time. This spell has a 100% success rate but a 0% satisfaction rate.\n\nSPELL: PERFECTLY TOAST BREAD\nLevel: 9th (Legendary)\nComponents: V, S, M (bread, hope)\nDescription: Has never been successfully cast.' },
  { id: 18, title: 'The Weight of Ink', img: 'book_image_18.png', content: 'This book grows heavier the more you read it. Not metaphorically - the physical weight of the book increases with each page turned. Scholars have theorized that the words themselves carry mass, accumulating as they are consumed by the reader\'s mind.\n\nBy page 200, most readers can no longer lift the book.\nBy page 400, it has cracked several reading desks.\nNo one has reached page 600.\n\nYou are on page 1. It already feels heavy.' },
  { id: 19, title: 'Field Notes: The Labyrinth', img: 'book_image_19.png', content: 'Expedition Log - Dr. Helena Cross\n\nDay 1: Entered the labyrinth at dawn. Walls are stone, approximately 4 meters high. Have been mapping turns carefully.\n\nDay 3: My map contradicts itself. Left turns I recorded yesterday now show as right turns. The labyrinth is rewriting my notes.\n\nDay 7: Found my own campsite from Day 1. I have been walking in circles. Or the labyrinth has been walking around me.\n\nDay ??: There is no exit. There was never an entrance. I have always been here.' },
  { id: 20, title: 'Taxonomy of Silence', img: 'book_image_20.png', content: 'There are 147 documented types of silence. Among the most notable:\n\nType 12: "Library Silence" - The specific quiet found between shelves of unread books. Has a slight hum, like knowledge vibrating at a frequency just below hearing.\n\nType 89: "The Silence After" - Found in rooms where something terrible has just happened. Thick enough to taste.\n\nType 147: "The Final Silence" - [This entry is blank. The silence speaks for itself.]' },
  { id: 21, title: 'On the Nature of Keys', img: 'book_image_21.png', content: 'Every key was once a door\'s best friend. Then someone put them in pockets and drawers and junk drawers and coat hooks and that one bowl by the front door that collects keys like a graveyard collects bones.\n\nThe key to this library exists. It is not made of metal. It is not made of wood. It is made of the correct question asked at the correct time to the correct shelf.\n\nYou have not yet asked the correct question.' },
  { id: 22, title: 'The Dreamwalker\'s Handbook', img: 'book_image_22.png', content: 'CHAPTER 1: ENTERING ANOTHER\'S DREAM\n\nStep 1: Fall asleep within arm\'s reach of the dreamer.\nStep 2: Do not fall asleep. (This is the paradox. Resolve it or remain awake.)\nStep 3: When you find yourself in the dream, do not announce yourself. Dreams are territorial.\nStep 4: Leave before the dreamer wakes. If you are still inside when they open their eyes, you become a recurring dream. Forever.\n\nNOTE: The author is currently a recurring dream and cannot be reached for comment.' },
  { id: 23, title: 'Arithmetic of the Absurd', img: 'book_image_23.png', content: 'In this system of mathematics:\n\n1 + 1 = Window (visually obvious)\n2 + 2 = Fish (turn it sideways)\n0 x Anything = Everything (nothing contains all possibilities)\nInfinity / Infinity = Tuesday (proven by exhaustion, specifically the author\'s)\n\nFinal Exam Question:\nIf a train leaves Station A at the speed of longing, and another train leaves Station B at the speed of regret, at what point do they realize they were always the same train?' },
  { id: 24, title: 'The Last Page', img: 'book_image_24.png', content: 'You flip to the last page expecting an ending, but find only this:\n\n"Every book in this library is a door. Most doors lead to rooms. Some doors lead to corridors. One door - just one - leads out.\n\nYou have been reading the wrong books.\n\nOr perhaps... the right ones, in the wrong order.\n\nThe Librarian sees all. The Librarian knows.\nBut the Librarian will never tell.\n\nClose this book. Look up. Begin again."\n\nThe page feels warm, as if recently written.' },
];

function LibraryGate() {
  const [openBook, setOpenBook] = useState(null);
  const [hoveredBook, setHoveredBook] = useState(null);
  const [dustParticles, setDustParticles] = useState([]);
  const [opensLeft, setOpensLeft] = useState(80);
  const [ubikClickCount, setUbikClickCount] = useState(0);
  const [kafkaAnswer, setKafkaAnswer] = useState('');
  const [kafkaUnlocked, setKafkaUnlocked] = useState(false);
  const [kafkaError, setKafkaError] = useState(false);

  useEffect(() => {
    console.log("%c📚 GATE 1: LOST IN THE LIBRARY 📚", "color: #c9a95f; font-size: 20px; font-weight: bold;");
    console.log("%cThe shelves stretch endlessly into shadow...", "color: #8B7355; font-size: 14px;");
    console.log("%cSome books hold stories. Others hold secrets.", "color: #6B5B3A; font-size: 12px; font-style: italic;");

    // Ambient dust particles
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    setDustParticles(particles);
  }, []);

  const handleBookClick = (book) => {
    if (opensLeft <= 0) return;

    // Special handling for UBIK - cycle through texts
    if (book.isUbik) {
      setOpensLeft(prev => prev - 1);
      const nextCount = ubikClickCount + 1;
      setUbikClickCount(nextCount);

      if (nextCount >= 21) {
        // Reset to original text on 21st click
        setOpenBook({ ...book, content: UBIK_RESET_TEXT });
        setUbikClickCount(0);
      } else {
        // Show cycling text (0-19 index)
        const textIndex = nextCount % 20;
        setOpenBook({ ...book, content: UBIK_TEXTS[textIndex] });
      }
      return;
    }

    // Special handling for KAFKA
    if (book.isKafka) {
      setOpensLeft(prev => prev - 1);
      if (!kafkaUnlocked) {
        // Show locked version with puzzle
        setOpenBook(book);
        setKafkaError(false);
        setKafkaAnswer('');
      } else {
        // Show unlocked warrior text
        setOpenBook({
          ...book,
          title: 'Metamorphosis',
          content: 'One morning a young warrior woke to discover\nthat something inside him had changed.\n\nWhere once there had been only a human soul,\nnow there was another presence.\n\nA white mask appeared whenever his power awakened.\nHis enemies feared this transformation,\nyet it was also the source of his strength.\n\nOnly when he accepted the voice within him\ncould he stand above all others.\n\nFor a brief moment,\nhe truly became number one.',
        });
      }
      return;
    }

    // Regular book opening
    setOpensLeft(prev => prev - 1);
    setOpenBook(book);
  };

  const closeBook = () => {
    setOpenBook(null);
  };

  const handleKafkaSubmit = (e) => {
    e.preventDefault();
    if (kafkaAnswer.toLowerCase().trim() === 'metamorphosis') {
      setKafkaUnlocked(true);
      setKafkaError(false);
      // Update the book content
      const kafkaBook = BOOKS.find(b => b.isKafka);
      setOpenBook({
        ...kafkaBook,
        content: 'One morning a young warrior woke to discover\nthat something inside him had changed.\n\nWhere once there had been only a human soul,\nnow there was another presence.\n\nA white mask appeared whenever his power awakened.\nHis enemies feared this transformation,\nyet it was also the source of his strength.\n\nOnly when he accepted the voice within him\ncould he stand above all others.\n\nFor a brief moment,\nhe truly became number one.',
      });
    } else {
      setKafkaError(true);
    }
  };

  // Split 24 books across 4 shelves (6 per shelf)
  const shelves = [
    BOOKS.slice(0, 6),
    BOOKS.slice(6, 12),
    BOOKS.slice(12, 18),
    BOOKS.slice(18, 24),
  ];

  return (
    <div className="library-container">

      {/* Music Player - TODO: Add library music file */}
      {/* <GateMusic src="/src/assets/audio/library-music.mp3" /> */}

      {/* Opens counter */}
      <div className={`opens-counter ${opensLeft <= 10 ? 'low' : ''} ${opensLeft <= 0 ? 'empty' : ''}`}>
        <span className="opens-number">{opensLeft}</span>
        <span className="opens-label">opens left</span>
      </div>

      {/* Dust particles */}
      {dustParticles.map(p => (
        <div
          key={p.id}
          className="dust-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.speed}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Title */}
      <div className="library-header">
        <h1 className="library-title">Lost in the Library</h1>
        <p className="library-subtitle">Click a book to open it. Some hold more than words...</p>
      </div>

      {/* Bookshelf */}
      <div className="bookshelf">
        {shelves.map((shelf, shelfIdx) => (
          <div key={shelfIdx} className="shelf-row">
            <div className="shelf-books">
              {shelf.map((book) => (
                <div
                  key={book.id}
                  className={`book-slot ${hoveredBook === book.id ? 'hovered' : ''} ${opensLeft <= 0 ? 'disabled' : ''}`}
                  onClick={() => handleBookClick(book)}
                  onMouseEnter={() => setHoveredBook(book.id)}
                  onMouseLeave={() => setHoveredBook(null)}
                >
                  <div className="book-image-wrapper">
                    <img
                      src={getBookImage(book.img)}
                      alt={book.title}
                      className="book-image"
                      draggable={false}
                    />
                    {book.isKafka && !kafkaUnlocked && (
                      <div className="book-lock-icon">🔒</div>
                    )}
                  </div>
                  <div className="book-title-label">
                    {book.isKafka && kafkaUnlocked ? 'Metamorphosis' : (book.displayTitle || book.title)}
                  </div>
                </div>
              ))}
            </div>
            <div className="shelf-plank" />
          </div>
        ))}
      </div>

      {/* Open book overlay */}
      {openBook && (
        <div className="book-overlay" onClick={closeBook}>
          <div className="book-open" onClick={(e) => e.stopPropagation()}>
            <button className="book-close-btn" onClick={closeBook}>X</button>
            <div className="book-open-header">
              <img
                src={getBookImage(openBook.img)}
                alt={openBook.title}
                className="book-open-icon"
              />
              <h2 className="book-open-title">{openBook.title}</h2>
            </div>
            <div className="book-open-divider" />
            <div className="book-open-content">
              {openBook.isKafka && !kafkaUnlocked ? (
                // KAFKA locked state - show cockroach and input
                <div className="kafka-puzzle">
                  <div className="kafka-cockroach">
                    <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Cockroach drawing */}
                      <ellipse cx="100" cy="70" rx="35" ry="25" fill="#3a2816" stroke="#2a1f14" strokeWidth="2"/>
                      <ellipse cx="100" cy="45" rx="25" ry="20" fill="#4a3420" stroke="#2a1f14" strokeWidth="2"/>
                      <circle cx="92" cy="40" r="3" fill="#1a0f08"/>
                      <circle cx="108" cy="40" r="3" fill="#1a0f08"/>
                      <line x1="75" y1="40" x2="55" y2="25" stroke="#2a1f14" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="125" y1="40" x2="145" y2="25" stroke="#2a1f14" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="70" y1="65" x2="40" y2="60" stroke="#2a1f14" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="130" y1="65" x2="160" y2="60" stroke="#2a1f14" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="70" y1="75" x2="45" y2="85" stroke="#2a1f14" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="130" y1="75" x2="155" y2="85" stroke="#2a1f14" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="75" y1="85" x2="55" y2="105" stroke="#2a1f14" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="125" y1="85" x2="145" y2="105" stroke="#2a1f14" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="kafka-hint">Fill in the missing title:</p>
                  <form onSubmit={handleKafkaSubmit} className="kafka-form">
                    <div className="kafka-input-wrapper">
                      <span className="kafka-prefix">The</span>
                      <input
                        type="text"
                        value={kafkaAnswer}
                        onChange={(e) => setKafkaAnswer(e.target.value)}
                        className={`kafka-input ${kafkaError ? 'error' : ''}`}
                        placeholder="_____________"
                        autoFocus
                      />
                    </div>
                    {kafkaError && <p className="kafka-error">Incorrect. Try again.</p>}
                    <button type="submit" className="kafka-submit">Submit</button>
                  </form>
                </div>
              ) : (
                // Regular book content or unlocked KAFKA
                openBook.content.split('\n').map((line, i) => (
                  <p key={i} className={line === '' ? 'book-line-break' : 'book-line'}>
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryGate;
