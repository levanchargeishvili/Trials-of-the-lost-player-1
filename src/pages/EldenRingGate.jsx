import { useState, useEffect, useRef } from 'react';
import GateMusic from '../components/GateMusic';
import './EldenRingGate.css';

const getKnightAnimation = (filename) => new URL(`../assets/eldenring/knight/Colour1/NoOutline/120x80_gifs/${filename}`, import.meta.url).href;

// Game Constants
const KNIGHT_WIDTH = 280;
const KNIGHT_HEIGHT = 200;
const MOVEMENT_SPEED = 6;
const JUMP_FORCE = 18;
const GRAVITY = 0.8;
const MAX_JUMPS = 2;
const PLATFORM_HEIGHT = 220;
const BOSS_WIDTH = 700;
const BOSS_HEIGHT = 500;
const ROCKET_WIDTH = 60;
const ROCKET_HEIGHT = 30;
const HITBOX_SCALE = 0.8;
// Knight sprite is 120x80 intrinsic inside 280x200 frame
// The actual visible knight is ~35x55px within the 120x80 sprite
// At 280x200 scale: visible knight is ~82x137px
const KNIGHT_HITBOX_WIDTH_SCALE = 0.12;   // 280 * 0.12 = ~34px (tight around body)
const KNIGHT_HITBOX_HEIGHT_SCALE = 0.28;  // 200 * 0.28 = ~56px (tight around body)
const KNIGHT_HITBOX_Y_OFFSET_SCALE = 0.45; // Offset to center on visible knight body

// Boss Fight Constants
const BOSS_MAX_HEALTH = 1000;

// Boss States - 4 PHASE CUPHEAD STYLE
const BOSS_FLYING = 'flying';
const BOSS_KNOCKED = 'knocked';
const BOSS_RECOVERING = 'recovering';
const BOSS_DEAD = 'dead';

// Phase HP Thresholds
const PHASE_2_HP = 750;  // 750-500 HP
const PHASE_3_HP = 500;  // 500-250 HP
const PHASE_4_HP = 250;  // 250-0 HP

// Attack Timings
const KNOCKED_DURATION = 5000; // 5 seconds vulnerable
const RECOVERING_DURATION = 1000; // 1 second to get back up
const ROCKET_COUNTDOWN_TIME = 2000; // 2 seconds before explosion
const ROCKET_PROXIMITY_TRIGGER = 150; // Distance to trigger countdown

// Knocked sprite sheet (reusing exhausted frames)
const KNOCKED_FRAME_WIDTH = 222;
const KNOCKED_FRAME_HEIGHT = 375;
const KNOCKED_FRAME_COUNT = 3;
const KNOCKED_FRAME_TIME = 200; // ms per frame

// Dash Constants
const DASH_SPEED_MULT = 3;
const DASH_DURATION = 200;
const DASH_COOLDOWN = 1000;
const DASH_INVULNERABILITY_MS = 500;

// PHASE 1 - Rocket Shower Constants
const P1_SHOWER_ROCKETS_COUNT = 20; // More rockets
const P1_SHOWER_GAP_SIZE = 60;
const P1_SHOWER_SPAWN_HEIGHT = 0; // Start from top of canvas
const P1_SHOWER_FALL_SPEED = 2; // Much slower rain
const RAIN_ROCKET_WIDTH = 40; // Rain rockets
const RAIN_ROCKET_HEIGHT = 40;

// PHASE 2 - Aerial Pressure Constants
const P2_DRONE_HP = 100;
const P2_DRONE_WIDTH = 150;
const P2_DRONE_HEIGHT = 70;
const P2_HOMING_COUNT = 5;
const P2_HOMING_DELAY = 150; // ms between each

// PHASE 3 - Rat Chaos Constants
const P3_RAT_WIDTH = 200;
const P3_RAT_HEIGHT = 200;
const P3_RAT_FRAME_WIDTH = 32; // Each frame in sprite sheet
const P3_RAT_FRAME_HEIGHT = 32;
const P3_RAT_FRAME_COUNT = 6;
const P3_RAT_FRAME_TIME = 120;
const P3_RAT_WEAK_POINT_HP = 150;
const P3_CHEESE_WIDTH = 40;
const P3_CHEESE_HEIGHT = 36;

// PHASE 4 - Bullet Hell Constants
const P4_SPLIT_MINI_COUNT = 4;
const P4_LASER_TELEGRAPH = 1000;
const P4_LASER_DURATION = 2000;

// PHASE TIMELINES - Scripted attack patterns (in seconds)
const PHASE_TIMELINES = {
  1: [ // PHASE 1 - Golden Shower (40s loop)
    { time: 0, action: 'trackingBurst' },
    { time: 4, action: 'rocketRain' },
    { time: 8, action: 'trackingBurst' },
    { time: 12, action: 'giantCoin' },        // GIANT COIN - dodge or parry!
    { time: 16, action: 'rocketRain' },
    { time: 20, action: 'trackingBurst' },
    { time: 22, action: 'soapThrow' },         // SOAP - dodge or slip!
    { time: 24, action: 'coinBarrage' },       // COIN BARRAGE - spam F to parry!
    { time: 30, action: 'rocketRain' },
    { time: 34, action: 'trackingBurst' },
    { time: 36, action: 'soapThrow' },
    { time: 38, action: 'giantCoin' },
    { time: 40, action: 'rocketRain', knockdown: true },
  ],
  2: [ // PHASE 2 - Drone War (30s loop)
    { time: 0, action: 'homingSwarm' },
    { time: 4, action: 'droneShield' },        // Drone creates shield around boss
    { time: 8, action: 'droneLaser' },          // Drone fires sweeping laser
    { time: 10, action: 'soapThrow' },
    { time: 12, action: 'homingSwarm' },
    { time: 16, action: 'diagonalRain', angle: 'left' },
    { time: 20, action: 'droneEMP' },           // Drone EMP - screen flash, coins fall
    { time: 24, action: 'homingSwarm' },
    { time: 26, action: 'soapThrow' },
    { time: 28, action: 'diagonalRain', angle: 'right' },
    { time: 30, action: 'coinBarrage' },
  ],
  3: [ // PHASE 3 - Rat King (25s loop)
    { time: 0, action: 'cheeseThrow' },
    { time: 3, action: 'summonMiniRats' },      // Mini rats swarm
    { time: 6, action: 'cheeseThrow' },
    { time: 9, action: 'cheeseMinefield' },     // Cheese mines on ground
    { time: 11, action: 'soapThrow' },
    { time: 12, action: 'rocketRain' },
    { time: 15, action: 'ratRage' },             // Rat goes berserk, speed doubles
    { time: 18, action: 'cheeseThrow' },
    { time: 20, action: 'diveBomb' },
    { time: 23, action: 'coinBarrage' },
    { time: 25, action: 'rocketRain' },
  ],
  4: [ // PHASE 4 - Bullet Hell (20s loop)
    { time: 0, action: 'cloneShift' },
    { time: 0, action: 'rocketStormStart' },
    { time: 2, action: 'trackingSplit' },
    { time: 3, action: 'soapThrow' },
    { time: 4, action: 'cloneShift' },
    { time: 5, action: 'giantCoin' },
    { time: 6, action: 'laserGrid' },
    { time: 8, action: 'cloneShift' },
    { time: 10, action: 'trackingSplit' },
    { time: 12, action: 'laserGrid' },
    { time: 13, action: 'soapThrow' },
    { time: 14, action: 'cloneShift' },
    { time: 16, action: 'coinBarrage' },
    { time: 18, action: 'trackingSplit' },
    { time: 20, action: 'rocketRain', knockdown: true },
  ],
};

function getKnightHitbox(position) {
  const hitboxWidth = KNIGHT_WIDTH * KNIGHT_HITBOX_WIDTH_SCALE;
  const hitboxHeight = KNIGHT_HEIGHT * KNIGHT_HITBOX_HEIGHT_SCALE;
  const xInset = (KNIGHT_WIDTH - hitboxWidth) / 2;
  const yInset = KNIGHT_HEIGHT * KNIGHT_HITBOX_Y_OFFSET_SCALE;

  return {
    left: position.x + xInset,
    right: position.x + xInset + hitboxWidth,
    top: position.y + yInset,
    bottom: position.y + yInset + hitboxHeight,
  };
}

function getCurrentPhase(hp) {
  if (hp > PHASE_2_HP) return 1;
  if (hp > PHASE_3_HP) return 2;
  if (hp > PHASE_4_HP) return 3;
  return 4;
}

function EldenRingGate() {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight - 100 });

  // Player State
  const [knightPosition, setKnightPosition] = useState({ x: 100, y: 0 });
  const [knightAnimation, setKnightAnimation] = useState('__Idle.gif');
  const [facingDirection, setFacingDirection] = useState('right');

  // Game State
  const rocketsRef = useRef([]);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(BOSS_MAX_HEALTH);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [currentMusic, setCurrentMusic] = useState(new URL('../assets/audio/hava nagila.mp3', import.meta.url).href);

  // Refs for game physics
  const knightPosRef = useRef({ x: 100, y: 0 });
  const knightVelocityRef = useRef({ x: 0, y: 0 });
  const jumpCountRef = useRef(0);
  const isOnGroundRef = useRef(false);
  const keysPressedRef = useRef({});
  const facingDirRef = useRef('right');
  const isAttackingRef = useRef(false);

  // Asset Refs
  const backgroundImgRef = useRef(null);
  const bossImgRef = useRef(null);
  const bossExhaustImgRef = useRef(null);
  const rocketImgsRef = useRef([]);
  const floatPlatformImgRef = useRef(null);
  const droneImgRef = useRef(null);
  const cheeseImgRef = useRef(null);
  const coinImgRef = useRef(null);
  const ratRunImgRef = useRef(null);
  const ratIdleImgRef = useRef(null);
  const ratAttackImgRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Boss State Machine Refs
  const bossPosRef = useRef({ x: 0, y: 0 });
  const bossStateRef = useRef(BOSS_FLYING);
  const bossStateTimerRef = useRef(Date.now());
  const knockedFrameRef = useRef(0);
  const bossHealthRef = useRef(BOSS_MAX_HEALTH);
  const playerHealthRef = useRef(100);
  const currentPhaseRef = useRef(1);

  // Timeline System
  const phaseStartTimeRef = useRef(Date.now());
  const executedActionsRef = useRef(new Set());

  // Phase 2 - Drone
  const droneRef = useRef(null);
  const droneHealthRef = useRef(P2_DRONE_HP);
  const droneBulletsRef = useRef([]);

  // Phase 3 - Rat
  const ratRef = useRef(null);
  const ratWeakPointHPRef = useRef(P3_RAT_WEAK_POINT_HP);
  const ratFrameRef = useRef(0);
  const ratFrameTimeRef = useRef(Date.now());
  const fireZonesRef = useRef([]);

  // Phase 4 - Clones & Lasers
  const bossClonesRef = useRef([]);
  const realBossIndexRef = useRef(0);
  const lasersRef = useRef([]);
  const rocketStormActiveRef = useRef(false);

  // Dash Refs
  const isDashingRef = useRef(false);
  const dashStartTimeRef = useRef(0);
  const dashCooldownEndRef = useRef(0);
  const isInvulnerableRef = useRef(false);
  const dashInvulnerableUntilRef = useRef(0);

  // Screen Shake Refs
  const shakeOffsetRef = useRef({ x: 0, y: 0 });
  const shakeEndTimeRef = useRef(0);
  const shakeIntensityRef = useRef(0);

  // Damage cooldown to prevent instant-death from continuous damage sources
  const lastDamageTimeRef = useRef(0);
  const DAMAGE_COOLDOWN = 500; // 500ms between damage ticks

  // Auto-healing system
  const lastHealTimeRef = useRef(0);
  const HEAL_COOLDOWN = 5000; // 5 seconds between heals
  const HEAL_AMOUNT = 5; // 5 HP per heal

  // Damage flash effect
  const damageFlashRef = useRef(0);

  // Enemy respawn delay
  const enemyRespawnTimeRef = useRef(0);
  const ENEMY_RESPAWN_DELAY = 3000;

  // Parry system (F key)
  const isParryingRef = useRef(false);
  const parryWindowEndRef = useRef(0);
  const parryCooldownEndRef = useRef(0);
  const parryCountRef = useRef(0); // Successful parries
  const parryFlashRef = useRef(0);
  const PARRY_WINDOW = 300; // 300ms parry window
  const PARRY_COOLDOWN = 800;

  // Giant coin attack
  const giantCoinRef = useRef(null);

  // Coin magnet (parried coins fly back at boss)
  const returnCoinsRef = useRef([]);

  // Player collected coins
  const playerCoinsRef = useRef(0);

  // Soap projectiles
  const soapProjectilesRef = useRef([]);
  const soapImgRef = useRef(null);

  // Slip state (when hit by soap)
  const isSlippingRef = useRef(false);
  const slipEndTimeRef = useRef(0);
  const SLIP_DURATION = 600; // ~600ms = one GIF cycle

  // Drone special abilities
  const droneShieldActiveRef = useRef(false);
  const droneLaserRef = useRef(null);

  // Rat special abilities
  const miniRatsRef = useRef([]);
  const cheeseTrapsRef = useRef([]);

  // Combo counter
  const comboCountRef = useRef(0);
  const comboTimerRef = useRef(0);
  const maxComboRef = useRef(0);

  // Score / style points
  const stylePointsRef = useRef(0);
  const styleTextRef = useRef([]);

  // Game over/victory refs
  const gameOverRef = useRef(false);
  const victoryRef = useRef(false);

  function triggerScreenShake(intensity, duration) {
    shakeIntensityRef.current = intensity;
    shakeEndTimeRef.current = Date.now() + duration;
    // Trigger damage flash for player hits
    if (intensity >= 2) {
      damageFlashRef.current = Date.now() + 300;
    }
  }

  // Load assets & Initialize positions
  useEffect(() => {
    const bgImg = new Image();
    bgImg.src = new URL('../assets/eldenring/background.png', import.meta.url).href;
    backgroundImgRef.current = bgImg;

    const bossImg = new Image();
    bossImg.src = new URL('../assets/eldenring/boss.png', import.meta.url).href;
    bossImgRef.current = bossImg;

    const bossExhaustImg = new Image();
    bossExhaustImg.src = new URL('../assets/eldenring/boss_exhausted.png', import.meta.url).href;
    bossExhaustImgRef.current = bossExhaustImg;

    const rocketImages = [];
    for (let i = 1; i <= 6; i++) {
      const img = new Image();
      img.src = new URL(`../assets/eldenring/rockets/rocket${i}.png`, import.meta.url).href;
      rocketImages.push(img);
    }
    rocketImgsRef.current = rocketImages;

    const floatImg = new Image();
    floatImg.src = new URL('../assets/eldenring/float.png', import.meta.url).href;
    floatPlatformImgRef.current = floatImg;

    const droneImg = new Image();
    droneImg.src = new URL('../assets/eldenring/drone.png', import.meta.url).href;
    droneImgRef.current = droneImg;

    const cheeseImg = new Image();
    cheeseImg.src = new URL('../assets/eldenring/cheese.webp', import.meta.url).href;
    cheeseImgRef.current = cheeseImg;

    const ratRunImg = new Image();
    ratRunImg.src = new URL('../assets/eldenring/Rat/OutlinedRat/rat-run-outline.png', import.meta.url).href;
    ratRunImgRef.current = ratRunImg;

    const ratIdleImg = new Image();
    ratIdleImg.src = new URL('../assets/eldenring/Rat/OutlinedRat/rat-idle-outline.png', import.meta.url).href;
    ratIdleImgRef.current = ratIdleImg;

    const ratAttackImg = new Image();
    ratAttackImg.src = new URL('../assets/eldenring/Rat/OutlinedRat/rat-attack-outline.png', import.meta.url).href;
    ratAttackImgRef.current = ratAttackImg;

    const coinImg = new Image();
    coinImg.src = new URL('../assets/eldenring/gold_coin.png', import.meta.url).href;
    coinImgRef.current = coinImg;

    const soapImg = new Image();
    soapImg.src = new URL('../assets/eldenring/soap.png', import.meta.url).href;
    soapImgRef.current = soapImg;

    const now = Date.now();
    // Boss floats in the air - positioned to the right near edge
    bossPosRef.current = {
      x: canvasSize.width - BOSS_WIDTH - 50,
      y: 50 // Flying high in the air
    };

    bossStateRef.current = BOSS_FLYING;
    bossStateTimerRef.current = now;
    currentPhaseRef.current = 1;
    phaseStartTimeRef.current = now;
    executedActionsRef.current = new Set();

    console.log('🎮 PHASE 1 STARTED - Rocket Shower');
    console.log('📋 Timeline:', PHASE_TIMELINES[1]);
  }, [canvasSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight - 100 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Input Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOverRef.current) return;
      if (isSlippingRef.current) return; // Can't act while slipping

      const key = e.key.toLowerCase();
      if (['a', 'd'].includes(key)) {
        e.preventDefault();
        keysPressedRef.current[key] = true;
      }

      // Space for Jump
      if (e.key === ' ') {
        e.preventDefault();
        if (jumpCountRef.current < MAX_JUMPS) {
          knightVelocityRef.current.y = -JUMP_FORCE;
          jumpCountRef.current += 1;
          setKnightAnimation('__Jump.gif');
        }
      }

      // Shift for Dash
      if (e.key === 'Shift') {
        e.preventDefault();
        const now = Date.now();
        if (!isDashingRef.current && now >= dashCooldownEndRef.current) {
          isDashingRef.current = true;
          isInvulnerableRef.current = true;
          dashStartTimeRef.current = now;
          dashInvulnerableUntilRef.current = now + DASH_INVULNERABILITY_MS;
          setKnightAnimation('__Dash.gif');
        }
      }

      // F for Parry
      if (key === 'f') {
        e.preventDefault();
        const now = Date.now();
        if (!isParryingRef.current && now >= parryCooldownEndRef.current) {
          isParryingRef.current = true;
          parryWindowEndRef.current = now + PARRY_WINDOW;
          parryCooldownEndRef.current = now + PARRY_COOLDOWN;
          setKnightAnimation('__Attack2.gif');
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['a', 'd'].includes(key)) {
        e.preventDefault();
        keysPressedRef.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Input for Attack - Multiple targets
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (gameOverRef.current || victoryRef.current) return;
      if (isSlippingRef.current) return; // Can't attack while slipping

      if (e.button === 0 && !isAttackingRef.current) {
        e.preventDefault();
        isAttackingRef.current = true;
        setKnightAnimation('__Attack.gif');

        const playerX = knightPosRef.current.x;
        const playerY = knightPosRef.current.y;

        // Attack KNOCKED boss
        if (bossStateRef.current === BOSS_KNOCKED) {
          const bossX = bossPosRef.current.x;
          const bossY = bossPosRef.current.y;

          const distance = Math.sqrt(
            Math.pow(bossX - playerX, 2) + Math.pow(bossY - playerY, 2)
          );

          if (distance < 500) {
            const newHP = Math.max(0, bossHealthRef.current - 50);
            bossHealthRef.current = newHP;
            setBossHealth(newHP);
            triggerScreenShake(4, 200);
            console.log(`⚔️ Boss hit! HP: ${newHP}`);
          }
        }

        // Phase 2: Attack Drone
        if (droneRef.current) {
          const drone = droneRef.current;
          const distance = Math.sqrt(
            Math.pow(drone.x - playerX, 2) + Math.pow(drone.y - playerY, 2)
          );

          if (distance < 300) {
            droneHealthRef.current = Math.max(0, droneHealthRef.current - 20);
            triggerScreenShake(3, 150);
            console.log(`🤖 Drone hit! HP: ${droneHealthRef.current}`);
          }
        }

        // Attack mini rats
        miniRatsRef.current = miniRatsRef.current.filter(mr => {
          const dist = Math.sqrt((mr.x - playerX) ** 2 + (mr.y - playerY) ** 2);
          if (dist < 200) {
            triggerScreenShake(2, 100);
            stylePointsRef.current += 10;
            return false;
          }
          return true;
        });

        // Phase 3: Attack Rat Weak Point
        if (ratRef.current) {
          const ratCenterX = ratRef.current.x + P3_RAT_WIDTH / 2;
          const ratCenterY = ratRef.current.y + P3_RAT_HEIGHT / 2;
          const distance = Math.sqrt(
            Math.pow(ratCenterX - playerX, 2) + Math.pow(ratCenterY - playerY, 2)
          );

          if (distance < 250) {
            ratWeakPointHPRef.current = Math.max(0, ratWeakPointHPRef.current - 25);
            triggerScreenShake(4, 200);
            console.log(`🐀 Rat hit! HP: ${ratWeakPointHPRef.current}`);
          }
        }

        setTimeout(() => {
          isAttackingRef.current = false;
          if (isOnGroundRef.current && !keysPressedRef.current['a'] && !keysPressedRef.current['d']) {
            setKnightAnimation('__Idle.gif');
          }
        }, 700);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('contextmenu', handleContextMenu);
      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  // ===== PHASE 1 ATTACKS =====

  function trackingBurst() {
    const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
    const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;

    console.log('🚀 P1: Tracking Burst');

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
        const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
        const dx = playerX - bossX;
        const dy = playerY - bossY;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 5;
        const vx = (dx / mag) * speed;
        const vy = (dy / mag) * speed;

        const rocketType = Math.floor(Math.random() * 6) + 1;
        const spawnTime = Date.now();
        rocketsRef.current = [...rocketsRef.current, {
          id: spawnTime + Math.random(),
          x: bossX,
          y: bossY,
          vx,
          vy,
          type: rocketType,
          tracking: true,
          speed: speed,
          countdown: null,
          countdownStart: null,
          spawnTime: spawnTime,
        }];
      }, i * 300);
    }

    triggerScreenShake(2, 100);
  }

  function rocketRain(angle = 'vertical') {
    const totalWidth = canvasSize.width;

    console.log(`🌧️ Rocket Rain (${angle})`);

    for (let i = 0; i < P1_SHOWER_ROCKETS_COUNT; i++) {
      // Randomized positions across the width with some jitter
      const x = (totalWidth / P1_SHOWER_ROCKETS_COUNT) * i + Math.random() * P1_SHOWER_GAP_SIZE;

      let vx = 0;
      let vy = P1_SHOWER_FALL_SPEED + Math.random() * 0.5; // Slight speed variation

      // Diagonal angles for Phase 2+
      if (angle === 'left') {
        vx = -1.5;
      } else if (angle === 'right') {
        vx = 1.5;
      }

      // Stagger spawn times slightly for natural rain feel
      const delay = Math.random() * 500;

      setTimeout(() => {
        const rocketType = Math.floor(Math.random() * 6) + 1;
        rocketsRef.current = [...rocketsRef.current, {
          id: Date.now() + Math.random() + i,
          x: x,
          y: P1_SHOWER_SPAWN_HEIGHT - Math.random() * 50, // Start at/above top
          vx,
          vy,
          type: rocketType,
          tracking: false,
          speed: Math.sqrt(vx * vx + vy * vy),
          shower: true,
          small: true, // Flag for smaller rendering
        }];
      }, delay);
    }

    triggerScreenShake(3, 200);
  }

  // ===== PHASE 2 ATTACKS =====

  function homingSwarm() {
    const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
    const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;

    console.log('🎯 P2: Homing Swarm');

    for (let i = 0; i < P2_HOMING_COUNT; i++) {
      setTimeout(() => {
        const angle = (Math.PI / 4) * (i - 2); // Spread pattern
        const speed = 6;

        const rocketType = Math.floor(Math.random() * 6) + 1;
        rocketsRef.current = [...rocketsRef.current, {
          id: Date.now() + Math.random(),
          x: bossX,
          y: bossY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          type: rocketType,
          homing: true,
          speed: speed,
        }];
      }, i * P2_HOMING_DELAY);
    }

    triggerScreenShake(3, 150);
  }

  function diagonalRain(angle) {
    rocketRain(angle);
  }

  function spawnDrone() {
    if (droneRef.current) return; // Already exists

    droneRef.current = {
      x: canvasSize.width - 200,
      y: 150,
      vx: 2,
      vy: 1,
    };
    droneHealthRef.current = P2_DRONE_HP;

    console.log('🤖 P2: Drone Spawned');
  }

  function droneFire() {
    if (!droneRef.current) return;

    const dx = knightPosRef.current.x - droneRef.current.x;
    const dy = knightPosRef.current.y - droneRef.current.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 3;

    droneBulletsRef.current = [...droneBulletsRef.current, {
      id: Date.now() + Math.random(),
      x: droneRef.current.x,
      y: droneRef.current.y,
      vx: (dx / mag) * speed,
      vy: (dy / mag) * speed,
      lifetime: Date.now() + 3000,
    }];
  }

  // ===== PHASE 3 ATTACKS =====

  function spawnRat() {
    if (ratRef.current) return;

    ratRef.current = {
      x: canvasSize.width - P3_RAT_WIDTH - 50,
      y: 150,
      vx: -2,
      vy: 1.5,
    };
    ratWeakPointHPRef.current = P3_RAT_WEAK_POINT_HP;
    ratFrameRef.current = 0;
    ratFrameTimeRef.current = Date.now();

    console.log('🐀 P3: Rat Spawned');
  }

  function cheeseThrow() {
    if (!ratRef.current) return;

    console.log('🧀 P3: Cheese Throw');

    const ratX = ratRef.current.x + P3_RAT_WIDTH / 2;
    const ratY = ratRef.current.y + P3_RAT_HEIGHT / 4;
    const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
    const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;

    // Throw 3 cheese projectiles in spread pattern
    for (let i = 0; i < 3; i++) {
      const spreadAngle = (i - 1) * 0.3;
      const dx = playerX - ratX;
      const dy = playerY - ratY;
      const speed = 4;

      const baseAngle = Math.atan2(dy, dx) + spreadAngle;

      rocketsRef.current = [...rocketsRef.current, {
        id: Date.now() + Math.random() + i,
        x: ratX,
        y: ratY,
        vx: Math.cos(baseAngle) * speed,
        vy: Math.sin(baseAngle) * speed,
        type: 1,
        tracking: false,
        speed: speed,
        cheese: true, // Render as cheese
      }];
    }

    triggerScreenShake(3, 200);
  }

  function diveBomb() {
    if (!ratRef.current) return;

    console.log('💣 P3: Rat Dive Bomb');

    const startX = ratRef.current.x;
    const targetY = canvasSize.height - PLATFORM_HEIGHT - 100;

    // Create explosion trail
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = startX - (i * 80);
        const rocketType = Math.floor(Math.random() * 6) + 1;
        rocketsRef.current = [...rocketsRef.current, {
          id: Date.now() + Math.random(),
          x: x,
          y: targetY,
          vx: 0,
          vy: 0,
          type: rocketType,
          tracking: false,
          speed: 0,
          countdown: 500,
          countdownStart: Date.now(),
          explosion: true,
        }];
      }, i * 500);
    }

    triggerScreenShake(7, 600);
  }

  // ===== PHASE 4 ATTACKS =====

  function cloneShift() {
    console.log('👥 P4: Clone Shift');

    const positions = [
      { x: canvasSize.width / 4, y: 50 },
      { x: canvasSize.width / 2, y: 50 },
      { x: (canvasSize.width * 3) / 4, y: 50 },
    ];

    realBossIndexRef.current = Math.floor(Math.random() * positions.length);
    bossClonesRef.current = positions.map((pos, idx) => ({
      x: pos.x - BOSS_WIDTH / 2,
      y: pos.y,
      isReal: idx === realBossIndexRef.current,
    }));

    bossPosRef.current = {
      x: positions[realBossIndexRef.current].x - BOSS_WIDTH / 2,
      y: positions[realBossIndexRef.current].y,
    };
  }

  function trackingSplit() {
    console.log('💥 P4: Tracking Split');

    const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
    const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;

    const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
    const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
    const dx = playerX - bossX;
    const dy = playerY - bossY;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;

    const speed = 7;
    const rocketType = Math.floor(Math.random() * 6) + 1;
    const spawnTime = Date.now();
    rocketsRef.current = [...rocketsRef.current, {
      id: spawnTime + Math.random(),
      x: bossX,
      y: bossY,
      vx: (dx / mag) * speed,
      vy: (dy / mag) * speed,
      type: rocketType,
      tracking: true,
      speed: speed,
      countdown: null,
      countdownStart: null,
      spawnTime: spawnTime,
      split: true, // Will split on explosion
    }];

    triggerScreenShake(3, 150);
  }

  function laserGrid() {
    console.log('⚡ P4: Laser Grid');

    // Horizontal lasers
    for (let i = 0; i < 2; i++) {
      const y = 200 + (i * 250);
      lasersRef.current = [...lasersRef.current, {
        id: Date.now() + Math.random(),
        type: 'horizontal',
        y: y,
        telegraphStart: Date.now(),
        fireTime: Date.now() + P4_LASER_TELEGRAPH,
        endTime: Date.now() + P4_LASER_TELEGRAPH + P4_LASER_DURATION,
      }];
    }

    // Vertical lasers
    for (let i = 0; i < 3; i++) {
      const x = 200 + (i * 300);
      lasersRef.current = [...lasersRef.current, {
        id: Date.now() + Math.random(),
        type: 'vertical',
        x: x,
        telegraphStart: Date.now(),
        fireTime: Date.now() + P4_LASER_TELEGRAPH,
        endTime: Date.now() + P4_LASER_TELEGRAPH + P4_LASER_DURATION,
      }];
    }

    triggerScreenShake(5, 400);
  }

  function rocketStormStart() {
    rocketStormActiveRef.current = true;
    console.log('🌪️ P4: Rocket Storm ACTIVE');
  }

  function fireStormRocket() {
    if (!rocketStormActiveRef.current) return;

    const x = Math.random() * canvasSize.width;
    const pattern = Math.random();
    let vx = 0;
    let vy = 3; // Slower storm rockets

    if (pattern < 0.5) {
      // Zig-zag pattern
      vx = Math.sin(Date.now() * 0.005) * 2;
    }

    const rocketType = Math.floor(Math.random() * 6) + 1;
    rocketsRef.current = [...rocketsRef.current, {
      id: Date.now() + Math.random(),
      x: x,
      y: 0, // Start from top
      vx,
      vy,
      type: rocketType,
      tracking: false,
      speed: Math.sqrt(vx * vx + vy * vy),
      shower: true,
      small: true,
      zigzag: pattern < 0.5,
    }];
  }

  // ===== NEW CREATIVE ATTACKS =====

  function giantCoin() {
    console.log('🪙 GIANT COIN!');
    const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
    const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;
    const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
    const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
    const dx = playerX - bossX;
    const dy = playerY - bossY;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 2.5;

    giantCoinRef.current = {
      x: bossX - 60,
      y: bossY,
      vx: (dx / mag) * speed,
      vy: (dy / mag) * speed,
      size: 120,
      parryHits: 0, // needs 3 parries to deflect back
      rotation: 0,
      spawnTime: Date.now(),
    };

    triggerScreenShake(6, 400);
  }

  function coinBarrage() {
    console.log('🪙🪙 COIN BARRAGE - Spam F to parry!');
    const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
    const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
        const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
        const dy = playerY - bossY;
        const dx = playerX - bossX;
        const speed = 4 + Math.random() * 2;
        const spread = (Math.random() - 0.5) * 0.5;
        const angle = Math.atan2(dy, dx) + spread;

        rocketsRef.current = [...rocketsRef.current, {
          id: Date.now() + Math.random() + i,
          x: bossX,
          y: bossY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          type: 1,
          tracking: false,
          speed: speed,
          shower: true,
          parryable: true,
          small: true,
        }];
      }, i * 150);
    }
    triggerScreenShake(4, 300);
  }

  function soapThrow() {
    console.log('🧼 SOAP THROW!');
    const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
    const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;
    const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
    const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
    const dx = playerX - bossX;
    const dy = playerY - bossY;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 5;

    soapProjectilesRef.current.push({
      id: Date.now() + Math.random(),
      x: bossX - 25,
      y: bossY,
      vx: (dx / mag) * speed,
      vy: (dy / mag) * speed,
      size: 50,
      rotation: 0,
    });

    triggerScreenShake(3, 200);
  }

  function droneShield() {
    if (!droneRef.current) return;
    console.log('🛡️ Drone Shield!');
    droneShieldActiveRef.current = true;
    setTimeout(() => { droneShieldActiveRef.current = false; }, 6000);
  }

  function droneLaser() {
    if (!droneRef.current) return;
    console.log('⚡ Drone Laser!');
    const drone = droneRef.current;
    droneLaserRef.current = {
      x: drone.x + P2_DRONE_WIDTH / 2,
      y: drone.y + P2_DRONE_HEIGHT,
      angle: -Math.PI / 2,
      sweepSpeed: 0.02,
      startTime: Date.now(),
      duration: 3000,
      telegraphEnd: Date.now() + 800,
    };
    triggerScreenShake(4, 200);
  }

  function droneEMP() {
    if (!droneRef.current) return;
    console.log('💥 Drone EMP!');
    const drone = droneRef.current;
    damageFlashRef.current = Date.now() + 500;
    triggerScreenShake(8, 600);

    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const speed = 3;
      rocketsRef.current = [...rocketsRef.current, {
        id: Date.now() + Math.random() + i,
        x: drone.x + P2_DRONE_WIDTH / 2,
        y: drone.y + P2_DRONE_HEIGHT / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 1,
        tracking: false,
        speed: speed,
        shower: true,
        parryable: true,
      }];
    }
  }

  function summonMiniRats() {
    if (!ratRef.current) return;
    console.log('🐀🐀 Mini Rats!');
    const rat = ratRef.current;
    for (let i = 0; i < 4; i++) {
      miniRatsRef.current.push({
        id: Date.now() + i,
        x: rat.x + Math.random() * P3_RAT_WIDTH,
        y: rat.y + P3_RAT_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        hp: 1,
        frame: 0,
        frameTime: Date.now(),
        size: 60,
      });
    }
    triggerScreenShake(3, 200);
  }

  function cheeseMinefield() {
    if (!ratRef.current) return;
    console.log('🧀💣 Cheese Minefield!');
    const platformYLocal = canvasSize.height - PLATFORM_HEIGHT;
    for (let i = 0; i < 6; i++) {
      const x = 100 + Math.random() * (canvasSize.width - 300);
      cheeseTrapsRef.current.push({
        id: Date.now() + i,
        x: x,
        y: platformYLocal - 30,
        armed: false,
        armTime: Date.now() + 1000,
        size: 35,
        endTime: Date.now() + 8000,
      });
    }
  }

  function ratRage() {
    if (!ratRef.current) return;
    console.log('🐀💀 RAT RAGE!');
    const rat = ratRef.current;
    rat.rage = true;
    rat.rageEnd = Date.now() + 5000;
    rat.vx *= 2;
    rat.vy *= 2;
    triggerScreenShake(5, 400);
  }

  // Main Physics & Game Loop
  useEffect(() => {
    if (gameOver || victory) return;

    const gameLoop = setInterval(() => {
      const now = Date.now();
      const platformY = canvasSize.height - PLATFORM_HEIGHT;

      // ===== PLAYER PHYSICS =====
      knightVelocityRef.current.y += GRAVITY;

      let newX = knightPosRef.current.x;
      let moveSpeed = MOVEMENT_SPEED;

      // Block movement while slipping
      if (isSlippingRef.current) {
        moveSpeed = 0;
      }

      // Dash logic
      if (isDashingRef.current && !isSlippingRef.current) {
        if (now - dashStartTimeRef.current >= DASH_DURATION) {
          isDashingRef.current = false;
          dashCooldownEndRef.current = now + DASH_COOLDOWN;
        } else {
          moveSpeed = MOVEMENT_SPEED * DASH_SPEED_MULT;
        }
      }

      isInvulnerableRef.current = now < dashInvulnerableUntilRef.current;

      if (keysPressedRef.current['a']) {
        newX -= moveSpeed;
        facingDirRef.current = 'left';
      }
      if (keysPressedRef.current['d']) {
        newX += moveSpeed;
        facingDirRef.current = 'right';
      }

      // If dashing but no direction pressed, dash in facing direction
      if (isDashingRef.current && !keysPressedRef.current['a'] && !keysPressedRef.current['d']) {
        const dashDir = facingDirRef.current === 'right' ? 1 : -1;
        newX += moveSpeed * dashDir;
      }

      // Keep player away from screen edges (50px margin)
      const EDGE_MARGIN = 50;
      newX = Math.max(EDGE_MARGIN, Math.min(canvasSize.width - KNIGHT_WIDTH - EDGE_MARGIN, newX));
      let newY = knightPosRef.current.y + knightVelocityRef.current.y;

      const knightBottom = newY + KNIGHT_HEIGHT;
      if (knightBottom >= platformY && knightVelocityRef.current.y >= 0) {
        newY = platformY - KNIGHT_HEIGHT;
        knightVelocityRef.current.y = 0;
        isOnGroundRef.current = true;
        jumpCountRef.current = 0;
      } else {
        isOnGroundRef.current = false;
      }

      knightPosRef.current = { x: newX, y: newY };
      setKnightPosition({ x: newX, y: newY });
      setFacingDirection(facingDirRef.current);

      // ===== PLAYER ANIMATION =====
      if (isSlippingRef.current) {
        // Don't override — animation was set once when slip started
      } else if (!isAttackingRef.current && !isDashingRef.current) {
        const isMovingHorizontal = keysPressedRef.current['a'] || keysPressedRef.current['d'];
        if (!isOnGroundRef.current) {
          if (knightVelocityRef.current.y < 0) {
            setKnightAnimation('__Jump.gif');
          } else {
            setKnightAnimation('__Fall.gif');
          }
        } else if (isMovingHorizontal) {
          setKnightAnimation('__Run.gif');
        } else {
          setKnightAnimation('__Idle.gif');
        }
      }

      // ===== AUTO-HEALING (while standing on platform) =====
      if (isOnGroundRef.current && playerHealthRef.current < 100 && now - lastHealTimeRef.current >= HEAL_COOLDOWN) {
        lastHealTimeRef.current = now;
        const newHP = Math.min(100, playerHealthRef.current + HEAL_AMOUNT);
        playerHealthRef.current = newHP;
        setPlayerHealth(newHP);
      }

      // ===== PHASE SYSTEM & BOSS STATE MACHINE =====
      const elapsed = now - bossStateTimerRef.current;
      const currentPhase = getCurrentPhase(bossHealthRef.current);

      // Check for phase transition
      if (currentPhase !== currentPhaseRef.current && bossStateRef.current !== BOSS_KNOCKED) {
        currentPhaseRef.current = currentPhase;
        phaseStartTimeRef.current = now;
        executedActionsRef.current = new Set();

        console.log(`🎮 PHASE ${currentPhase} STARTED`);
        console.log('📋 Timeline:', PHASE_TIMELINES[currentPhase]);

        // Phase-specific initialization
        if (currentPhase === 2) {
          spawnDrone();
          // Switch to hardtekk music
          setCurrentMusic(new URL('../assets/audio/HAVA NAGILA (HARDTEKK).mp3', import.meta.url).href);
        } else if (currentPhase === 3) {
          spawnRat();
          droneRef.current = null; // Remove drone
        } else if (currentPhase === 4) {
          ratRef.current = null; // Remove rat
          cloneShift();
          rocketStormStart();
        }
      }

      switch (bossStateRef.current) {
        case BOSS_FLYING: {
          // Execute timeline-based attacks
          const phaseTime = (now - phaseStartTimeRef.current) / 1000; // Convert to seconds
          const timeline = PHASE_TIMELINES[currentPhase];

          if (timeline) {
            timeline.forEach((event) => {
              const actionKey = `${currentPhase}-${event.time}-${event.action}`;

              if (phaseTime >= event.time && !executedActionsRef.current.has(actionKey)) {
                executedActionsRef.current.add(actionKey);

                // Execute action
                switch (event.action) {
                  case 'trackingBurst':
                    trackingBurst();
                    break;
                  case 'rocketRain':
                    if (event.knockdown) {
                      rocketRain();
                      // Trigger knockdown
                      setTimeout(() => {
                        bossStateRef.current = BOSS_KNOCKED;
                        bossStateTimerRef.current = Date.now();
                        knockedFrameRef.current = 0;
                        // Clear phase 4 entities during knockdown
                        bossClonesRef.current = [];
                        rocketStormActiveRef.current = false;
                        triggerScreenShake(8, 500);
                        console.log('💥 BOSS KNOCKED!');
                      }, 500);
                    } else {
                      rocketRain();
                    }
                    break;
                  case 'homingSwarm':
                    homingSwarm();
                    break;
                  case 'diagonalRain':
                    diagonalRain(event.angle);
                    break;
                  case 'cheeseThrow':
                    cheeseThrow();
                    break;
                  case 'diveBomb':
                    diveBomb();
                    break;
                  case 'cloneShift':
                    cloneShift();
                    break;
                  case 'trackingSplit':
                    trackingSplit();
                    break;
                  case 'laserGrid':
                    laserGrid();
                    break;
                  case 'rocketStormStart':
                    rocketStormStart();
                    break;
                  case 'giantCoin':
                    giantCoin();
                    break;
                  case 'coinBarrage':
                    coinBarrage();
                    break;
                  case 'droneShield':
                    droneShield();
                    break;
                  case 'droneLaser':
                    droneLaser();
                    break;
                  case 'droneEMP':
                    droneEMP();
                    break;
                  case 'summonMiniRats':
                    summonMiniRats();
                    break;
                  case 'cheeseMinefield':
                    cheeseMinefield();
                    break;
                  case 'ratRage':
                    ratRage();
                    break;
                  case 'soapThrow':
                    soapThrow();
                    break;
                }
              }
            });

            // Loop timeline
            const maxTime = Math.max(...timeline.map(e => e.time));
            if (phaseTime >= maxTime + 2) {
              phaseStartTimeRef.current = now;
              executedActionsRef.current = new Set();
              console.log(`🔁 Phase ${currentPhase} timeline reset`);
            }
          }

          // Phase-specific continuous behavior
          if (currentPhase === 1 || currentPhase === 3) {
            // Gentle floating animation on the right side
            const floatOffset = Math.sin(now * 0.002) * 20;
            if (bossClonesRef.current.length === 0) {
              bossPosRef.current.y = 50 + floatOffset;
              bossPosRef.current.x = canvasSize.width - BOSS_WIDTH - 50;
            }
          } else if (currentPhase === 2) {
            // Horizontal movement centered on right side
            const moveRange = 200;
            const rightCenter = canvasSize.width - BOSS_WIDTH / 2 - 150;
            bossPosRef.current.x = rightCenter - BOSS_WIDTH / 2 + Math.sin(now * 0.001) * moveRange;
          }

          // Phase 2: Drone firing
          if (currentPhase === 2 && droneRef.current && phaseTime % 1 < 0.016) {
            droneFire();
          }

          // Phase 4: Continuous rocket storm (less frequent to reduce lag)
          if (currentPhase === 4 && rocketStormActiveRef.current && phaseTime % 1 < 0.016) {
            fireStormRocket();
          }

          break;
        }

        case BOSS_KNOCKED: {
          // Boss falls to the ground and becomes vulnerable
          // Boss drops so bottom portion rests on platform
          const fallY = platformY - BOSS_HEIGHT * 0.6;
          const currentY = bossPosRef.current.y;

          // Falling animation - faster drop
          if (currentY < fallY) {
            bossPosRef.current.y = Math.min(fallY, currentY + 25);
          } else {
            bossPosRef.current.y = fallY;
          }

          // Animate knocked frames
          const frameTime = elapsed;
          if (frameTime < KNOCKED_FRAME_TIME * KNOCKED_FRAME_COUNT) {
            knockedFrameRef.current = Math.min(
              Math.floor(frameTime / KNOCKED_FRAME_TIME),
              KNOCKED_FRAME_COUNT - 1
            );
          } else {
            knockedFrameRef.current = KNOCKED_FRAME_COUNT - 1;
          }

          // After KNOCKED_DURATION, boss recovers
          if (elapsed >= KNOCKED_DURATION) {
            bossStateRef.current = BOSS_RECOVERING;
            bossStateTimerRef.current = now;
            console.log('⬆️ Boss recovering...');
          }
          break;
        }

        case BOSS_RECOVERING: {
          // Boss rises back up and returns to flying
          const targetY = 50;
          const currentY = bossPosRef.current.y;

          // Rising animation
          if (currentY > targetY) {
            bossPosRef.current.y = Math.max(targetY, currentY - 20);
          }

          // Reverse knocked frames
          const recoverFrame = KNOCKED_FRAME_COUNT - 1 - Math.min(
            Math.floor(elapsed / KNOCKED_FRAME_TIME),
            KNOCKED_FRAME_COUNT - 1
          );
          knockedFrameRef.current = Math.max(0, recoverFrame);

          if (elapsed >= RECOVERING_DURATION) {
            bossStateRef.current = BOSS_FLYING;
            bossStateTimerRef.current = now;
            phaseStartTimeRef.current = now; // Reset timeline
            executedActionsRef.current = new Set();

            // Respawn phase enemies with delay
            if (currentPhaseRef.current === 2 && !droneRef.current) {
              enemyRespawnTimeRef.current = now + ENEMY_RESPAWN_DELAY;
              setTimeout(() => {
                if (currentPhaseRef.current === 2 && !droneRef.current && bossStateRef.current === BOSS_FLYING) {
                  spawnDrone();
                  console.log('🤖 Drone respawned for Phase 2');
                }
              }, ENEMY_RESPAWN_DELAY);
            }
            if (currentPhaseRef.current === 3 && !ratRef.current) {
              enemyRespawnTimeRef.current = now + ENEMY_RESPAWN_DELAY;
              setTimeout(() => {
                if (currentPhaseRef.current === 3 && !ratRef.current && bossStateRef.current === BOSS_FLYING) {
                  spawnRat();
                  console.log('🐀 Rat respawned for Phase 3');
                }
              }, ENEMY_RESPAWN_DELAY);
            }
            if (currentPhaseRef.current === 4) {
              cloneShift();
              rocketStormStart();
              console.log('💀 Phase 4 clones + storm restarted');
            }

            console.log('✈️ Boss recovered!');
          }
          break;
        }

        case BOSS_DEAD:
          // Boss defeated
          rocketStormActiveRef.current = false;
          break;
      }

      // Check victory
      if (bossHealthRef.current <= 0 && bossStateRef.current !== BOSS_DEAD) {
        bossStateRef.current = BOSS_DEAD;
        victoryRef.current = true;
        setVictory(true);
      }

      // ===== UPDATE PHASE ENTITIES =====

      // Phase 2: Update Drone
      if (droneRef.current) {
        droneRef.current.x += droneRef.current.vx;
        droneRef.current.y += droneRef.current.vy;

        // Bounce off walls - drone stays above platform
        if (droneRef.current.x < 0 || droneRef.current.x > canvasSize.width - P2_DRONE_WIDTH) {
          droneRef.current.vx *= -1;
        }
        const droneMaxY = platformY - P2_DRONE_HEIGHT - 20; // Stay above platform
        if (droneRef.current.y < 0 || droneRef.current.y > droneMaxY) {
          droneRef.current.vy *= -1;
          if (droneRef.current.y > droneMaxY) droneRef.current.y = droneMaxY;
        }

        // Check if destroyed
        if (droneHealthRef.current <= 0) {
          droneRef.current = null;
          bossStateRef.current = BOSS_KNOCKED;
          bossStateTimerRef.current = now;
          knockedFrameRef.current = 0;
          // Auto-trigger phase 3 transition when drone is destroyed
          currentPhaseRef.current = 3;
          phaseStartTimeRef.current = now;
          executedActionsRef.current = new Set();
          spawnRat();
          triggerScreenShake(8, 500);
          console.log('🤖 Drone destroyed! Boss stunned! Moving to Phase 3...');
        }
      }

      // Phase 2: Update Drone Bullets
      droneBulletsRef.current = droneBulletsRef.current.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Remove expired
        if (now > bullet.lifetime) return false;

        // Remove off-screen
        if (bullet.x < -20 || bullet.x > canvasSize.width + 20 ||
            bullet.y < -20 || bullet.y > canvasSize.height + 20) {
          return false;
        }

        // Collision with player
        if (!isInvulnerableRef.current) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);
          if (bullet.x > knightHitbox.left && bullet.x < knightHitbox.right &&
              bullet.y > knightHitbox.top && bullet.y < knightHitbox.bottom) {
            const newHP = Math.max(0, playerHealthRef.current - 8);
            playerHealthRef.current = newHP;
            setPlayerHealth(newHP);
            triggerScreenShake(2, 150);
            if (newHP <= 0) {
              gameOverRef.current = true;
              setGameOver(true);
            }
            return false;
          }
        }

        return true;
      });

      // Phase 3: Update Rat (flies around the map)
      if (ratRef.current) {
        ratRef.current.x += ratRef.current.vx;
        ratRef.current.y += (ratRef.current.vy || 0);

        // Bounce off walls
        if (ratRef.current.x < 0 || ratRef.current.x > canvasSize.width - P3_RAT_WIDTH) {
          ratRef.current.vx *= -1;
        }
        // Bounce off top and stay above platform
        const ratMaxY = platformY - P3_RAT_HEIGHT - 20;
        if (ratRef.current.y < 50 || ratRef.current.y > ratMaxY) {
          ratRef.current.vy = -(ratRef.current.vy || 1.5);
          if (ratRef.current.y < 50) ratRef.current.y = 50;
          if (ratRef.current.y > ratMaxY) ratRef.current.y = ratMaxY;
        }

        // Animate rat sprite
        if (now - ratFrameTimeRef.current >= P3_RAT_FRAME_TIME) {
          ratFrameRef.current = (ratFrameRef.current + 1) % P3_RAT_FRAME_COUNT;
          ratFrameTimeRef.current = now;
        }

        // Check if weak point destroyed
        if (ratWeakPointHPRef.current <= 0) {
          ratRef.current = null;
          bossStateRef.current = BOSS_KNOCKED;
          bossStateTimerRef.current = now;
          knockedFrameRef.current = 0;
          triggerScreenShake(10, 700);
          console.log('🐀 Rat defeated! Boss vulnerable!');
        }
      }

      // Update Fire Zones
      fireZonesRef.current = fireZonesRef.current.filter(zone => {
        // Remove expired zones
        if (now > zone.endTime) return false;

        // Collision with player (cooldown-based to prevent instant death)
        if (!isInvulnerableRef.current && now - lastDamageTimeRef.current >= DAMAGE_COOLDOWN) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);
          if (knightHitbox.left < zone.x + zone.width &&
              knightHitbox.right > zone.x &&
              knightHitbox.top < zone.y + zone.height &&
              knightHitbox.bottom > zone.y) {
            lastDamageTimeRef.current = now;
            const newHP = Math.max(0, playerHealthRef.current - 5);
            playerHealthRef.current = newHP;
            setPlayerHealth(newHP);
            if (newHP <= 0) {
              gameOverRef.current = true;
              setGameOver(true);
            }
          }
        }

        return true;
      });

      // Phase 4: Update Lasers
      lasersRef.current = lasersRef.current.filter(laser => {
        if (now > laser.endTime) return false;

        // Only deal damage after telegraph phase, one-time hit per laser
        if (now > laser.fireTime && !isInvulnerableRef.current && !laser.hasHit) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);

          if (laser.type === 'horizontal') {
            const laserTop = laser.y - 10;
            const laserBottom = laser.y + 10;
            if (knightHitbox.top < laserBottom && knightHitbox.bottom > laserTop) {
              laser.hasHit = true;
              const newHP = Math.max(0, playerHealthRef.current - 20);
              playerHealthRef.current = newHP;
              setPlayerHealth(newHP);
              triggerScreenShake(6, 250);
              if (newHP <= 0) {
                gameOverRef.current = true;
                setGameOver(true);
              }
            }
          } else if (laser.type === 'vertical') {
            const laserLeft = laser.x - 10;
            const laserRight = laser.x + 10;
            if (knightHitbox.left < laserRight && knightHitbox.right > laserLeft) {
              laser.hasHit = true;
              const newHP = Math.max(0, playerHealthRef.current - 20);
              playerHealthRef.current = newHP;
              setPlayerHealth(newHP);
              triggerScreenShake(6, 250);
              if (newHP <= 0) {
                gameOverRef.current = true;
                setGameOver(true);
              }
            }
          }
        }

        return true;
      });

      // ===== ROCKET MOVEMENT & COLLISION =====
      const updatedRockets = [];
      for (const rocket of rocketsRef.current) {
        let { x, y, vx, vy, tracking, speed, countdown, countdownStart, shower, homing, zigzag, split, explosion } = rocket;

        // Tracking rockets home in on player
        if (tracking) {
          const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
          const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
          const dx = playerX - x;
          const dy = playerY - y;
          const distToPlayer = Math.sqrt(dx * dx + dy * dy);

          // Start 2-second countdown when close to player
          if (distToPlayer < ROCKET_PROXIMITY_TRIGGER && countdown === null) {
            countdown = ROCKET_COUNTDOWN_TIME;
            countdownStart = now;
          }

          // If countdown active, check if should explode
          if (countdown !== null) {
            const elapsed = now - countdownStart;
            if (elapsed >= countdown) {
              // EXPLODE!
              if (!isInvulnerableRef.current) {
                // Check if player is in explosion radius
                if (distToPlayer < 120) {
                  const newHP = Math.max(0, playerHealthRef.current - 15);
                  playerHealthRef.current = newHP;
                  setPlayerHealth(newHP);
                  triggerScreenShake(5, 300);
                  if (newHP <= 0) {
                    gameOverRef.current = true;
                    setGameOver(true);
                  }
                }
              }

              // If split rocket, create mini rockets
              if (split) {
                for (let i = 0; i < P4_SPLIT_MINI_COUNT; i++) {
                  const angle = (Math.PI * 2 / P4_SPLIT_MINI_COUNT) * i;
                  const miniSpeed = 4;
                  const rocketType = Math.floor(Math.random() * 6) + 1;
                  rocketsRef.current = [...rocketsRef.current, {
                    id: Date.now() + Math.random() + i,
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * miniSpeed,
                    vy: Math.sin(angle) * miniSpeed,
                    type: rocketType,
                    tracking: false,
                    speed: miniSpeed,
                    mini: true,
                  }];
                }
                console.log('💥 Split rocket exploded into 4 minis!');
              }

              continue; // Remove exploded rocket
            }
          }

          // Continue tracking while not exploded
          // Stronger homing when close, slow down near player
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;
          const homingStrength = distToPlayer < 200 ? 0.8 : 0.4;
          vx += (dx / mag) * homingStrength;
          vy += (dy / mag) * homingStrength;
          // Slow down when close to player so rockets don't overshoot
          const targetSpeed = distToPlayer < 150 ? speed * 0.5 : speed;
          const currentSpeed = Math.sqrt(vx * vx + vy * vy) || 1;
          vx = (vx / currentSpeed) * targetSpeed;
          vy = (vy / currentSpeed) * targetSpeed;
        }

        // Homing rockets (Phase 2) - slight curve
        if (homing && !countdown) {
          const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
          const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
          const dx = playerX - x;
          const dy = playerY - y;
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;

          // Weak homing
          vx += (dx / mag) * 0.15;
          vy += (dy / mag) * 0.15;

          // Maintain speed
          const currentSpeed = Math.sqrt(vx * vx + vy * vy) || 1;
          vx = (vx / currentSpeed) * speed;
          vy = (vy / currentSpeed) * speed;
        }

        // Zigzag pattern (Phase 4)
        if (zigzag) {
          vx = Math.sin((now + rocket.id) * 0.005) * 3;
        }

        // Explosion rockets (Phase 3 dive bombs) - static countdown
        if (explosion && countdown !== null) {
          const elapsed = now - countdownStart;
          if (elapsed >= countdown) {
            // EXPLODE!
            if (!isInvulnerableRef.current) {
              const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
              const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
              const dx = playerX - x;
              const dy = playerY - y;
              const distToPlayer = Math.sqrt(dx * dx + dy * dy);

              if (distToPlayer < 100) {
                const newHP = Math.max(0, playerHealthRef.current - 12);
                playerHealthRef.current = newHP;
                setPlayerHealth(newHP);
                triggerScreenShake(4, 250);
                if (newHP <= 0) {
                  gameOverRef.current = true;
                  setGameOver(true);
                }
              }
            }
            continue;
          }
        }

        x += vx;
        y += vy;

        // Remove off-screen
        const effectiveW = rocket.small ? RAIN_ROCKET_WIDTH : ROCKET_WIDTH;
        const effectiveH = rocket.small ? RAIN_ROCKET_HEIGHT : ROCKET_HEIGHT;
        if (shower) {
          if (y > canvasSize.height + effectiveH) {
            continue;
          }
        } else {
          if (x < -effectiveW || x > canvasSize.width + effectiveW ||
              y < -effectiveH || y > canvasSize.height + effectiveH) {
            continue;
          }
        }

        // Collision with player (reduced hitbox)
        if (!isInvulnerableRef.current && !countdown) {
          const rw = rocket.small ? RAIN_ROCKET_WIDTH : (rocket.cheese ? P3_CHEESE_WIDTH : ROCKET_WIDTH);
          const rh = rocket.small ? RAIN_ROCKET_HEIGHT : (rocket.cheese ? P3_CHEESE_HEIGHT : ROCKET_HEIGHT);
          const hitboxInsetX = rw * (1 - HITBOX_SCALE) / 2;
          const hitboxInsetY = rh * (1 - HITBOX_SCALE) / 2;
          const rLeft = x + hitboxInsetX;
          const rRight = x + rw - hitboxInsetX;
          const rTop = y + hitboxInsetY;
          const rBottom = y + rh - hitboxInsetY;

          const knightHitbox = getKnightHitbox(knightPosRef.current);
          let pLeft = knightHitbox.left;
          let pRight = knightHitbox.right;
          let pTop = knightHitbox.top;
          let pBottom = knightHitbox.bottom;

          // Extend hitbox in front of knight when parrying
          if (isParryingRef.current && (rocket.shower || rocket.parryable)) {
            const PARRY_EXTEND = 60;
            if (facingDirRef.current === 'right') {
              pRight += PARRY_EXTEND;
            } else {
              pLeft -= PARRY_EXTEND;
            }
            pTop -= 15;
            pBottom += 15;
          }

          if (rLeft < pRight && rRight > pLeft && rTop < pBottom && rBottom > pTop) {
            // PARRY CHECK - can parry shower coins (parry hitbox extends in front of knight)
            if ((rocket.shower || rocket.parryable) && isParryingRef.current) {
              // Verify coin is in front of knight (parry direction)
              const knightCenterX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
              const coinCenterX = x + rw / 2;
              const isFront = facingDirRef.current === 'right'
                ? coinCenterX >= knightCenterX - 20
                : coinCenterX <= knightCenterX + 20;
              if (!isFront) {
                // Coin is behind knight — no parry, take damage
                const newHP2 = Math.max(0, playerHealthRef.current - 10);
                playerHealthRef.current = newHP2;
                setPlayerHealth(newHP2);
                triggerScreenShake(3, 200);
                if (newHP2 <= 0) { gameOverRef.current = true; setGameOver(true); }
                continue;
              }
              // Parry successful! Collect the coin
              comboCountRef.current++;
              comboTimerRef.current = now + 2000;
              parryCountRef.current++;
              playerCoinsRef.current++;
              stylePointsRef.current += 25 + comboCountRef.current * 5;
              parryFlashRef.current = now + 200;
              styleTextRef.current.push({
                text: comboCountRef.current > 3 ? `PARRY +🪙 x${comboCountRef.current}!` : 'PARRY +🪙!',
                x: x, y: y - 20, time: now,
                color: comboCountRef.current > 5 ? '#ff44ff' : '#ffdd00',
              });
              triggerScreenShake(2, 100);

              // Return coin flies at boss
              const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
              const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;
              const rdx = bossX - x;
              const rdy = bossY - y;
              const rmag = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
              returnCoinsRef.current.push({
                id: now + Math.random(),
                x: x, y: y,
                vx: (rdx / rmag) * 10,
                vy: (rdy / rmag) * 10,
                size: rw,
                damage: 15,
              });
              continue; // Remove parried coin
            }

            const newHP = Math.max(0, playerHealthRef.current - 10);
            playerHealthRef.current = newHP;
            setPlayerHealth(newHP);
            triggerScreenShake(3, 200);
            if (newHP <= 0) {
              gameOverRef.current = true;
              setGameOver(true);
            }
            continue; // Remove rocket
          }
        }

        updatedRockets.push({ ...rocket, x, y, vx, vy, countdown, countdownStart });
      }
      rocketsRef.current = updatedRockets;

      // Phase 4: Update clones (follow real boss position)
      if (bossClonesRef.current.length > 0) {
        bossClonesRef.current.forEach((clone, idx) => {
          if (clone.isReal) {
            bossClonesRef.current[idx].x = bossPosRef.current.x;
            bossClonesRef.current[idx].y = bossPosRef.current.y;
          }
        });
      }

      // ===== PARRY WINDOW EXPIRY =====
      if (isParryingRef.current && now >= parryWindowEndRef.current) {
        isParryingRef.current = false;
      }

      // ===== COMBO TIMER =====
      if (comboCountRef.current > 0 && now > comboTimerRef.current) {
        if (comboCountRef.current > maxComboRef.current) {
          maxComboRef.current = comboCountRef.current;
        }
        comboCountRef.current = 0;
      }

      // ===== SLIP TIMER =====
      if (isSlippingRef.current && now >= slipEndTimeRef.current) {
        isSlippingRef.current = false;
      }

      // ===== SOAP PROJECTILES UPDATE =====
      soapProjectilesRef.current = soapProjectilesRef.current.filter(soap => {
        soap.x += soap.vx;
        soap.y += soap.vy;
        soap.rotation += 0.08;

        // Remove if off-screen
        if (soap.x < -soap.size || soap.x > canvasSize.width + soap.size ||
            soap.y < -soap.size || soap.y > canvasSize.height + soap.size) {
          return false;
        }

        // Collision with player
        if (!isInvulnerableRef.current && !isSlippingRef.current) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);
          const soapCx = soap.x + soap.size / 2;
          const soapCy = soap.y + soap.size / 2;
          const soapR = soap.size / 2;

          const closestX = Math.max(knightHitbox.left, Math.min(soapCx, knightHitbox.right));
          const closestY = Math.max(knightHitbox.top, Math.min(soapCy, knightHitbox.bottom));
          const distX = soapCx - closestX;
          const distY = soapCy - closestY;

          if (distX * distX + distY * distY < soapR * soapR) {
            // Knight slips!
            isSlippingRef.current = true;
            slipEndTimeRef.current = now + SLIP_DURATION;
            setKnightAnimation('__DeathNoMovement.gif?' + Date.now());
            triggerScreenShake(5, 300);
            styleTextRef.current.push({
              text: 'SLIPPED!', x: knightPosRef.current.x, y: knightPosRef.current.y - 30,
              time: now, color: '#44ccff',
            });
            // Small damage
            const newHP = Math.max(0, playerHealthRef.current - 5);
            playerHealthRef.current = newHP;
            setPlayerHealth(newHP);
            if (newHP <= 0) { gameOverRef.current = true; setGameOver(true); }
            return false; // Remove soap
          }
        }

        return true;
      });

      // ===== GIANT COIN UPDATE =====
      if (giantCoinRef.current) {
        const gc = giantCoinRef.current;
        gc.x += gc.vx;
        gc.y += gc.vy;
        gc.rotation += 0.03;

        // Remove if off-screen
        if (gc.x < -gc.size || gc.x > canvasSize.width + gc.size ||
            gc.y < -gc.size || gc.y > canvasSize.height + gc.size) {
          giantCoinRef.current = null;
        } else if (!isInvulnerableRef.current) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);
          const gcCx = gc.x + gc.size / 2;
          const gcCy = gc.y + gc.size / 2;
          const gcR = gc.size / 2;

          // Circle vs rect collision
          const closestX = Math.max(knightHitbox.left, Math.min(gcCx, knightHitbox.right));
          const closestY = Math.max(knightHitbox.top, Math.min(gcCy, knightHitbox.bottom));
          const distX = gcCx - closestX;
          const distY = gcCy - closestY;

          if (distX * distX + distY * distY < gcR * gcR) {
            if (isParryingRef.current) {
              // Parry the giant coin
              gc.parryHits++;
              comboCountRef.current++;
              comboTimerRef.current = now + 2000;
              stylePointsRef.current += 50;
              styleTextRef.current.push({ text: 'PARRY!', x: gc.x, y: gc.y - 20, time: now, color: '#ffff00' });
              triggerScreenShake(4, 200);

              if (gc.parryHits >= 3) {
                // Deflect back at boss!
                const bossX = bossPosRef.current.x + BOSS_WIDTH / 2;
                const bossY = bossPosRef.current.y + BOSS_HEIGHT / 2;
                const dx = bossX - gc.x;
                const dy = bossY - gc.y;
                const mag = Math.sqrt(dx * dx + dy * dy) || 1;
                returnCoinsRef.current.push({
                  id: Date.now(),
                  x: gc.x,
                  y: gc.y,
                  vx: (dx / mag) * 8,
                  vy: (dy / mag) * 8,
                  size: gc.size,
                  damage: 80,
                });
                giantCoinRef.current = null;
                styleTextRef.current.push({ text: 'DEFLECTED!', x: gc.x, y: gc.y - 50, time: now, color: '#44ff44' });
                stylePointsRef.current += 200;
              } else {
                // Bounce back slightly
                gc.vx *= -0.5;
                gc.vy *= -0.5;
              }
            } else {
              // Hit player
              const newHP = Math.max(0, playerHealthRef.current - 25);
              playerHealthRef.current = newHP;
              setPlayerHealth(newHP);
              triggerScreenShake(8, 400);
              giantCoinRef.current = null;
              if (newHP <= 0) { gameOverRef.current = true; setGameOver(true); }
            }
          }
        }
      }

      // ===== RETURN COINS (parried coins flying back) =====
      returnCoinsRef.current = returnCoinsRef.current.filter(coin => {
        coin.x += coin.vx;
        coin.y += coin.vy;

        // Hit boss
        const bossX = bossPosRef.current.x;
        const bossY = bossPosRef.current.y;
        if (coin.x > bossX && coin.x < bossX + BOSS_WIDTH &&
            coin.y > bossY && coin.y < bossY + BOSS_HEIGHT) {
          const newHP = Math.max(0, bossHealthRef.current - coin.damage);
          bossHealthRef.current = newHP;
          setBossHealth(newHP);
          triggerScreenShake(6, 300);
          styleTextRef.current.push({ text: `-${coin.damage} HP!`, x: coin.x, y: coin.y, time: now, color: '#ff4444' });
          return false;
        }

        // Off-screen
        if (coin.x < -200 || coin.x > canvasSize.width + 200 ||
            coin.y < -200 || coin.y > canvasSize.height + 200) return false;
        return true;
      });

      // ===== MINI RATS UPDATE =====
      miniRatsRef.current = miniRatsRef.current.filter(mr => {
        // Chase player
        const playerX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
        const playerY = knightPosRef.current.y + KNIGHT_HEIGHT / 2;
        const dx = playerX - mr.x;
        const dy = playerY - mr.y;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        mr.vx = (dx / mag) * 3;
        mr.vy = (dy / mag) * 3;
        mr.x += mr.vx;
        mr.y += mr.vy;

        // Animate
        if (now - mr.frameTime > 120) {
          mr.frame = (mr.frame + 1) % P3_RAT_FRAME_COUNT;
          mr.frameTime = now;
        }

        // Collision with player
        if (!isInvulnerableRef.current) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);
          if (mr.x > knightHitbox.left - mr.size / 2 && mr.x < knightHitbox.right + mr.size / 2 &&
              mr.y > knightHitbox.top - mr.size / 2 && mr.y < knightHitbox.bottom + mr.size / 2) {
            if (now - lastDamageTimeRef.current >= DAMAGE_COOLDOWN) {
              lastDamageTimeRef.current = now;
              const newHP = Math.max(0, playerHealthRef.current - 8);
              playerHealthRef.current = newHP;
              setPlayerHealth(newHP);
              triggerScreenShake(2, 100);
              if (newHP <= 0) { gameOverRef.current = true; setGameOver(true); }
            }
            return false; // Mini rat dies on contact
          }
        }

        // Off-screen removal
        if (mr.x < -100 || mr.x > canvasSize.width + 100 ||
            mr.y > canvasSize.height + 100) return false;

        return true;
      });

      // ===== CHEESE TRAPS UPDATE =====
      cheeseTrapsRef.current = cheeseTrapsRef.current.filter(trap => {
        if (now > trap.endTime) return false;
        if (!trap.armed && now > trap.armTime) trap.armed = true;

        if (trap.armed && !isInvulnerableRef.current) {
          const knightHitbox = getKnightHitbox(knightPosRef.current);
          if (knightHitbox.left < trap.x + trap.size && knightHitbox.right > trap.x &&
              knightHitbox.top < trap.y + trap.size && knightHitbox.bottom > trap.y) {
            // Explode!
            const newHP = Math.max(0, playerHealthRef.current - 15);
            playerHealthRef.current = newHP;
            setPlayerHealth(newHP);
            triggerScreenShake(5, 300);
            if (newHP <= 0) { gameOverRef.current = true; setGameOver(true); }
            return false;
          }
        }
        return true;
      });

      // ===== DRONE LASER UPDATE =====
      if (droneLaserRef.current) {
        const dl = droneLaserRef.current;
        if (now > dl.startTime + dl.duration) {
          droneLaserRef.current = null;
        } else {
          // Update position to follow drone
          if (droneRef.current) {
            dl.x = droneRef.current.x + P2_DRONE_WIDTH / 2;
            dl.y = droneRef.current.y + P2_DRONE_HEIGHT;
          }
          // Sweep angle
          dl.angle += dl.sweepSpeed;
          if (dl.angle > Math.PI * 0.3 || dl.angle < -Math.PI * 1.3) {
            dl.sweepSpeed *= -1;
          }

          // Damage if past telegraph
          if (now > dl.telegraphEnd && !isInvulnerableRef.current &&
              now - lastDamageTimeRef.current >= DAMAGE_COOLDOWN) {
            const laserLen = 600;
            const laserEndX = dl.x + Math.cos(dl.angle) * laserLen;
            const laserEndY = dl.y + Math.sin(dl.angle) * laserLen;
            const knightHitbox = getKnightHitbox(knightPosRef.current);
            const kCx = (knightHitbox.left + knightHitbox.right) / 2;
            const kCy = (knightHitbox.top + knightHitbox.bottom) / 2;

            // Point-to-line distance
            const A = kCx - dl.x;
            const B = kCy - dl.y;
            const C = laserEndX - dl.x;
            const D = laserEndY - dl.y;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const t = Math.max(0, Math.min(1, dot / lenSq));
            const closestX = dl.x + t * C;
            const closestY = dl.y + t * D;
            const dist = Math.sqrt((kCx - closestX) ** 2 + (kCy - closestY) ** 2);

            if (dist < 30) {
              lastDamageTimeRef.current = now;
              const newHP = Math.max(0, playerHealthRef.current - 12);
              playerHealthRef.current = newHP;
              setPlayerHealth(newHP);
              triggerScreenShake(4, 200);
              if (newHP <= 0) { gameOverRef.current = true; setGameOver(true); }
            }
          }
        }
      }

      // ===== RAT RAGE EXPIRY =====
      if (ratRef.current && ratRef.current.rage && now > ratRef.current.rageEnd) {
        ratRef.current.rage = false;
        ratRef.current.vx /= 2;
        ratRef.current.vy /= 2;
      }

      // ===== STYLE TEXT CLEANUP =====
      styleTextRef.current = styleTextRef.current.filter(st => now - st.time < 1500);

      // ===== SCREEN SHAKE =====
      if (now < shakeEndTimeRef.current) {
        const intensity = shakeIntensityRef.current;
        shakeOffsetRef.current = {
          x: (Math.random() - 0.5) * 2 * intensity,
          y: (Math.random() - 0.5) * 2 * intensity
        };
      } else {
        shakeOffsetRef.current = { x: 0, y: 0 };
      }

    }, 16); // 60fps

    return () => clearInterval(gameLoop);
  }, [canvasSize, gameOver, victory]);

  // Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const render = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Apply screen shake
      const shakeX = shakeOffsetRef.current.x;
      const shakeY = shakeOffsetRef.current.y;
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Disable smoothing for pixel art
      ctx.imageSmoothingEnabled = false;

      // ===== BACKGROUND - Dark Fantasy Atmosphere =====
      if (backgroundImgRef.current?.complete && backgroundImgRef.current.naturalWidth > 0) {
        ctx.drawImage(backgroundImgRef.current, 0, 0, canvasSize.width, canvasSize.height);
      } else {
        // Dark fantasy gradient - storm atmosphere
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
        gradient.addColorStop(0, '#0E0F12');      // Near Black (top)
        gradient.addColorStop(0.3, '#1A1C1F');    // Deep Charcoal
        gradient.addColorStop(0.6, '#3A3F46');    // Storm Gray
        gradient.addColorStop(1, '#4A5561');      // Blue-Gray (bottom)
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

        // Add atmospheric fog effect
        ctx.fillStyle = 'rgba(106, 112, 120, 0.15)'; // Ash Gray overlay
        ctx.fillRect(0, canvasSize.height * 0.4, canvasSize.width, canvasSize.height * 0.6);
      }

      // ===== FLOATING PLATFORM - Using float.png =====
      const platformY = canvasSize.height - PLATFORM_HEIGHT;

      const floatImg = floatPlatformImgRef.current;
      if (floatImg?.complete && floatImg.naturalWidth > 0) {
        // Tile the float image across the full width
        const floatAspect = floatImg.naturalWidth / floatImg.naturalHeight;
        const tileHeight = PLATFORM_HEIGHT + 30; // Slightly taller for depth
        const tileWidth = tileHeight * floatAspect;
        for (let fx = 0; fx < canvasSize.width; fx += tileWidth - 20) {
          ctx.drawImage(floatImg, fx, platformY - 15, tileWidth, tileHeight);
        }
      } else {
        // Fallback: simple dark platform
        ctx.fillStyle = '#4B4E52';
        ctx.fillRect(0, platformY, canvasSize.width, PLATFORM_HEIGHT);
        ctx.fillStyle = '#7A7F86';
        ctx.fillRect(0, platformY, canvasSize.width, 4);
      }

      // ===== ATMOSPHERIC EFFECTS =====
      const phase = currentPhaseRef.current;

      // Floating ash/ember particles (all phases)
      ctx.save();
      for (let p = 0; p < 15; p++) {
        const px = ((now * 0.02 + p * 137) % (canvasSize.width + 40)) - 20;
        const py = ((now * 0.01 * (0.5 + p * 0.1) + p * 89) % (canvasSize.height));
        const size = 1 + (p % 3);
        ctx.globalAlpha = 0.2 + Math.sin(now * 0.002 + p) * 0.15;
        ctx.fillStyle = phase >= 3 ? '#ff6633' : '#aabbcc'; // Embers in later phases
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Phase-specific atmospheric effects
      if (phase === 1) {
        // Subtle lightning flicker in background
        if (Math.random() < 0.003) {
          ctx.save();
          ctx.globalAlpha = 0.05;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height * 0.3);
          ctx.restore();
        }
      } else if (phase === 2) {
        // Wind streaks
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = '#88aacc';
        ctx.lineWidth = 1;
        for (let w = 0; w < 5; w++) {
          const wy = 100 + w * 80 + Math.sin(now * 0.001 + w) * 30;
          const wx = (now * 0.3 + w * 200) % (canvasSize.width + 200) - 100;
          ctx.beginPath();
          ctx.moveTo(wx, wy);
          ctx.lineTo(wx + 60 + w * 10, wy + 2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (phase === 3) {
        // Dust clouds near ground
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let dc = 0; dc < 4; dc++) {
          const dcx = (now * 0.05 + dc * 300) % (canvasSize.width + 200) - 100;
          const dcy = platformY - 30 - dc * 15;
          ctx.fillStyle = '#aa9966';
          ctx.beginPath();
          ctx.arc(dcx, dcy, 25 + dc * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (phase === 4) {
        // Red vignette effect
        const vigGrad = ctx.createRadialGradient(
          canvasSize.width / 2, canvasSize.height / 2,
          canvasSize.height * 0.3,
          canvasSize.width / 2, canvasSize.height / 2,
          canvasSize.height * 0.9
        );
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(80,0,0,0.25)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

        // Flickering dark energy at edges
        ctx.save();
        ctx.globalAlpha = 0.1 + Math.sin(now * 0.004) * 0.05;
        ctx.fillStyle = '#330000';
        ctx.fillRect(0, 0, 15, canvasSize.height);
        ctx.fillRect(canvasSize.width - 15, 0, 15, canvasSize.height);
        ctx.restore();
      }

      // ===== PHASE 3: RAT =====
      if (ratRef.current) {
        const rat = ratRef.current;
        const frame = ratFrameRef.current;

        // Choose sprite sheet based on rat movement
        const ratSpriteSheet = Math.abs(rat.vx) > 0 ? ratRunImgRef.current : ratIdleImgRef.current;

        // Rat PNG faces RIGHT by default
        // Flip when player is to the LEFT of the rat
        const playerCenterX = knightPosRef.current.x + KNIGHT_WIDTH / 2;
        const ratCenterX = rat.x + P3_RAT_WIDTH / 2;
        const ratFacingLeft = playerCenterX < ratCenterX;

        if (ratSpriteSheet?.complete && ratSpriteSheet.naturalWidth > 0) {
          ctx.save();
          if (ratFacingLeft) {
            // Flip horizontally to face left (toward player)
            ctx.translate(rat.x + P3_RAT_WIDTH, rat.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
              ratSpriteSheet,
              frame * P3_RAT_FRAME_WIDTH, 0, P3_RAT_FRAME_WIDTH, P3_RAT_FRAME_HEIGHT,
              0, 0, P3_RAT_WIDTH, P3_RAT_HEIGHT
            );
          } else {
            // Default: facing right (toward player)
            ctx.drawImage(
              ratSpriteSheet,
              frame * P3_RAT_FRAME_WIDTH, 0, P3_RAT_FRAME_WIDTH, P3_RAT_FRAME_HEIGHT,
              rat.x, rat.y, P3_RAT_WIDTH, P3_RAT_HEIGHT
            );
          }
          ctx.restore();
        } else {
          // Fallback
          ctx.fillStyle = '#666';
          ctx.fillRect(rat.x, rat.y, P3_RAT_WIDTH, P3_RAT_HEIGHT);
        }

        // Rat HP bar
        ctx.fillStyle = '#000';
        ctx.fillRect(rat.x, rat.y - 20, P3_RAT_WIDTH, 10);
        ctx.fillStyle = '#ff4444';
        const ratHPPercent = ratWeakPointHPRef.current / P3_RAT_WEAK_POINT_HP;
        ctx.fillRect(rat.x, rat.y - 20, P3_RAT_WIDTH * ratHPPercent, 10);

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('RAT', rat.x + P3_RAT_WIDTH / 2, rat.y - 30);
      }

      // ===== PHASE 2: DRONE =====
      if (droneRef.current) {
        const drone = droneRef.current;

        // Draw drone using drone.png
        const droneImg = droneImgRef.current;
        if (droneImg?.complete && droneImg.naturalWidth > 0) {
          ctx.drawImage(droneImg, drone.x, drone.y, P2_DRONE_WIDTH, P2_DRONE_HEIGHT);
        } else {
          ctx.fillStyle = '#666';
          ctx.fillRect(drone.x, drone.y, P2_DRONE_WIDTH, P2_DRONE_HEIGHT);
        }

        // Drone HP bar
        ctx.fillStyle = '#000';
        ctx.fillRect(drone.x, drone.y - 15, P2_DRONE_WIDTH, 8);
        ctx.fillStyle = '#44ff44';
        const droneHPPercent = droneHealthRef.current / P2_DRONE_HP;
        ctx.fillRect(drone.x, drone.y - 15, P2_DRONE_WIDTH * droneHPPercent, 8);

        // Target indicator
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.fillText('TARGET', drone.x + P2_DRONE_WIDTH / 2, drone.y - 20);
      }

      // ===== DRONE BULLETS =====
      droneBulletsRef.current.forEach(bullet => {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // ===== FIRE ZONES =====
      fireZonesRef.current.forEach(zone => {
        if (zone.type === 'flame') {
          // Animated flames
          for (let i = 0; i < zone.width; i += 20) {
            const flameHeight = 30 + Math.sin(now * 0.005 + i * 0.1) * 10;
            ctx.fillStyle = `rgba(255, ${100 + Math.sin(now * 0.01 + i) * 50}, 0, 0.8)`;
            ctx.beginPath();
            ctx.moveTo(zone.x + i, zone.y + zone.height);
            ctx.lineTo(zone.x + i + 10, zone.y + zone.height - flameHeight);
            ctx.lineTo(zone.x + i + 20, zone.y + zone.height);
            ctx.fill();
          }
        } else {
          // Ground fire zones
          ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

          // Flame particles
          for (let i = 0; i < 10; i++) {
            const x = zone.x + Math.random() * zone.width;
            const y = zone.y + Math.random() * zone.height;
            ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // ===== PHASE 4: LASERS =====
      lasersRef.current.forEach(laser => {
        const isTelegraph = now < laser.fireTime;

        if (laser.type === 'horizontal') {
          if (isTelegraph) {
            // Telegraph (dashed red line)
            ctx.save();
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(0, laser.y);
            ctx.lineTo(canvasSize.width, laser.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          } else {
            // Active laser beam
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, laser.y - 10, canvasSize.width, 20);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(0, laser.y - 5, canvasSize.width, 10);
          }
        } else if (laser.type === 'vertical') {
          if (isTelegraph) {
            // Telegraph
            ctx.save();
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(laser.x, 0);
            ctx.lineTo(laser.x, canvasSize.height);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          } else {
            // Active laser beam
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(laser.x - 10, 0, 20, canvasSize.height);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(laser.x - 5, 0, 10, canvasSize.height);
          }
        }
      });

      // ===== PHASE 4: CLONES =====
      if (bossClonesRef.current.length > 0) {
        bossClonesRef.current.forEach((clone) => {
          ctx.save();

          if (!clone.isReal) {
            // Fake clone - semi-transparent
            ctx.globalAlpha = 0.5;
          }

          // Draw clone
          if (bossImgRef.current?.complete && bossImgRef.current.naturalWidth > 0) {
            ctx.drawImage(bossImgRef.current, clone.x, clone.y, BOSS_WIDTH, BOSS_HEIGHT);
          } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(clone.x, clone.y, BOSS_WIDTH, BOSS_HEIGHT);
          }

          // Real boss glow
          if (clone.isReal) {
            ctx.strokeStyle = '#ffff44';
            ctx.lineWidth = 5;
            ctx.strokeRect(clone.x, clone.y, BOSS_WIDTH, BOSS_HEIGHT);
          }

          ctx.restore();
        });
      } else {
        // ===== BOSS (Normal rendering when no clones) =====
        const bossX = bossPosRef.current.x;
        const bossY = bossPosRef.current.y;
        const bossState = bossStateRef.current;

        if (bossState === BOSS_KNOCKED || bossState === BOSS_RECOVERING) {
          // Draw knocked sprite sheet frame
          const knockedImg = bossExhaustImgRef.current;
          if (knockedImg?.complete && knockedImg.naturalWidth > 0) {
            const frame = knockedFrameRef.current;
            ctx.drawImage(
              knockedImg,
              frame * KNOCKED_FRAME_WIDTH, 0, KNOCKED_FRAME_WIDTH, KNOCKED_FRAME_HEIGHT,
              bossX, bossY, BOSS_WIDTH, BOSS_HEIGHT
            );
          } else {
            ctx.fillStyle = '#884444';
            ctx.fillRect(bossX, bossY, BOSS_WIDTH, BOSS_HEIGHT);
          }
        } else if (bossState !== BOSS_DEAD) {
          // Flying boss
          if (bossImgRef.current?.complete && bossImgRef.current.naturalWidth > 0) {
            ctx.drawImage(bossImgRef.current, bossX, bossY, BOSS_WIDTH, BOSS_HEIGHT);
          } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(bossX, bossY, BOSS_WIDTH, BOSS_HEIGHT);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('YAIR', bossX + BOSS_WIDTH / 2, bossY + BOSS_HEIGHT / 2);
          }

          // Immunity indicator while flying
          if (bossState === BOSS_FLYING && currentPhaseRef.current !== 4) {
            ctx.font = 'bold 14px monospace';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText('[ IMMUNE ]', bossX + BOSS_WIDTH / 2, bossY - 10);
            ctx.fillStyle = '#ffff44';
            ctx.fillText('[ IMMUNE ]', bossX + BOSS_WIDTH / 2, bossY - 10);
          }
        }
      }

      // ===== ROCKETS =====
      const rockets = rocketsRef.current;
      for (const rocket of rockets) {
        const rw = rocket.small ? RAIN_ROCKET_WIDTH : (rocket.cheese ? P3_CHEESE_WIDTH : ROCKET_WIDTH);
        const rh = rocket.small ? RAIN_ROCKET_HEIGHT : (rocket.cheese ? P3_CHEESE_HEIGHT : ROCKET_HEIGHT);

        // Countdown warning circle for tracking rockets
        if (rocket.tracking && rocket.countdown !== null) {
          const timeLeft = rocket.countdown - (now - rocket.countdownStart);
          const radius = 60 + (40 * (1 - timeLeft / ROCKET_COUNTDOWN_TIME));

          ctx.save();
          ctx.globalAlpha = 0.4 + 0.3 * Math.sin(now * 0.02);
          ctx.strokeStyle = timeLeft < 500 ? '#ff2222' : '#ffaa00';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(rocket.x + rw / 2, rocket.y + rh / 2, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Countdown text
          ctx.font = 'bold 18px monospace';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeText(`${Math.ceil(timeLeft / 1000)}`, rocket.x + rw / 2, rocket.y - 15);
          ctx.fillStyle = '#ff2222';
          ctx.fillText(`${Math.ceil(timeLeft / 1000)}`, rocket.x + rw / 2, rocket.y - 15);
        }

        // Draw projectile based on type
        if (rocket.shower) {
          // Gold coin shower
          const coinImg = coinImgRef.current;
          if (coinImg?.complete && coinImg.naturalWidth > 0) {
            ctx.drawImage(coinImg, rocket.x, rocket.y, rw, rh);
          } else {
            ctx.fillStyle = '#ffdd00';
            ctx.beginPath();
            ctx.arc(rocket.x + rw / 2, rocket.y + rh / 2, rw / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          // Sparkle trail behind coin
          ctx.save();
          ctx.globalAlpha = 0.3;
          for (let s = 1; s <= 2; s++) {
            const sparkleY = rocket.y - s * 12;
            const sparkleSize = 2 + Math.random() * 2;
            ctx.fillStyle = '#ffee88';
            ctx.beginPath();
            ctx.arc(rocket.x + rw / 2 + (Math.random() - 0.5) * 8, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (rocket.cheese) {
          // Cheese projectile
          const cheeseImg = cheeseImgRef.current;
          if (cheeseImg?.complete && cheeseImg.naturalWidth > 0) {
            const angle = Math.atan2(rocket.vy, rocket.vx);
            ctx.save();
            ctx.translate(rocket.x + rw / 2, rocket.y + rh / 2);
            ctx.rotate(angle);
            ctx.drawImage(cheeseImg, -rw / 2, -rh / 2, rw, rh);
            ctx.restore();
          } else {
            ctx.fillStyle = '#ffdd44';
            ctx.fillRect(rocket.x, rocket.y, rw, rh);
          }
        } else {
          // Boss tracking rocket sprite
          const rocketImg = rocketImgsRef.current[rocket.type - 1];
          if (rocketImg?.complete && rocketImg.naturalWidth > 0) {
            // Rockets face UP by default, add PI/2 to correct rotation
            const angle = Math.atan2(rocket.vy, rocket.vx) + Math.PI / 2;
            ctx.save();
            ctx.translate(rocket.x + rw / 2, rocket.y + rh / 2);
            ctx.rotate(angle);
            ctx.drawImage(rocketImg, -rw / 2, -rh / 2, rw, rh);
            ctx.restore();
            // Rocket exhaust trail
            ctx.save();
            ctx.globalAlpha = 0.4;
            const exAngle = Math.atan2(rocket.vy, rocket.vx);
            for (let t = 1; t <= 3; t++) {
              const trailX = rocket.x + rw / 2 - Math.cos(exAngle) * t * 10;
              const trailY = rocket.y + rh / 2 - Math.sin(exAngle) * t * 10;
              const trailSize = 4 + t * 2;
              ctx.fillStyle = t === 1 ? '#ff6600' : (t === 2 ? '#ff4400' : '#882200');
              ctx.beginPath();
              ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          } else {
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(rocket.x, rocket.y, rw, rh);
          }
        }
      }

      // ===== GIANT COIN =====
      if (giantCoinRef.current) {
        const gc = giantCoinRef.current;
        ctx.save();
        ctx.translate(gc.x + gc.size / 2, gc.y + gc.size / 2);
        ctx.rotate(gc.rotation);
        const coinImg = coinImgRef.current;
        if (coinImg?.complete && coinImg.naturalWidth > 0) {
          ctx.drawImage(coinImg, -gc.size / 2, -gc.size / 2, gc.size, gc.size);
        } else {
          ctx.fillStyle = '#ffdd00';
          ctx.beginPath();
          ctx.arc(0, 0, gc.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Glow effect
        ctx.globalAlpha = 0.3 + Math.sin(now * 0.01) * 0.2;
        ctx.strokeStyle = '#ffff44';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, gc.size / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // Parry counter
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffff00';
        ctx.fillText(`${gc.parryHits}/3`, gc.x + gc.size / 2, gc.y - 10);
      }

      // ===== RETURN COINS (parried coins flying back at boss) =====
      returnCoinsRef.current.forEach(coin => {
        ctx.save();
        ctx.globalAlpha = 0.9;
        const coinImg = coinImgRef.current;
        if (coinImg?.complete && coinImg.naturalWidth > 0) {
          ctx.drawImage(coinImg, coin.x - coin.size / 2, coin.y - coin.size / 2, coin.size, coin.size);
        } else {
          ctx.fillStyle = '#44ff44';
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Green trail
        ctx.strokeStyle = '#44ff44';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.size / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // ===== SOAP PROJECTILES =====
      soapProjectilesRef.current.forEach(soap => {
        ctx.save();
        ctx.translate(soap.x + soap.size / 2, soap.y + soap.size / 2);
        ctx.rotate(soap.rotation);
        const soapImg = soapImgRef.current;
        if (soapImg?.complete && soapImg.naturalWidth > 0) {
          ctx.drawImage(soapImg, -soap.size / 2, -soap.size / 2, soap.size, soap.size);
        } else {
          ctx.fillStyle = '#88ddff';
          ctx.beginPath();
          ctx.arc(0, 0, soap.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Bubble trail
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#aaeeff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, soap.size / 2 + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // ===== MINI RATS =====
      miniRatsRef.current.forEach(mr => {
        const ratSpriteSheet = ratRunImgRef.current;
        if (ratSpriteSheet?.complete && ratSpriteSheet.naturalWidth > 0) {
          ctx.save();
          if (mr.vx < 0) {
            ctx.translate(mr.x + mr.size, mr.y);
            ctx.scale(-1, 1);
            ctx.drawImage(ratSpriteSheet,
              mr.frame * P3_RAT_FRAME_WIDTH, 0, P3_RAT_FRAME_WIDTH, P3_RAT_FRAME_HEIGHT,
              0, 0, mr.size, mr.size);
          } else {
            ctx.drawImage(ratSpriteSheet,
              mr.frame * P3_RAT_FRAME_WIDTH, 0, P3_RAT_FRAME_WIDTH, P3_RAT_FRAME_HEIGHT,
              mr.x, mr.y, mr.size, mr.size);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = '#886644';
          ctx.fillRect(mr.x, mr.y, mr.size, mr.size);
        }
      });

      // ===== CHEESE TRAPS =====
      cheeseTrapsRef.current.forEach(trap => {
        const cheeseImg = cheeseImgRef.current;
        ctx.save();
        if (!trap.armed) {
          // Unarmed - fading in, blinking
          ctx.globalAlpha = 0.3 + Math.sin(now * 0.01) * 0.2;
        } else {
          // Armed - pulsing red glow
          ctx.globalAlpha = 1;
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 8 + Math.sin(now * 0.008) * 4;
        }
        if (cheeseImg?.complete && cheeseImg.naturalWidth > 0) {
          ctx.drawImage(cheeseImg, trap.x, trap.y, trap.size, trap.size);
        } else {
          ctx.fillStyle = trap.armed ? '#ff4444' : '#ffdd44';
          ctx.fillRect(trap.x, trap.y, trap.size, trap.size);
        }
        if (trap.armed) {
          // Warning symbol
          ctx.font = 'bold 14px monospace';
          ctx.fillStyle = '#ff0000';
          ctx.textAlign = 'center';
          ctx.fillText('!', trap.x + trap.size / 2, trap.y - 5);
        }
        ctx.restore();
      });

      // ===== DRONE SHIELD =====
      if (droneShieldActiveRef.current && droneRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(now * 0.005) * 0.15;
        ctx.strokeStyle = '#44aaff';
        ctx.lineWidth = 4;
        const shieldCx = bossPosRef.current.x + BOSS_WIDTH / 2;
        const shieldCy = bossPosRef.current.y + BOSS_HEIGHT / 2;
        const shieldR = BOSS_WIDTH * 0.4;
        ctx.beginPath();
        ctx.arc(shieldCx, shieldCy, shieldR, 0, Math.PI * 2);
        ctx.stroke();
        // Inner glow
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#4488ff';
        ctx.fill();
        ctx.restore();
      }

      // ===== DRONE LASER =====
      if (droneLaserRef.current) {
        const dl = droneLaserRef.current;
        const isTelegraphDL = now < dl.telegraphEnd;
        const laserLen = 600;
        const endX = dl.x + Math.cos(dl.angle) * laserLen;
        const endY = dl.y + Math.sin(dl.angle) * laserLen;

        ctx.save();
        if (isTelegraphDL) {
          ctx.strokeStyle = '#ff4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.globalAlpha = 0.5 + Math.sin(now * 0.02) * 0.3;
        } else {
          ctx.strokeStyle = '#ff2222';
          ctx.lineWidth = 8;
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 15;
        }
        ctx.beginPath();
        ctx.moveTo(dl.x, dl.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        if (!isTelegraphDL) {
          // Inner bright beam
          ctx.strokeStyle = '#ffaa44';
          ctx.lineWidth = 3;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(dl.x, dl.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      // ===== RAT RAGE EFFECT =====
      if (ratRef.current && ratRef.current.rage) {
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(now * 0.015) * 0.1;
        ctx.strokeStyle = '#ff2200';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ratRef.current.x + P3_RAT_WIDTH / 2, ratRef.current.y + P3_RAT_HEIGHT / 2,
          P3_RAT_WIDTH * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // RAGE text
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#ff2200';
        ctx.textAlign = 'center';
        ctx.fillText('RAGE!', ratRef.current.x + P3_RAT_WIDTH / 2, ratRef.current.y - 40);
      }

      // ===== PARRY FLASH on knight =====
      if (now < parryFlashRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 5;
        const hb = getKnightHitbox(knightPosRef.current);
        const flashCx = (hb.left + hb.right) / 2;
        const flashCy = (hb.top + hb.bottom) / 2 + 150;
        ctx.beginPath();
        ctx.arc(flashCx, flashCy, 55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ===== PARRY READY INDICATOR =====
      if (isParryingRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(now * 0.03) * 0.2;
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3;
        const hb2 = getKnightHitbox(knightPosRef.current);
        const kx = (hb2.left + hb2.right) / 2;
        const ky = (hb2.top + hb2.bottom) / 2 + 150;
        // Shield arc in front of player
        const dir = facingDirRef.current === 'right' ? 0 : Math.PI;
        ctx.beginPath();
        ctx.arc(kx, ky, 45, dir - Math.PI / 3, dir + Math.PI / 3);
        ctx.stroke();
        ctx.restore();
      }

      // ===== STYLE TEXT POPUPS =====
      styleTextRef.current.forEach(st => {
        const age = now - st.time;
        const alpha = Math.max(0, 1 - age / 1500);
        const yOff = age * 0.05;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(st.text, st.x, st.y - yOff);
        ctx.fillStyle = st.color || '#ffff00';
        ctx.fillText(st.text, st.x, st.y - yOff);
        ctx.restore();
      });

      // ===== COMBO COUNTER (top right) =====
      if (comboCountRef.current > 1) {
        ctx.save();
        ctx.font = `bold ${20 + comboCountRef.current * 2}px monospace`;
        ctx.textAlign = 'right';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        const comboText = `${comboCountRef.current}x COMBO`;
        const comboY = 120;
        ctx.strokeText(comboText, canvasSize.width - 20, comboY);
        ctx.fillStyle = comboCountRef.current > 5 ? '#ff44ff' :
          comboCountRef.current > 3 ? '#ffaa00' : '#ffff00';
        ctx.fillText(comboText, canvasSize.width - 20, comboY);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Style: ${stylePointsRef.current}`, canvasSize.width - 20, comboY + 20);
        ctx.restore();
      }

      // ===== UI - PLAYER HEALTH BAR =====
      const phBarW = 300, phBarH = 24, phBarX = 20, phBarY = 18;
      const playerHealthPercent = playerHealthRef.current / 100;
      const phFill = phBarW * playerHealthPercent;

      // Ornate frame
      ctx.save();
      // Dark backing
      ctx.fillStyle = '#0a0a0e';
      ctx.beginPath();
      ctx.roundRect(phBarX - 4, phBarY - 4, phBarW + 8, phBarH + 8, 6);
      ctx.fill();
      // Inner bg
      ctx.fillStyle = '#1a1215';
      ctx.beginPath();
      ctx.roundRect(phBarX, phBarY, phBarW, phBarH, 4);
      ctx.fill();

      // Health fill
      if (phFill > 0) {
        const phGrad = ctx.createLinearGradient(phBarX, phBarY, phBarX + phFill, phBarY + phBarH);
        if (playerHealthPercent > 0.5) {
          phGrad.addColorStop(0, '#22dd55');
          phGrad.addColorStop(0.5, '#44ff77');
          phGrad.addColorStop(1, '#22cc44');
        } else if (playerHealthPercent > 0.25) {
          phGrad.addColorStop(0, '#ddaa00');
          phGrad.addColorStop(0.5, '#ffcc22');
          phGrad.addColorStop(1, '#cc8800');
        } else {
          phGrad.addColorStop(0, '#cc2222');
          phGrad.addColorStop(0.5, '#ff4444');
          phGrad.addColorStop(1, '#aa1111');
        }
        ctx.fillStyle = phGrad;
        ctx.beginPath();
        ctx.roundRect(phBarX, phBarY, phFill, phBarH, 4);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.roundRect(phBarX, phBarY, phFill, phBarH / 3, 4);
        ctx.fill();
        // Pulse glow when low
        if (playerHealthPercent < 0.3) {
          const pulse = 0.3 + Math.sin(now * 0.006) * 0.2;
          ctx.globalAlpha = pulse;
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.roundRect(phBarX, phBarY, phFill, phBarH, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Border glow
      ctx.strokeStyle = playerHealthPercent > 0.5 ? '#44aa66' : (playerHealthPercent > 0.25 ? '#aa8822' : '#aa3333');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(phBarX, phBarY, phBarW, phBarH, 4);
      ctx.stroke();

      // HP text
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 3;
      ctx.fillText(`${playerHealthRef.current} / 100`, phBarX + 8, phBarY + phBarH / 2 + 5);
      ctx.shadowBlur = 0;

      // Coin counter
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 3;
      ctx.fillText(`🪙 ${playerCoinsRef.current}`, phBarX + phBarW + 20, phBarY + phBarH / 2 + 5);
      ctx.shadowBlur = 0;

      // Heal indicator
      if (isOnGroundRef.current && playerHealthRef.current < 100) {
        const healProgress = Math.min(1, (now - lastHealTimeRef.current) / HEAL_COOLDOWN);
        ctx.fillStyle = '#1a331a';
        ctx.beginPath();
        ctx.roundRect(phBarX, phBarY + phBarH + 6, phBarW * 0.3, 5, 2);
        ctx.fill();
        ctx.fillStyle = '#44ff88';
        ctx.beginPath();
        ctx.roundRect(phBarX, phBarY + phBarH + 6, phBarW * 0.3 * healProgress, 5, 2);
        ctx.fill();
        ctx.font = '9px monospace';
        ctx.fillStyle = '#44ff88';
        ctx.fillText('HEAL', phBarX + phBarW * 0.3 + 6, phBarY + phBarH + 12);
      }

      // Dash indicator
      const dashReady = now >= dashCooldownEndRef.current && !isDashingRef.current;
      const dashBarW = 60;
      ctx.fillStyle = dashReady ? '#0a2a2a' : '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(phBarX + phBarW + 12, phBarY + 2, dashBarW, 20, 4);
      ctx.fill();
      if (dashReady) {
        ctx.fillStyle = '#22dddd';
        ctx.beginPath();
        ctx.roundRect(phBarX + phBarW + 12, phBarY + 2, dashBarW, 20, 4);
        ctx.fill();
      } else {
        const dashCoolLeft = Math.max(0, (dashCooldownEndRef.current - now) / DASH_COOLDOWN);
        ctx.fillStyle = '#335555';
        ctx.beginPath();
        ctx.roundRect(phBarX + phBarW + 12, phBarY + 2, dashBarW * (1 - dashCoolLeft), 20, 4);
        ctx.fill();
      }
      ctx.strokeStyle = dashReady ? '#44ffff' : '#555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(phBarX + phBarW + 12, phBarY + 2, dashBarW, 20, 4);
      ctx.stroke();
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = dashReady ? '#fff' : '#888';
      ctx.fillText('DASH', phBarX + phBarW + 12 + dashBarW / 2, phBarY + 16);
      ctx.restore();

      // ===== UI - BOSS HEALTH BAR (Bottom of screen, cinematic style) =====
      const bossHealthBarWidth = Math.min(700, canvasSize.width - 100);
      const bossHealthBarHeight = 28;
      const bossHealthBarX = (canvasSize.width - bossHealthBarWidth) / 2;
      const bossHealthBarY = 70;

      const bossHealthPercent = bossHealthRef.current / BOSS_MAX_HEALTH;
      const bossFillWidth = bossHealthBarWidth * bossHealthPercent;

      ctx.save();
      // Dark backing with subtle glow
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = bossHealthPercent < 0.3 ? 12 + Math.sin(now * 0.005) * 6 : 4;
      ctx.fillStyle = '#0a0a0e';
      ctx.beginPath();
      ctx.roundRect(bossHealthBarX - 4, bossHealthBarY - 4, bossHealthBarWidth + 8, bossHealthBarHeight + 8, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner bg
      ctx.fillStyle = '#1a0808';
      ctx.beginPath();
      ctx.roundRect(bossHealthBarX, bossHealthBarY, bossHealthBarWidth, bossHealthBarHeight, 4);
      ctx.fill();

      // RED health fill
      if (bossFillWidth > 0) {
        const bossGrad = ctx.createLinearGradient(bossHealthBarX, bossHealthBarY, bossHealthBarX + bossFillWidth, bossHealthBarY);
        bossGrad.addColorStop(0, '#880000');
        bossGrad.addColorStop(0.3, '#cc1111');
        bossGrad.addColorStop(0.6, '#ff2222');
        bossGrad.addColorStop(1, '#aa0000');
        ctx.fillStyle = bossGrad;
        ctx.beginPath();
        ctx.roundRect(bossHealthBarX, bossHealthBarY, bossFillWidth, bossHealthBarHeight, 4);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255,120,120,0.2)';
        ctx.beginPath();
        ctx.roundRect(bossHealthBarX, bossHealthBarY, bossFillWidth, bossHealthBarHeight / 3, 4);
        ctx.fill();

        // Animated blood drip effect on the fill edge
        if (bossHealthPercent < 0.8) {
          const edgeX = bossHealthBarX + bossFillWidth;
          for (let d = 0; d < 3; d++) {
            const dripH = 3 + Math.sin(now * 0.004 + d) * 3;
            ctx.fillStyle = 'rgba(200,0,0,0.5)';
            ctx.fillRect(edgeX - 2 - d * 8, bossHealthBarY + bossHealthBarHeight - 1, 3, dripH);
          }
        }
      }

      // Phase marker notches on the bar
      const phaseMarkers = [0.75, 0.5, 0.25]; // Phase 2, 3, 4 thresholds
      phaseMarkers.forEach((mark, i) => {
        const markX = bossHealthBarX + bossHealthBarWidth * mark;
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(markX - 1, bossHealthBarY - 2, 2, bossHealthBarHeight + 4);
        ctx.globalAlpha = 1;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.fillText(`P${i + 2}`, markX, bossHealthBarY - 5);
      });

      // Border
      ctx.strokeStyle = '#661111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bossHealthBarX, bossHealthBarY, bossHealthBarWidth, bossHealthBarHeight, 4);
      ctx.stroke();

      // Boss name above bar
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#cc4444';
      ctx.fillText('YAIR, LORD OF ASH', bossHealthBarX + bossHealthBarWidth / 2, bossHealthBarY - 16);

      // HP numbers on right
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff6666';
      ctx.fillText(`${bossHealthRef.current} / ${BOSS_MAX_HEALTH}`, bossHealthBarX + bossHealthBarWidth, bossHealthBarY - 3);
      ctx.restore();

      // Phase & Boss state indicator (top center, minimal)
      const currentPhase = currentPhaseRef.current;
      const bossState = bossStateRef.current;
      const phaseNames = ['Rocket Shower', 'Aerial Pressure', 'Rat Chaos', 'Bullet Hell'];
      const phaseColors = ['#ffff44', '#ffaa33', '#ff7722', '#ff2222'];

      ctx.save();
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillStyle = phaseColors[currentPhase - 1];
      ctx.fillText(`PHASE ${currentPhase} - ${phaseNames[currentPhase - 1]}`, canvasSize.width / 2, canvasSize.height - PLATFORM_HEIGHT - 90);
      ctx.shadowBlur = 0;

      // Boss state
      if (bossState === BOSS_KNOCKED) {
        const flash = Math.sin(now * 0.01) > 0;
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = flash ? '#44ff44' : '#22aa22';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = flash ? 15 : 5;
        ctx.fillText('ATTACK NOW!', canvasSize.width / 2, canvasSize.height / 2 - 50);
        ctx.shadowBlur = 0;
      } else if (bossState === BOSS_RECOVERING) {
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#ffff44';
        ctx.fillText('BOSS RECOVERING...', canvasSize.width / 2, canvasSize.height / 2 - 50);
      }
      ctx.restore();

      // ===== DAMAGE FLASH =====
      if (now < damageFlashRef.current) {
        const flashAlpha = Math.min(0.3, (damageFlashRef.current - now) / 300);
        ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      }

      // ===== INVULNERABILITY SHIMMER on knight =====
      if (isInvulnerableRef.current) {
        const kx = knightPosRef.current.x;
        const ky = knightPosRef.current.y;
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(now * 0.02) * 0.15;
        ctx.strokeStyle = '#44ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(kx + KNIGHT_WIDTH / 2, ky + KNIGHT_HEIGHT / 2, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore(); // End screen shake

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [canvasSize, gameOver, victory]);

  return (
    <div className="eldenring-container">

      <GateMusic key={currentMusic} src={currentMusic} />

      {/* Title */}
      <div className="game-header">
        <h1 className="game-title glitch" data-text="THE TARNISHED VS. YAIR, LORD OF ASH">
          THE TARNISHED VS. YAIR, LORD OF ASH
        </h1>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={canvasSize.width}
        height={canvasSize.height}
      ></canvas>

      {/* Knight Character */}
      <img
        src={getKnightAnimation(knightAnimation)}
        alt="Knight"
        className={`knight-sprite ${facingDirection === 'left' ? 'flip-h' : ''} ${isDashingRef.current ? 'dashing' : ''}`}
        style={{
          position: 'absolute',
          left: `${knightPosition.x}px`,
          top: `${knightPosition.y + 150}px`,
          width: `${KNIGHT_WIDTH}px`,
          height: `${KNIGHT_HEIGHT}px`,
          pointerEvents: 'none',
          imageRendering: 'pixelated',
          zIndex: 20,
        }}
      />

      {/* Controls Hint */}
      <div className="controls-hint">
        <span>A/D - Move | Space - Jump (2x) | SHIFT - Dash | F - Parry</span>
        <span>Left Click - Attack | F - Parry coins back at boss!</span>
        <span style={{ fontSize: '0.85em', color: '#ffff44' }}>P1: Dodge rain gaps!</span>
        <span style={{ fontSize: '0.85em', color: '#ffaa33' }}>P2: Destroy drone!</span>
        <span style={{ fontSize: '0.85em', color: '#ff7722' }}>P3: Defeat the rat!</span>
        <span style={{ fontSize: '0.85em', color: '#ff2222' }}>P4: Find real boss!</span>
        <span style={{ fontSize: '0.8em', color: '#44ff44' }}>4 Phases Total</span>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h1 className="game-over-title">GAME OVER</h1>
            <p className="game-over-subtitle">The Tarnished has fallen...</p>
            <button
              className="restart-btn"
              onClick={() => window.location.reload()}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {victory && (
        <div className="game-over-overlay victory-overlay">
          <div className="game-over-content">
            <h1 className="victory-title">VICTORY ACHIEVED</h1>
            <p className="victory-subtitle">Yair, Lord of Ash has been defeated!</p>
            <p className="victory-stats">The flying menace has fallen!</p>
            <button
              className="restart-btn victory-btn"
              onClick={() => window.location.reload()}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EldenRingGate;
