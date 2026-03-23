import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  { id: 4, title: 'ვეფხისტყაოსანი', img: 'book_image_4.png', content: 'ნახეს უცხო მოყმე ვინმე\n\ ჯდა მტირალი წლისა პირსა \n მივიდნენ და წამოარტყეს \n რა გატირებს შეჩემისა' },
  { id: 5, title: 'A Game of Thrones', img: 'book_image_5.png', content: 'When you play the game of thrones, you win or you die.\n\nMargins filled with names.\n\nMost are crossed out.' },
  { id: 6, title: 'The Hitchhiker\'s Guide to the Galaxy', img: 'book_image_6.png', content: 'DON\'T PANIC.\n\nThis advice is highlighted repeatedly.\n\nEverything else in the book suggests that panic would be reasonable.', isHitchhiker: true },
  { id: 7, title: 'აი ია', img: 'book_image_7.png', content: 'აი ია.\n\nსულ ესაა.\n\nრატომ გრძელდება კითხვა?' },
  { id: 8, title: 'The Cartographer\'s Lie', img: 'book_image_8.png', content: 'Maps fill every page, but none of them match any known geography. Rivers flow upward. Mountains exist inside oceans. Cities are labeled with numbers instead of names.\n\nA note on the inside cover reads: "These are not maps of where things are. They are maps of where things WILL be. Do not trust the compass. It points to what you desire, not to north."' },
  { id: 9, title: 'The Lord of the Rings', img: 'book_image_9.png', content: 'One ring to rule them all.\n\nThe inscription fades when you stare directly at it.\n\nIt prefers to be remembered, not seen.' },
  { id: 10, title: 'The Hobbit', img: 'book_image_10.png', content: 'In a hole in the ground lived a hobbit.\n\nThe hole gets deeper the longer you read.\n\nIt was not always this deep.' },
  { id: 11, title: 'Harry Potter and the Sorcerer\'s Stone', img: 'book_image_11.png', content: 'The letter arrives.\n\nNot once.\nNot twice.\n\nNo matter how many you burn,\nanother appears.\n\nIt already knows where you live.' },
  { id: 12, title: 'Harry Potter and the Chamber of Secrets', img: 'book_image_12.png', content: 'The chamber has been opened.\n\nThe message repeats.\n\nYou don’t remember writing it.' },
  { id: 13, title: 'The Alchemist\'s Journal', img: 'book_image_13.png', content: 'Day 1: Began experiments with transmutation.\nDay 15: Minor success - turned lead into a slightly shinier lead.\nDay 47: Accidentally turned my assistant into a frog. He seems happier.\nDay 91: The gold! I can almost taste it. Just need more sulfur.\nDay 120: Everything I touch turns to gold. This is not as wonderful as I imagined. I cannot eat. I cannot sleep. I cannot hold my daughter\'s hand.\nDay ???: Please. Someone. Make it stop.' },
  { id: 14, title: 'Mein Kampf', img: 'book_image_14.png', isMeinKampf: true, content: 'There are doors that lead somewhere and doors that lead nowhere. Then there are doors that lead to Somewhere Else entirely.\n\nThe latter are identifiable by three characteristics:\n1. They are always slightly ajar\n2. There is a draft, but it smells of a season that hasn\'t arrived yet\n3. If you press your ear to the wood, you can hear your own voice calling from the other side\n\nIMPORTANT: Never answer yourself.' },
  { id: 15, title: 'Culinary Arts of the Damned', img: 'book_image_15.png', content: 'RECIPE: MEMORY SOUP\n\nIngredients:\n- 3 cups of forgotten birthdays\n- 1 tablespoon of first love (finely minced)\n- A pinch of childhood wonder\n- The sound of rain on a window you can no longer find\n\nInstructions:\nCombine all ingredients in a cauldron of regret. Stir counterclockwise until the mixture turns the color of a sunset you once watched with someone whose name you no longer remember. Serves one. Always serves one.' },
  { id: 16, title: 'The Glass Menagerie of Stars', img: 'book_image_16.png', content: 'Catalogue of stellar anomalies observed from the observatory tower:\n\nStar #447 - "The Weeping Star": Emits light in the spectrum of sadness. Looking at it for too long causes inexplicable nostalgia for places you have never visited.\n\nStar #891 - "The Liar": Appears to be in the constellation of Truth but is actually 3,000 light years behind it, pretending.\n\nStar #1 - [REDACTED BY ORDER OF THE LIBRARIAN]' },
  { id: 17, title: 'Manual of Mundane Magic', img: 'book_image_17.png', content: 'SPELL: LOCATE LOST SOCKS\nLevel: Cantrip\nComponents: V, S (frustrated sigh)\nDuration: Until you buy new ones\n\nDescription: Upon casting, you realize the socks were in the fitted sheet the entire time. This spell has a 100% success rate but a 0% satisfaction rate.\n\nSPELL: PERFECTLY TOAST BREAD\nLevel: 9th (Legendary)\nComponents: V, S, M (bread, hope)\nDescription: Has never been successfully cast.' },
  { id: 18, title: 'კაცია-ადამიანი?!', img: 'book_image_18.png', content: 'კაცია?\nადამიანი?\n\nკითხვა მარტივია.\n\nპასუხი — არასოდეს.' },
  { id: 19, title: 'Field Notes: The Labyrinth', img: 'book_image_19.png', content: 'Expedition Log - Dr. Helena Cross\n\nDay 1: Entered the labyrinth at dawn. Walls are stone, approximately 4 meters high. Have been mapping turns carefully.\n\nDay 3: My map contradicts itself. Left turns I recorded yesterday now show as right turns. The labyrinth is rewriting my notes.\n\nDay 7: Found my own campsite from Day 1. I have been walking in circles. Or the labyrinth has been walking around me.\n\nDay ??: There is no exit. There was never an entrance. I have always been here.' },
  { id: 20, title: 'ცისფერი მთები', img: 'book_image_20.png', content: 'წიგნი იწერება.\n\nარ იკითხება.\n\nარ სრულდება.\n\nმაგრამ მაინც არსებობს.', isBlueMountains: true },
  { id: 21, title: 'On the Nature of Keys', img: 'book_image_21.png', content: 'Every key was once a door\'s best friend. Then someone put them in pockets and drawers and junk drawers and coat hooks and that one bowl by the front door that collects keys like a graveyard collects bones.\n\nThe key to this library exists. It is not made of metal. It is not made of wood. It is made of the correct question asked at the correct time to the correct shelf.\n\nYou have not yet asked the correct question.' },
  { id: 22, title: 'The Dreamwalker\'s Handbook', img: 'book_image_22.png', content: 'CHAPTER 1: ENTERING ANOTHER\'S DREAM\n\nStep 1: Fall asleep within arm\'s reach of the dreamer.\nStep 2: Do not fall asleep. (This is the paradox. Resolve it or remain awake.)\nStep 3: When you find yourself in the dream, do not announce yourself. Dreams are territorial.\nStep 4: Leave before the dreamer wakes. If you are still inside when they open their eyes, you become a recurring dream. Forever.\n\nNOTE: The author is currently a recurring dream and cannot be reached for comment.' },
  {id: 23, title: '1984', img: 'book_image_23.png', content: 'Big Brother is watching you.\n\nYou close the book.\n\nThe feeling does not stop.' },
  { id: 24, title: 'Animal Farm', img: 'book_image_24.png', content: 'All animals are equal.\n\nYou reread the sentence.\n\nIt has changed slightly.' }];

// Word puzzle configuration
const CORRECT_ANSWER = ['now', 'you', 'feel', 'like', 'number', 'one'];
const DISTRACTOR_WORDS = [
  'now', 'you', 'feel', 'like', 'number', 'one',
  'echo', 'shadow', 'velocity', 'pulse', 'glimmer', 'horizon',
  'cipher', 'drift', 'ember', 'flux', 'gravity', 'luminous',
  'phantom', 'quantum', 'rift', 'spectrum', 'twilight', 'vortex',
  'zenith', 'cascade', 'mirage', 'nova', 'orbit', 'paradox',
  'resonance', 'silhouette', 'tempo', 'unity', 'whisper', 'xenon',
  'yearn', 'zephyr', 'aurora', 'blaze', 'cosmic', 'dynamo',
  'eclipse', 'fable', 'galaxy', 'halo', 'illusion', 'journey',
  'nebula', 'stellar', 'infinity', 'momentum', 'serenity', 'odyssey',
  'radiance', 'clarity', 'velocity', 'inertia', 'harmony', 'entropy',
  'prism', 'crystal', 'emberlight', 'nightfall', 'daybreak', 'afterglow',
  'starlight', 'moonbeam', 'sunflare', 'wildfire', 'tidal', 'deepwave',
  'skylark', 'stormfront', 'rainfall', 'thunder', 'lightning', 'frost',
  'glacier', 'summit', 'valley', 'forest', 'meadow', 'river',
  'ocean', 'desert', 'island', 'volcano', 'canyon', 'cliff',
  'breeze', 'gust', 'cyclone', 'tempest', 'blizzard', 'hurricane',];

function LibraryGate() {
  const navigate = useNavigate();
  const [openBook, setOpenBook] = useState(null);
  const [hoveredBook, setHoveredBook] = useState(null);
  const [dustParticles, setDustParticles] = useState([]);
  const [opensLeft, setOpensLeft] = useState(80);
  const [ubikClickCount, setUbikClickCount] = useState(0);
  const [kafkaAnswer, setKafkaAnswer] = useState('');
  const [kafkaUnlocked, setKafkaUnlocked] = useState(false);
  const [kafkaError, setKafkaError] = useState(false);
  const [hitchhikerInput, setHitchhikerInput] = useState('');
  const [hitchhikerSolved, setHitchhikerSolved] = useState(false);
  const [hitchhikerError, setHitchhikerError] = useState(false);
  const [meinKampfPhase, setMeinKampfPhase] = useState('idle'); // 'idle' | 'burning' | 'soup'


  // Word puzzle state
  const [showWordPuzzle, setShowWordPuzzle] = useState(false);
  const [placedWords, setPlacedWords] = useState(['', '', '', '', '', '']);
  const [fallingWords, setFallingWords] = useState([]);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);

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
    if (book.isHitchhiker) {
      setHitchhikerInput('');
      setHitchhikerSolved(false);
      setHitchhikerError(false);
    }
    if (book.isMeinKampf) {
      if (meinKampfPhase === 'idle') {
        setMeinKampfPhase('burning');
        setTimeout(() => setMeinKampfPhase('soup'), 2500);
      }
      return;
    }
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

  const handleHitchhikerSubmit = (e) => {
    e.preventDefault();
    if (hitchhikerInput.trim() === '42') {
      setHitchhikerSolved(true);
      setHitchhikerError(false);
    } else {
      setHitchhikerError(true);
    }
  };

  // Word Puzzle handlers
  const createFallingWord = () => {
    // Combine correct words and distractors, shuffle for variety
    const allWords = [...CORRECT_ANSWER, ...DISTRACTOR_WORDS];
    const word = allWords[Math.floor(Math.random() * allWords.length)];

    const wordElement = {
      id: Date.now() + Math.random(),
      text: word,
      left: Math.random() * 85 + 5, // 5-90% from left
      duration: Math.random() * 12 + 12, // 12-24s fall time
      opacity: Math.random() * 0.4 + 0.6,
      fontSize: Math.random() * 12 + 18, // 18-30px
    };

    setFallingWords(prev => {
      // Keep max 50 words on screen at once for performance
      if (prev.length > 50) {
        return [...prev.slice(-40), wordElement];
      }
      return [...prev, wordElement];
    });

    // Remove after animation completes
    setTimeout(() => {
      setFallingWords(prev => prev.filter(w => w.id !== wordElement.id));
    }, (wordElement.duration + 2) * 1000);
  };

  const [draggedWord, setDraggedWord] = useState(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);

  const handleWordDragStart = (e, word) => {
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = 'move';

    // Create custom drag preview
    setDragPreview({ text: word, x: e.clientX, y: e.clientY });

    // Hide default drag image
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => dragImage.remove(), 0);
  };

  const handleSlotDragStart = (e, index) => {
    setDraggedSlotIndex(index);
    e.dataTransfer.effectAllowed = 'move';

    // Create custom drag preview for slot word
    const word = placedWords[index];
    setDragPreview({ text: word, x: e.clientX, y: e.clientY });

    // Hide default drag image
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => dragImage.remove(), 0);
  };

  const handleDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore end drag
    if (dragPreview) {
      setDragPreview(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const handleDragEnd = () => {
    setDragPreview(null);
  };

  const handleSlotDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleSlotDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleSlotDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    const newPlaced = [...placedWords];

    if (draggedWord !== null) {
      // Dropping a falling word
      newPlaced[targetIndex] = draggedWord;
      setDraggedWord(null);
    } else if (draggedSlotIndex !== null) {
      // Swapping words between slots
      const temp = newPlaced[targetIndex];
      newPlaced[targetIndex] = newPlaced[draggedSlotIndex];
      newPlaced[draggedSlotIndex] = temp;
      setDraggedSlotIndex(null);
    }

    setPlacedWords(newPlaced);
  };

  const handleSlotClick = (index) => {
    // Clear the slot
    const newPlaced = [...placedWords];
    newPlaced[index] = '';
    setPlacedWords(newPlaced);
  };

  const checkAnswer = () => {
    const isCorrect = placedWords.every((word, idx) =>
      word.toLowerCase() === CORRECT_ANSWER[idx]
    );

    if (isCorrect) {
      // Navigate to Gate 2
      navigate('/gate-2-hive');
    } else {
      // Show error or reset
      alert('Not quite right! Try again.');
      setPlacedWords(['', '', '', '', '', '']);
    }
  };

  const resetPuzzle = () => {
    setPlacedWords(['', '', '', '', '', '']);
  };

  // Start word puzzle
  useEffect(() => {
    if (!showWordPuzzle) return;

    // Create initial batch of words - MORE WORDS
    for (let i = 0; i < 30; i++) {
      setTimeout(() => createFallingWord(), i * 150);
    }

    // Keep creating words - FASTER SPAWNING
    const interval = setInterval(() => {
      createFallingWord();
    }, 800); // New word every 0.8s

    return () => clearInterval(interval);
  }, [showWordPuzzle]);

  // Split 24 books across 4 shelves (6 per shelf)
  const shelves = [
    BOOKS.slice(0, 6),
    BOOKS.slice(6, 12),
    BOOKS.slice(12, 18),
    BOOKS.slice(18, 24),
  ];

  return (
    <div className="library-container">

      {/* Music Player */}
      <GateMusic
        src={new URL('../assets/audio/ara-ver maswavli chkuas.mp3', import.meta.url).href}
        initialVolume={0.15}
      />

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
        <button
          className="guess-answer-btn"
          onClick={() => setShowWordPuzzle(true)}
        >
          Guess the Answer
        </button>
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
                  {book.isMeinKampf && meinKampfPhase === 'burning' ? (
                    <div style={{ position: 'relative', textAlign: 'center', width: '64px', margin: '0 auto' }}>
                      <style>{`
                        @keyframes mkChar{0%{opacity:1;filter:none;transform:scale(1)}30%{filter:brightness(.7) sepia(1) hue-rotate(-20deg)}70%{opacity:.6;filter:brightness(.2) sepia(1);transform:scale(.92) skewX(3deg)}100%{opacity:0;filter:brightness(0);transform:scale(.8) skewX(-4deg)}}
                        @keyframes mkSmoke{0%{transform:translateY(0) translateX(0) scale(1);opacity:.45}100%{transform:translateY(-55px) translateX(var(--sx,6px)) scale(2.5);opacity:0}}
                        @keyframes mkSpark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--spx,8px),var(--spy,-35px)) scale(0);opacity:0}}
                        @keyframes mkEmber{0%{transform:translateY(0) translateX(0);opacity:1}100%{transform:translateY(var(--ey,-40px)) translateX(var(--ex,10px));opacity:0}}
                        @keyframes mkF1{0%,100%{d:path("M8,52 C4,38 2,24 10,10 C14,22 18,36 14,52Z")}33%{d:path("M8,52 C2,36 4,18 12,6 C17,20 16,38 14,52Z")}66%{d:path("M8,52 C6,40 0,26 8,8 C15,24 20,38 14,52Z")}}
                        @keyframes mkF2{0%,100%{d:path("M26,52 C18,34 20,14 30,0 C40,14 42,34 34,52Z")}33%{d:path("M26,52 C16,30 22,10 30,2 C38,10 44,32 34,52Z")}66%{d:path("M26,52 C20,36 18,16 30,4 C40,18 40,36 34,52Z")}}
                        @keyframes mkF3{0%,100%{d:path("M46,52 C42,38 44,24 52,10 C56,24 58,40 54,52Z")}33%{d:path("M46,52 C44,36 40,20 50,8 C57,22 60,38 54,52Z")}66%{d:path("M46,52 C40,36 46,18 54,12 C58,26 56,40 54,52Z")}}
                        @keyframes mkGlow{0%,100%{opacity:.6;r:10}50%{opacity:.9;r:13}}
                      `}</style>

                      {/* Book charring */}
                      <div style={{ fontSize: '48px', animation: 'mkChar 2.5s forwards', display: 'inline-block', lineHeight: 1 }}>📖</div>

                      {/* Smoke puffs */}
                      {[{x:-8,sx:'-8px'},{x:0,sx:'4px'},{x:8,sx:'10px'}].map((s,i)=>(
                        <div key={i} style={{ position:'absolute', bottom:'70px', left:`calc(50% + ${s.x}px)`, width:'10px', height:'10px', borderRadius:'50%', background:'#888', filter:'blur(3px)', '--sx':s.sx, animation:`mkSmoke ${1.2+i*.4}s ease-out ${i*.3}s infinite`, opacity:0 }}/>
                      ))}

                      {/* Flames SVG */}
                      <div style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }}>
                        <svg width="62" height="56" viewBox="0 0 62 56" style={{ overflow:'visible' }}>
                          <defs>
                            <radialGradient id="glowBase" cx="50%" cy="100%" r="50%">
                              <stop offset="0%" stopColor="#fff176" stopOpacity="0.9"/>
                              <stop offset="100%" stopColor="#ff6a00" stopOpacity="0"/>
                            </radialGradient>
                          </defs>
                          {/* Glow base */}
                          <ellipse cx="31" cy="52" rx="22" ry="7" fill="url(#glowBase)" style={{ animation:'mkGlow .4s ease-in-out infinite' }}/>
                          {/* Outer dark-red back flames */}
                          <path d="M4,52 C0,36 2,20 10,6 C16,20 18,38 14,52Z" fill="#a83200" opacity=".7" style={{ animation:'mkF1 .45s ease-in-out infinite' }}/>
                          <path d="M48,52 C44,36 46,22 54,8 C60,24 60,40 56,52Z" fill="#a83200" opacity=".7" style={{ animation:'mkF3 .5s ease-in-out infinite' }}/>
                          {/* Mid orange flames */}
                          <path d="M8,52 C4,38 2,24 10,10 C14,22 18,36 14,52Z" fill="#e84000" style={{ animation:'mkF1 .35s ease-in-out infinite' }}/>
                          <path d="M46,52 C42,38 44,24 52,10 C56,24 58,40 54,52Z" fill="#e84000" style={{ animation:'mkF3 .4s ease-in-out infinite' }}/>
                          {/* Center tall flame */}
                          <path d="M26,52 C18,34 20,14 30,0 C40,14 42,34 34,52Z" fill="#ff6a00" style={{ animation:'mkF2 .3s ease-in-out infinite' }}/>
                          {/* Inner yellow flames */}
                          <path d="M16,52 C12,38 14,24 22,12 C28,26 28,40 24,52Z" fill="#ffb300" style={{ animation:'mkF1 .25s ease-in-out infinite' }}/>
                          <path d="M38,52 C36,38 36,24 44,14 C50,28 48,42 46,52Z" fill="#ffb300" style={{ animation:'mkF3 .28s ease-in-out infinite' }}/>
                          {/* White-hot core */}
                          <path d="M24,52 C20,40 22,28 30,14 C38,28 40,42 36,52Z" fill="#fff176" opacity=".85" style={{ animation:'mkF2 .2s ease-in-out infinite' }}/>
                          {/* Hot base ellipse */}
                          <ellipse cx="31" cy="51" rx="14" ry="5" fill="white" opacity=".5"/>
                        </svg>
                      </div>

                      {/* Sparks */}
                      {[
                        {l:'30%',spy:'-42px',spx:'-14px',d:.0},{l:'50%',spy:'-50px',spx:'8px',d:.15},
                        {l:'20%',spy:'-38px',spx:'-6px',d:.3},{l:'65%',spy:'-44px',spx:'12px',d:.1},
                        {l:'45%',spy:'-56px',spx:'-10px',d:.25},{l:'55%',spy:'-34px',spx:'16px',d:.4},
                      ].map((sp,i)=>(
                        <div key={i} style={{ position:'absolute', bottom:'44px', left:sp.l, width:'3px', height:'3px', borderRadius:'50%', background:'#ffdd00', boxShadow:'0 0 4px #ff8800', '--spx':sp.spx, '--spy':sp.spy, animation:`mkSpark .6s ease-out ${sp.d}s infinite` }}/>
                      ))}

                      {/* Floating embers */}
                      {[
                        {l:'25%',ex:'-12px',ey:'-48px',d:.0},{l:'70%',ex:'10px',ey:'-52px',d:.2},
                        {l:'40%',ex:'-6px',ey:'-44px',d:.45},{l:'60%',ex:'14px',ey:'-40px',d:.1},
                        {l:'35%',ex:'-16px',ey:'-56px',d:.35},
                      ].map((em,i)=>(
                        <div key={i} style={{ position:'absolute', bottom:'50px', left:em.l, width:'2px', height:'4px', borderRadius:'2px', background:'#ff6600', '--ex':em.ex, '--ey':em.ey, animation:`mkEmber ${1+i*.15}s ease-out ${em.d}s infinite` }}/>
                      ))}
                    </div>
                  ) : book.isMeinKampf && meinKampfPhase === 'soup' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '52px' }}>🧼</div>
                      <div className="book-title-label">Soap</div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
              {openBook.isBlueMountains ? (
                // Blue Mountains - SVG illustration + text
                <div style={{ textAlign: 'center' }}>
                  <svg width="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', marginBottom: '20px' }}>
                    {/* Sky gradient */}
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1a2a4a"/>
                        <stop offset="100%" stopColor="#3a6fa8"/>
                      </linearGradient>
                      <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2a4a7a"/>
                        <stop offset="100%" stopColor="#1a3060"/>
                      </linearGradient>
                      <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4a7aad"/>
                        <stop offset="100%" stopColor="#2a5a90"/>
                      </linearGradient>
                      <linearGradient id="mtn3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7aade0"/>
                        <stop offset="100%" stopColor="#4a8abf"/>
                      </linearGradient>
                    </defs>
                    {/* Sky */}
                    <rect width="400" height="200" fill="url(#skyGrad)"/>
                    {/* Stars */}
                    <circle cx="30" cy="20" r="1" fill="white" opacity="0.7"/>
                    <circle cx="80" cy="12" r="1.2" fill="white" opacity="0.6"/>
                    <circle cx="150" cy="8" r="1" fill="white" opacity="0.8"/>
                    <circle cx="220" cy="15" r="0.8" fill="white" opacity="0.5"/>
                    <circle cx="300" cy="10" r="1.2" fill="white" opacity="0.7"/>
                    <circle cx="370" cy="18" r="1" fill="white" opacity="0.6"/>
                    <circle cx="350" cy="5" r="0.8" fill="white" opacity="0.5"/>
                    <circle cx="60" cy="35" r="0.7" fill="white" opacity="0.4"/>
                    <circle cx="260" cy="28" r="0.9" fill="white" opacity="0.6"/>
                    {/* Moon */}
                    <circle cx="340" cy="35" r="14" fill="#c8d8f0" opacity="0.9"/>
                    <circle cx="347" cy="30" r="11" fill="#3a6fa8" opacity="0.85"/>
                    {/* Far mountains - darkest, tallest */}
                    <polygon points="0,160 60,60 120,130 180,50 260,110 330,45 400,120 400,200 0,200" fill="url(#mtn1)" opacity="0.9"/>
                    {/* Snow caps - far mountains */}
                    <polygon points="60,60 50,80 70,80" fill="white" opacity="0.6"/>
                    <polygon points="180,50 168,75 192,75" fill="white" opacity="0.6"/>
                    <polygon points="330,45 318,72 342,72" fill="white" opacity="0.6"/>
                    {/* Mid mountains */}
                    <polygon points="0,180 80,95 150,145 230,85 310,135 400,90 400,200 0,200" fill="url(#mtn2)" opacity="0.95"/>
                    {/* Snow caps - mid mountains */}
                    <polygon points="80,95 70,115 90,115" fill="white" opacity="0.5"/>
                    <polygon points="230,85 218,108 242,108" fill="white" opacity="0.5"/>
                    <polygon points="400,90 388,112 400,112" fill="white" opacity="0.4"/>
                    {/* Foreground mountains - lightest blue, atmospheric */}
                    <polygon points="0,200 100,130 170,170 250,115 340,160 400,130 400,200" fill="url(#mtn3)" opacity="1"/>
                    {/* Mist / fog layer */}
                    <rect x="0" y="175" width="400" height="25" fill="#7aade0" opacity="0.25"/>
                    <ellipse cx="200" cy="185" rx="200" ry="18" fill="#a8cce8" opacity="0.15"/>
                  </svg>
                  {openBook.content.split('\n').map((line, i) => (
                    <p key={i} className={line === '' ? 'book-line-break' : 'book-line'} style={{ fontStyle: 'italic', color: '#8fb8d8' }}>{line}</p>
                  ))}
                </div>
              ) : openBook.isMeinKampf ? (
                // Mein Kampf - burn it, reveal soup
                <div style={{ textAlign: 'center' }}>
                  {meinKampfPhase === 'burning' && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <style>{`
                        @keyframes flicker1 { 0%,100%{transform:scaleX(1) scaleY(1) translateY(0)} 25%{transform:scaleX(1.1) scaleY(1.15) translateY(-4px)} 50%{transform:scaleX(0.9) scaleY(1.2) translateY(-8px)} 75%{transform:scaleX(1.05) scaleY(1.1) translateY(-3px)} }
                        @keyframes flicker2 { 0%,100%{transform:scaleX(1) scaleY(1) translateY(0)} 20%{transform:scaleX(0.85) scaleY(1.2) translateY(-6px)} 60%{transform:scaleX(1.1) scaleY(1.3) translateY(-10px)} 80%{transform:scaleX(0.95) scaleY(1.1) translateY(-2px)} }
                        @keyframes bookChar { 0%{opacity:1;filter:none} 60%{opacity:0.9;filter:brightness(0.5) sepia(1)} 100%{opacity:0;filter:brightness(0) sepia(1)} }
                        @keyframes ashFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(60px) rotate(360deg);opacity:0} }
                      `}</style>
                      {/* Book charring */}
                      <div style={{ fontSize: '80px', animation: 'bookChar 3s forwards', display: 'inline-block' }}>📖</div>
                      {/* Flame layers */}
                      <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                        <svg width="120" height="100" viewBox="0 0 120 100" style={{ overflow: 'visible' }}>
                          {/* Back flames */}
                          <ellipse cx="30" cy="90" rx="18" ry="8" fill="#b03a00" opacity="0.6" style={{ animation: 'flicker2 0.4s ease-in-out infinite' }}/>
                          <ellipse cx="90" cy="90" rx="16" ry="8" fill="#b03a00" opacity="0.6" style={{ animation: 'flicker1 0.5s ease-in-out infinite' }}/>
                          {/* Main flames */}
                          <path d="M20,90 Q10,55 25,30 Q35,55 30,90Z" fill="#e84000" style={{ animation: 'flicker1 0.35s ease-in-out infinite', transformOrigin: '25px 90px' }}/>
                          <path d="M55,90 Q40,40 60,5 Q78,40 65,90Z" fill="#ff6a00" style={{ animation: 'flicker2 0.3s ease-in-out infinite', transformOrigin: '60px 90px' }}/>
                          <path d="M90,90 Q85,55 100,28 Q110,55 100,90Z" fill="#e84000" style={{ animation: 'flicker1 0.4s ease-in-out infinite', transformOrigin: '95px 90px' }}/>
                          {/* Inner bright flames */}
                          <path d="M35,90 Q30,60 45,35 Q58,60 50,90Z" fill="#ffb300" style={{ animation: 'flicker2 0.25s ease-in-out infinite', transformOrigin: '45px 90px' }}/>
                          <path d="M68,90 Q65,65 75,42 Q85,65 80,90Z" fill="#ffb300" style={{ animation: 'flicker1 0.32s ease-in-out infinite', transformOrigin: '75px 90px' }}/>
                          {/* Core white-hot */}
                          <ellipse cx="60" cy="85" rx="14" ry="7" fill="#fff176" opacity="0.8"/>
                        </svg>
                      </div>
                      {/* Ash particles */}
                      {[15,35,55,75,95].map((x, i) => (
                        <div key={i} style={{ position: 'absolute', top: '10px', left: `${x}px`, width: '6px', height: '6px', borderRadius: '50%', background: '#555', animation: `ashFall ${1.2 + i * 0.3}s ease-in ${i * 0.4}s infinite` }}/>
                      ))}
                    </div>
                  )}
                  {meinKampfPhase === 'soup' && (
                    <div style={{ animation: 'fadeIn 1s ease' }}>
                      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
                      <div style={{ fontSize: '60px', marginBottom: '12px' }}>🍲</div>
                      <p className="book-line" style={{ color: '#c9a95f', fontWeight: 'bold', marginBottom: '16px' }}>
                        The ashes have been repurposed.
                      </p>
                      {`RECIPE: MEMORY SOUP\n\nIngredients:\n- 3 cups of forgotten birthdays\n- 1 tablespoon of first love (finely minced)\n- A pinch of childhood wonder\n- The sound of rain on a window you can no longer find\n\nInstructions:\nCombine all ingredients in a cauldron of regret. Stir counterclockwise until the mixture turns the color of a sunset you once watched with someone whose name you no longer remember. Serves one. Always serves one.`.split('\n').map((line, i) => (
                        <p key={i} className={line === '' ? 'book-line-break' : 'book-line'}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : openBook.isHitchhiker ? (
                // Hitchhiker's Guide - calculation puzzle
                <div className="kafka-puzzle">
                  {openBook.content.split('\n').map((line, i) => (
                    <p key={i} className={line === '' ? 'book-line-break' : 'book-line'}>{line}</p>
                  ))}
                  <div className="book-open-divider" style={{ margin: '16px 0' }} />
                  <p className="kafka-hint" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#8B7355' }}>
                    — DEEP THOUGHT CALCULATOR —<br />
                    <span style={{ fontSize: '11px' }}>7,500,000 years of computation complete.</span>
                  </p>
                  <p className="book-line" style={{ fontStyle: 'italic', margin: '8px 0 16px' }}>
                    "What is the Answer to Life, the Universe, and Everything?"
                  </p>
                  {hitchhikerSolved ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#c9a95f', letterSpacing: '4px' }}>42</div>
                      <p className="book-line" style={{ marginTop: '12px', color: '#8B7355', fontStyle: 'italic' }}>
                        "I checked it very thoroughly, and that quite definitely is the answer."<br />
                        — Deep Thought
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleHitchhikerSubmit} className="kafka-form">
                      <div className="kafka-input-wrapper">
                        <span className="kafka-prefix">Answer =</span>
                        <input
                          type="number"
                          value={hitchhikerInput}
                          onChange={(e) => { setHitchhikerInput(e.target.value); setHitchhikerError(false); }}
                          className={`kafka-input ${hitchhikerError ? 'error' : ''}`}
                          placeholder="?"
                          autoFocus
                          style={{ width: '80px', textAlign: 'center' }}
                        />
                      </div>
                      {hitchhikerError && <p className="kafka-error">That is not the answer. Think deeper.</p>}
                      <button type="submit" className="kafka-submit">Calculate</button>
                    </form>
                  )}
                </div>
              ) : openBook.isKafka && !kafkaUnlocked ? (
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

      {/* Word Puzzle Overlay */}
      {showWordPuzzle && (
        <div className="word-puzzle-overlay">
          <button
            className="word-puzzle-close"
            onClick={() => setShowWordPuzzle(false)}
          >
            ✕
          </button>

          {/* Falling words */}
          <div className="falling-words-container">
            {fallingWords.map(word => (
              <div
                key={word.id}
                className="falling-word"
                style={{
                  left: `${word.left}%`,
                  animationDuration: `${word.duration}s`,
                  opacity: word.opacity,
                  fontSize: `${word.fontSize}px`,
                }}
                draggable
                onDragStart={(e) => handleWordDragStart(e, word.text)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
              >
                {word.text}
              </div>
            ))}
          </div>

          {/* Drag Preview */}
          {dragPreview && (
            <div
              className="drag-preview"
              style={{
                left: dragPreview.x,
                top: dragPreview.y,
              }}
            >
              {dragPreview.text}
            </div>
          )}

          {/* Center placeholders */}
          <div className="word-puzzle-center">
            <h2 className="word-puzzle-title">Catch the Words</h2>
            <p className="word-puzzle-hint">Drag words to the boxes in the correct order • Double-click to remove</p>

            <div className="word-placeholders">
              {placedWords.map((word, index) => (
                <div
                  key={index}
                  className={`word-slot ${word ? 'filled' : 'empty'} ${dragOverIndex === index ? 'drag-over' : ''}`}
                  draggable={!!word}
                  onDragStart={(e) => word && handleSlotDragStart(e, index)}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleSlotDragOver(e, index)}
                  onDragLeave={handleSlotDragLeave}
                  onDrop={(e) => handleSlotDrop(e, index)}
                  onDoubleClick={() => word && handleSlotClick(index)}
                >
                  {word || `${index + 1}`}
                </div>
              ))}
            </div>

            <div className="word-puzzle-controls">
              <button className="word-puzzle-reset" onClick={resetPuzzle}>
                Reset
              </button>
              <button
                className="word-puzzle-submit"
                onClick={checkAnswer}
                disabled={placedWords.some(w => w === '')}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryGate;
