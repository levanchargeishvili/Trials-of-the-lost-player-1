import { useState, useEffect, useRef } from 'react';
import './LastHarvestPuzzle.css';

// Hex positions matching CSS layout (3-4-5-4-3 pattern)
const HEX_POSITIONS = [
  { left: 240, top: 20 },   // 0
  { left: 375, top: 20 },   // 1
  { left: 510, top: 20 },   // 2
  { left: 172, top: 136 },  // 3
  { left: 307, top: 136 },  // 4
  { left: 442, top: 136 },  // 5
  { left: 577, top: 136 },  // 6
  { left: 105, top: 252 },  // 7
  { left: 240, top: 252 },  // 8
  { left: 375, top: 252 },  // 9
  { left: 510, top: 252 },  // 10
  { left: 645, top: 252 },  // 11
  { left: 172, top: 368 },  // 12
  { left: 307, top: 368 },  // 13
  { left: 442, top: 368 },  // 14
  { left: 577, top: 368 },  // 15
  { left: 240, top: 484 },  // 16
  { left: 375, top: 484 },  // 17
  { left: 510, top: 484 },  // 18
];
const HEX_W = 135;
const HEX_H = 155;

// Build vertex map: compute all unique vertices of the hex grid
// In Catan, settlements sit at vertices (intersections of 2-3 hexes)
function buildVertexMap() {
  const VERTEX_OFFSETS = [
    { dx: HEX_W / 2, dy: 0 },           // 0 = top
    { dx: HEX_W, dy: HEX_H * 0.25 },    // 1 = topRight
    { dx: HEX_W, dy: HEX_H * 0.75 },    // 2 = bottomRight
    { dx: HEX_W / 2, dy: HEX_H },        // 3 = bottom
    { dx: 0, dy: HEX_H * 0.75 },         // 4 = bottomLeft
    { dx: 0, dy: HEX_H * 0.25 },         // 5 = topLeft
  ];

  const rawVertices = [];
  for (let h = 0; h < 19; h++) {
    for (let v = 0; v < 6; v++) {
      rawVertices.push({
        x: HEX_POSITIONS[h].left + VERTEX_OFFSETS[v].dx,
        y: HEX_POSITIONS[h].top + VERTEX_OFFSETS[v].dy,
        hexId: h,
        vertexIndex: v,
      });
    }
  }

  // Deduplicate vertices within 3px tolerance (shared between hexes)
  const TOLERANCE = 3;
  const vertices = [];
  const hexVertexToGlobal = {};

  for (const rv of rawVertices) {
    let foundIdx = -1;
    for (let i = 0; i < vertices.length; i++) {
      if (Math.abs(vertices[i].x - rv.x) < TOLERANCE && Math.abs(vertices[i].y - rv.y) < TOLERANCE) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx >= 0) {
      if (!vertices[foundIdx].adjacentHexes.includes(rv.hexId)) {
        vertices[foundIdx].adjacentHexes.push(rv.hexId);
      }
      hexVertexToGlobal[`${rv.hexId}-${rv.vertexIndex}`] = foundIdx;
    } else {
      const id = vertices.length;
      vertices.push({
        id,
        x: rv.x,
        y: rv.y,
        adjacentHexes: [rv.hexId],
        neighbors: [],
      });
      hexVertexToGlobal[`${rv.hexId}-${rv.vertexIndex}`] = id;
    }
  }

  // Build edge adjacency between vertices (needed for distance rule)
  for (let h = 0; h < 19; h++) {
    for (let v = 0; v < 6; v++) {
      const v1 = hexVertexToGlobal[`${h}-${v}`];
      const v2 = hexVertexToGlobal[`${h}-${(v + 1) % 6}`];
      if (v1 !== undefined && v2 !== undefined && v1 !== v2) {
        if (!vertices[v1].neighbors.includes(v2)) vertices[v1].neighbors.push(v2);
        if (!vertices[v2].neighbors.includes(v1)) vertices[v2].neighbors.push(v1);
      }
    }
  }

  return vertices;
}

const VERTEX_MAP = buildVertexMap();

// Catan Board Generator
class CatanBoardGenerator {
  constructor() {
    this.resources = [
      { type: 'wood', image: new URL('../assets/catan/wood.png', import.meta.url).href, name: 'Wood' },
      { type: 'brick', image: new URL('../assets/catan/brick.png', import.meta.url).href, name: 'Brick' },
      { type: 'sheep', image: new URL('../assets/catan/sheep.png', import.meta.url).href, name: 'Sheep' },
      { type: 'wheat', image: new URL('../assets/catan/wheat.png', import.meta.url).href, name: 'Wheat' },
      { type: 'ore', image: new URL('../assets/catan/ore.png', import.meta.url).href, name: 'Ore' },
      { type: 'desert', image: new URL('../assets/catan/desert.png', import.meta.url).href, name: 'Desert' },
    ];

    // Standard Catan number distribution (no 7)
    this.numberTokens = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

    // Player settlement images (colors: purple, blue, red, green)
    this.playerSettlements = [
      new URL('../assets/catan/white.png', import.meta.url).href,   // Player 1
      new URL('../assets/catan/blue.png', import.meta.url).href,    // Player 2
      new URL('../assets/catan/red.png', import.meta.url).href,     // Player 3
      new URL('../assets/catan/green.png', import.meta.url).href,   // Player 4
    ];

    this.board = this.generateBoard();
    this.settlements = this.placeSettlements();
    this.gameLog = this.simulateGame();
  }

  generateBoard() {
    // Standard Catan resource distribution: 4 wood, 4 wheat, 4 sheep, 3 brick, 3 ore, 1 desert
    const resourceDist = [
      'wood', 'wood', 'wood', 'wood',
      'wheat', 'wheat', 'wheat', 'wheat',
      'sheep', 'sheep', 'sheep', 'sheep',
      'brick', 'brick', 'brick',
      'ore', 'ore', 'ore',
      'desert'
    ];

    // Shuffle resources
    const shuffledResources = [...resourceDist].sort(() => Math.random() - 0.5);

    // Shuffle numbers
    const shuffledNumbers = [...this.numberTokens].sort(() => Math.random() - 0.5);

    const hexes = [];
    let numberIndex = 0;

    for (let i = 0; i < 19; i++) {
      const resourceType = shuffledResources[i];
      const resource = this.resources.find(r => r.type === resourceType);

      // Desert has no number
      const number = resourceType === 'desert' ? null : shuffledNumbers[numberIndex++];

      hexes.push({
        id: i,
        resource: resource,
        number: number,
      });
    }

    return hexes;
  }

  placeSettlements() {
    // In Catan, settlements are placed at VERTICES (intersections of 2-3 hexes)
    // Distance rule: no two settlements can be on adjacent vertices
    const usedVertices = new Set();
    const blockedVertices = new Set(); // Adjacent vertices blocked by distance rule
    const settlements = [];
    const playerColors = ['#ffffff', '#3498db', '#e74c3c', '#2ecc71'];

    for (let player = 0; player < 4; player++) {
      const playerPlacements = [];

      for (let s = 0; s < 2; s++) {
        // Valid vertices: not used, not blocked, touching at least 2 hexes (proper intersections)
        const validVertices = VERTEX_MAP.filter(v =>
          !usedVertices.has(v.id) &&
          !blockedVertices.has(v.id) &&
          v.adjacentHexes.length >= 2
        );

        if (validVertices.length === 0) break;

        const vertex = validVertices[Math.floor(Math.random() * validVertices.length)];
        usedVertices.add(vertex.id);

        // Distance rule: block all adjacent vertices
        vertex.neighbors.forEach(n => blockedVertices.add(n));

        playerPlacements.push({
          vertexId: vertex.id,
          x: vertex.x,
          y: vertex.y,
          adjacentHexes: vertex.adjacentHexes,
        });
      }

      settlements.push({
        player: player + 1,
        name: `Player ${player + 1}`,
        color: playerColors[player],
        placements: playerPlacements,
      });
    }

    return settlements;
  }

  simulateGame() {
    const turns = [];
    const numTurns = 30; // 30 turns of data (increased for better solvability)
    let robberHex = 18; // Desert starts with robber

    for (let t = 0; t < numTurns; t++) {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const sum = dice1 + dice2;

      // Handle 7 - robber roll
      if (sum === 7) {
        // Move robber to random non-desert hex
        const nonDesertHexes = this.board
          .map((h, idx) => h.resource.type !== 'desert' ? idx : null)
          .filter(idx => idx !== null);
        const oldRobber = robberHex;
        robberHex = nonDesertHexes[Math.floor(Math.random() * nonDesertHexes.length)];

        turns.push({
          turn: t + 1,
          dice1,
          dice2,
          sum,
          isRobberTurn: true,
          robberFrom: oldRobber + 1,
          robberTo: robberHex + 1,
          production: [],
        });
        continue;
      }

      // Find hexes with this number
      const producingHexes = this.board.filter(h => h.number === sum);

      // Calculate production for each player
      // Each settlement produces from ALL adjacent hexes (vertex-based)
      const production = [];

      this.settlements.forEach(settlement => {
        const resources = {};

        settlement.placements.forEach(placement => {
          placement.adjacentHexes.forEach(hexId => {
            const hex = this.board[hexId];
            // Production blocked if robber is on this hex
            if (hex.number === sum && hex.resource.type !== 'desert' && hexId !== robberHex) {
              resources[hex.resource.type] = (resources[hex.resource.type] || 0) + 1;
            }
          });
        });

        // Add to production log
        Object.entries(resources).forEach(([resourceType, amount]) => {
          production.push({
            player: settlement.name,
            color: settlement.color,
            resource: resourceType,
            amount: amount,
          });
        });
      });

      turns.push({
        turn: t + 1,
        dice1,
        dice2,
        sum,
        isRobberTurn: false,
        production,
        robberBlocks: robberHex,
      });
    }

    return turns;
  }
}

// Standard Catan tile distribution limits
const RESOURCE_LIMITS = {
  wood: 4,
  wheat: 4,
  sheep: 4,
  brick: 3,
  ore: 3,
  desert: 1,
};

const NUMBER_LIMITS = {
  2: 1, 3: 2, 4: 2, 5: 2, 6: 2,
  8: 2, 9: 2, 10: 2, 11: 2, 12: 1,
};

function LastHarvestPuzzle() {
  const [generator] = useState(() => new CatanBoardGenerator());
  const [playerBoard, setPlayerBoard] = useState(Array(19).fill(null).map(() => ({ resource: null, number: null })));
  const [draggedItem, setDraggedItem] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(5); // 5 hints available
  const [revealedHexes, setRevealedHexes] = useState(new Set()); // Track revealed hexes
  const [checkingHex, setCheckingHex] = useState(null); // Currently checking hex
  const [hexFeedback, setHexFeedback] = useState({}); // Feedback for individual hexes
  const feedbackTimeoutRef = useRef(null);

  // Count how many of each resource/number have been placed
  const placedResources = {};
  const placedNumbers = {};
  playerBoard.forEach(hex => {
    if (hex.resource) {
      placedResources[hex.resource.type] = (placedResources[hex.resource.type] || 0) + 1;
    }
    if (hex.number) {
      placedNumbers[hex.number] = (placedNumbers[hex.number] || 0) + 1;
    }
  });

  const getRemainingResource = (type) => (RESOURCE_LIMITS[type] || 0) - (placedResources[type] || 0);
  const getRemainingNumber = (num) => (NUMBER_LIMITS[num] || 0) - (placedNumbers[num] || 0);

  const showInfoFeedback = (message) => {
    setFeedback({ type: 'info', message });

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleDragStart = (item, type) => {
    // Block drag if limit reached
    if (type === 'resource' && getRemainingResource(item.type) <= 0) return;
    if (type === 'number' && getRemainingNumber(item) <= 0) return;
    setDraggedItem({ item, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (hexId) => {
    if (!draggedItem) return;

    // Don't allow dropping on revealed hexes
    if (revealedHexes.has(hexId)) {
      showInfoFeedback('🔒 This tile is locked! It was revealed by a hint and cannot be modified.');
      setDraggedItem(null);
      return;
    }

    const newBoard = [...playerBoard];

    if (draggedItem.type === 'resource') {
      // If replacing an existing resource, that frees up 1 of the old type
      // Check limit for new type considering the swap
      const oldType = newBoard[hexId].resource?.type;
      const effectivePlaced = oldType === draggedItem.item.type
        ? (placedResources[draggedItem.item.type] || 0)
        : (placedResources[draggedItem.item.type] || 0) + (oldType ? 0 : 0);

      if (getRemainingResource(draggedItem.item.type) <= 0 && oldType !== draggedItem.item.type) {
        setDraggedItem(null);
        return;
      }
      // If replacing with same resource on a tile that already has a number, also clear number if switching to desert
      if (draggedItem.item.type === 'desert') {
        newBoard[hexId] = { resource: draggedItem.item, number: null };
      } else {
        newBoard[hexId] = { ...newBoard[hexId], resource: draggedItem.item };
      }
    } else if (draggedItem.type === 'number') {
      // Only allow numbers on non-desert tiles
      if (newBoard[hexId].resource?.type === 'desert') {
        setDraggedItem(null);
        return;
      }
      // Check limit considering swap
      const oldNum = newBoard[hexId].number;
      if (getRemainingNumber(draggedItem.item) <= 0 && oldNum !== draggedItem.item) {
        setDraggedItem(null);
        return;
      }
      newBoard[hexId] = { ...newBoard[hexId], number: draggedItem.item };
    }

    setPlayerBoard(newBoard);
    setDraggedItem(null);
  };

  const handleClearHex = (hexId) => {
    // Don't clear revealed hexes
    if (revealedHexes.has(hexId)) {
      showInfoFeedback('🔒 This tile is locked! It was revealed by a hint and cannot be modified.');
      return;
    }

    const newBoard = [...playerBoard];
    newBoard[hexId] = { resource: null, number: null };
    setPlayerBoard(newBoard);
  };

  const handleSubmit = () => {
    let correctResources = 0;
    let correctNumbers = 0;
    let totalResources = 19;
    let totalNumbers = 18; // Desert doesn't have a number

    playerBoard.forEach((playerHex, idx) => {
      const actualHex = generator.board[idx];

      if (playerHex.resource?.type === actualHex.resource.type) {
        correctResources++;
      }

      if (actualHex.resource.type !== 'desert') {
        if (playerHex.number === actualHex.number) {
          correctNumbers++;
        }
      }
    });

    const resourcePercent = Math.floor((correctResources / totalResources) * 100);
    const numberPercent = Math.floor((correctNumbers / totalNumbers) * 100);
    const totalPercent = Math.floor(((correctResources + correctNumbers) / (totalResources + totalNumbers)) * 100);

    if (totalPercent === 100) {
      setFeedback({
        type: 'success',
        message: '🎉 PERFECT! You reconstructed the hidden board!'
      });
      setSubmitted(true);
    } else {
      setFeedback({
        type: 'error',
        message: `Resources: ${resourcePercent}% | Numbers: ${numberPercent}% | Total: ${totalPercent}%`
      });
    }
  };

  const handleReset = () => {
    setPlayerBoard(Array(19).fill(null).map(() => ({ resource: null, number: null })));
    setFeedback(null);
    setHintsRemaining(5);
    setRevealedHexes(new Set());
    setHexFeedback({});
  };

  const handleRevealRandomTile = () => {
    if (hintsRemaining <= 0) return;

    // Find unrevealed hexes
    const unrevealedHexes = generator.board
      .map((hex, idx) => idx)
      .filter(idx => !revealedHexes.has(idx));

    if (unrevealedHexes.length === 0) {
      showInfoFeedback('All tiles already revealed!');
      return;
    }

    // Pick random unrevealed hex
    const randomIdx = unrevealedHexes[Math.floor(Math.random() * unrevealedHexes.length)];
    const actualHex = generator.board[randomIdx];

    // Reveal it on player board
    const newBoard = [...playerBoard];
    newBoard[randomIdx] = {
      resource: actualHex.resource,
      number: actualHex.number,
    };

    setPlayerBoard(newBoard);
    setRevealedHexes(new Set([...revealedHexes, randomIdx]));
    setHintsRemaining(hintsRemaining - 1);
    showInfoFeedback(`Revealed Hex ${randomIdx + 1}! ${hintsRemaining - 1} hints remaining.`);
  };

  const handleCheckHex = (hexId) => {
    if (hintsRemaining <= 0) return;

    const playerHex = playerBoard[hexId];
    const actualHex = generator.board[hexId];

    // Check if resource and number match
    const resourceMatch = playerHex.resource?.type === actualHex.resource.type;
    const numberMatch = actualHex.resource.type === 'desert' ? true : playerHex.number === actualHex.number;
    const isCorrect = resourceMatch && numberMatch;

    // Determine detailed message
    let message = '';
    let feedbackClass = '';

    if (resourceMatch && numberMatch) {
      message = '✓ Correct!';
      feedbackClass = 'correct';
    } else if (resourceMatch && !numberMatch) {
      message = '✓ Resource Correct\n✗ Number Wrong';
      feedbackClass = 'partial';
    } else if (!resourceMatch && numberMatch) {
      message = '✓ Number Correct\n✗ Resource Wrong';
      feedbackClass = 'partial';
    } else {
      message = '✗ Both Wrong';
      feedbackClass = 'incorrect';
    }

    setHexFeedback({
      ...hexFeedback,
      [hexId]: {
        isCorrect,
        message,
        feedbackClass,
        timestamp: Date.now(),
      }
    });

    setHintsRemaining(hintsRemaining - 1);

    // Clear feedback after 3 seconds (longer for detailed messages)
    setTimeout(() => {
      setHexFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[hexId];
        return newFeedback;
      });
    }, 3000);
  };

  return (
    <div className="catan-puzzle-container">

      {/* Nebula Background */}
      <div className="nebula-bg"></div>
      <div className="fog-layer"></div>

      <div className="puzzle-header">
        <h1 className="puzzle-title glitch" data-text="THE LAST HARVEST">THE LAST HARVEST</h1>
        <p className="puzzle-subtitle">Deduce the hidden Catan board from settlements and game logs...</p>
      </div>

      <div className="puzzle-layout">
        {/* Left: Game Logs */}
        <div className="logs-panel">
          <h3 className="panel-title">📜 GAME LOGS</h3>
          <div className="logs-content">
            {generator.gameLog.map((turn) => (
              <div key={turn.turn} className={`turn-log ${turn.isRobberTurn ? 'robber-turn' : ''}`}>
                <div className="dice-roll-log">
                  <span className="turn-num">Turn {turn.turn}:</span>
                  <span className="dice-display">
                    <span className="die">{turn.dice1}</span>
                    <span className="plus">+</span>
                    <span className="die">{turn.dice2}</span>
                    <span className="equals">=</span>
                    <span className="sum">{turn.sum}</span>
                  </span>
                </div>

                {turn.isRobberTurn ? (
                  <div className="robber-log">
                    <div className="robber-icon">🛡️</div>
                    <div className="robber-text">
                      Robber moved from Hex {turn.robberFrom} → Hex {turn.robberTo}
                    </div>
                  </div>
                ) : turn.production.length > 0 ? (
                  <div className="production-log">
                    <div className="prod-label">Dice {turn.sum}:</div>
                    {turn.production.map((prod, i) => (
                      <div key={i} className="production-item">
                        <span className="player-name" style={{ color: prod.color }}>{prod.player}</span>
                        <span className="got-text">got</span>
                        <span className="resource-amount">{prod.amount}x</span>
                        <span className="resource-name">{prod.resource}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="production-log">
                    <div className="no-production">No production this turn</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Catan Board */}
        <div className="board-section">
          <h3 className="panel-title">🗺️ RECONSTRUCT THE BOARD</h3>
          <p className="board-hint">Settlements are shown. Drag tiles and numbers from the palette.</p>

          {/* Hint System */}
          <div className="hint-system">
            <div className="hint-counter">💡 Hints: {hintsRemaining}/5</div>
            <button
              className="hint-btn reveal-btn"
              onClick={handleRevealRandomTile}
              disabled={hintsRemaining <= 0}
            >
              🎁 Reveal Random Tile
            </button>
            <div className="hint-instructions">Right-click a hex to check if it's correct (costs 1 hint)</div>
          </div>

          <div className="catan-board-hexagon">
            {generator.board.map((hex, idx) => {
              const playerHex = playerBoard[idx];
              const isRevealed = revealedHexes.has(idx);
              const hexCheck = hexFeedback[idx];

              return (
                <div
                  key={idx}
                  className={`catan-hex hex-${idx} ${isRevealed ? 'revealed' : ''} ${hexCheck ? `${hexCheck.feedbackClass}-check` : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  onClick={() => handleClearHex(idx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (hintsRemaining > 0 && !isRevealed) {
                      handleCheckHex(idx);
                    }
                  }}
                  title={isRevealed ? `Hex ${idx + 1} - 🔒 Locked (revealed by hint)` : `Hex ${idx + 1} - Left-click to clear, Right-click to check`}
                  style={{ cursor: isRevealed ? 'not-allowed' : 'pointer' }}
                >
                  <div className="hex-inner">
                    {/* Resource tile background */}
                    {playerHex.resource && (
                      <img
                        src={playerHex.resource.image}
                        alt={playerHex.resource.name}
                        className="hex-resource-img"
                      />
                    )}

                    {/* Robber marker (visual hint) */}
                    {generator.gameLog[generator.gameLog.length - 1]?.robberBlocks === idx && (
                      <img
                        src="/assets/catan/robbery.png"
                        alt="Robber"
                        className="robber-marker"
                      />
                    )}

                    {/* Number token */}
                    {playerHex.number && (
                      <div className="hex-number-token">{playerHex.number}</div>
                    )}

                    {/* Hex ID for reference */}
                    {!playerHex.resource && !playerHex.number && (
                      <div className="hex-id">{idx + 1}</div>
                    )}

                    {/* Revealed indicator */}
                    {isRevealed && (
                      <div className="revealed-badge">
                        <span className="gift-icon">🎁</span>
                        <span className="lock-icon">🔒</span>
                      </div>
                    )}

                    {/* Check feedback */}
                    {hexCheck && (
                      <div className={`hex-check-feedback ${hexCheck.feedbackClass}`}>
                        {hexCheck.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Settlements at vertices — color-specific images by player */}
            {generator.settlements.flatMap((settlement) =>
              settlement.placements.map((placement, pIdx) => (
                <div
                  key={`s-${settlement.player}-${pIdx}`}
                  className="settlement-vertex-marker"
                  style={{
                    left: `${placement.x - 27.5}px`,
                    top: `${placement.y - 27.5}px`,
                  }}
                >
                  <img
                    src={generator.playerSettlements[settlement.player - 1]}
                    alt={`${settlement.name} Settlement`}
                    className="settlement-img"
                  />
                </div>
              ))
            )}
          </div>

          {feedback && (
            <div className={`feedback ${feedback.type} ${feedback.type === 'info' ? 'floating' : ''}`}>{feedback.message}</div>
          )}

          <div className="board-actions">
            <button className="reset-btn" onClick={handleReset}>RESET BOARD</button>
            <button className="submit-btn" onClick={handleSubmit} disabled={submitted}>
              SUBMIT RECONSTRUCTION
            </button>
          </div>
        </div>

        {/* Right: Tile Palette */}
        <div className="palette-panel">
          <h3 className="panel-title">🎨 RESOURCE TILES</h3>
          <div className="resource-palette">
            {generator.resources.map((res, idx) => {
              const remaining = getRemainingResource(res.type);
              const exhausted = remaining <= 0;
              return (
                <div
                  key={idx}
                  className={`palette-item ${exhausted ? 'exhausted' : ''}`}
                  draggable={!exhausted}
                  onDragStart={() => handleDragStart(res, 'resource')}
                >
                  <img src={res.image} alt={res.name} className="palette-img" />
                  <span className="palette-name">{res.name}</span>
                  <span className={`palette-count ${exhausted ? 'count-zero' : ''}`}>
                    {remaining}/{RESOURCE_LIMITS[res.type]}
                  </span>
                </div>
              );
            })}
          </div>

          <h3 className="panel-title">🎲 NUMBER TOKENS</h3>
          <div className="number-palette">
            {[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((num) => {
              const remaining = getRemainingNumber(num);
              const exhausted = remaining <= 0;
              return (
                <div
                  key={num}
                  className={`palette-number ${exhausted ? 'exhausted' : ''}`}
                  draggable={!exhausted}
                  onDragStart={() => handleDragStart(num, 'number')}
                >
                  <span>{num}</span>
                  <span className={`number-count ${exhausted ? 'count-zero' : ''}`}>
                    {remaining}/{NUMBER_LIMITS[num]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="palette-hint">
            💡 Drag tiles and numbers onto hexes.<br/>
            Click a hex to clear it.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LastHarvestPuzzle;
