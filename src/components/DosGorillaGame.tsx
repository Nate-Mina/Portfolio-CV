import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  Zap,
  Users,
  Bot,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Keyboard,
} from 'lucide-react';

interface DosGorillaGameProps {
  onExit: (finalStats?: { p1Score: number; p2Score: number; winner: string }) => void;
}

interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  windowCols: number;
  windowRows: number;
  litWindows: boolean[][];
}

interface Gorilla {
  x: number; // center x
  y: number; // feet y
  width: number;
  height: number;
  armState: 'idle' | 'throwing' | 'victory' | 'hit';
}

interface Banana {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotation: number;
  active: boolean;
  trail: { x: number; y: number }[];
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  active: boolean;
}

// Retro DOS EGA Colors
const EGA_COLORS = {
  sky: '#0000AA', // Classic QBasic Blue
  sun: '#FFFF55', // Bright Yellow
  banana: '#FFFF55',
  gorilla: '#AA5500', // Brown / Fur
  gorillaFace: '#FFD39B',
  redBuilding: '#AA0000',
  cyanBuilding: '#00AAAA',
  grayBuilding: '#AAAAAA',
  darkGrayBuilding: '#555555',
  greenBuilding: '#00AA00',
  windowLit: '#FFFF55',
  windowDark: '#000055',
  textYellow: '#FFFF55',
  textWhite: '#FFFFFF',
  textRed: '#FF5555',
};

const BUILDING_COLORS = [
  EGA_COLORS.redBuilding,
  EGA_COLORS.cyanBuilding,
  EGA_COLORS.grayBuilding,
  EGA_COLORS.darkGrayBuilding,
  EGA_COLORS.greenBuilding,
];

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.28;

export const DosGorillaGame: React.FC<DosGorillaGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const skylineCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game Settings & State
  const [mode, setMode] = useState<'pve' | 'pvp'>('pve'); // Player vs CPU or Player vs Player
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameState, setGameState] = useState<'aiming' | 'flying' | 'exploding' | 'roundOver' | 'gameOver'>('aiming');
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string>('Player 1, enter angle & velocity to throw!');

  // Input Controls
  const [angle, setAngle] = useState<number>(55);
  const [velocity, setVelocity] = useState<number>(65);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Wind state: -15 to +15
  const [wind, setWind] = useState<number>(0);

  // Mutable Game Objects
  const buildingsRef = useRef<Building[]>([]);
  const g1Ref = useRef<Gorilla>({ x: 80, y: 300, width: 28, height: 28, armState: 'idle' });
  const g2Ref = useRef<Gorilla>({ x: 560, y: 300, width: 28, height: 28, armState: 'idle' });
  const bananaRef = useRef<Banana | null>(null);
  const explosionsRef = useRef<Explosion[]>([]);
  const sunShockedRef = useRef<boolean>(false);
  const victoryDanceTimerRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // AI CPU Memory
  const cpuLastAngleRef = useRef<number>(60);
  const cpuLastVelocityRef = useRef<number>(65);
  const cpuLastDistanceErrorRef = useRef<number | null>(null);

  // Sound Synthesizer via Web Audio API
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback((freq: number, duration: number, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [getAudioContext, soundEnabled]);

  const playThrowSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio fallback
    }
  }, [getAudioContext, soundEnabled]);

  const playExplosionSound = useCallback((isGorilla: boolean = false) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const startFreq = isGorilla ? 120 : 180;
      const dur = isGorilla ? 0.6 : 0.25;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + dur);
      gain.gain.setValueAtTime(isGorilla ? 0.3 : 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      // Audio fallback
    }
  }, [getAudioContext, soundEnabled]);

  const playVictoryFanfare = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const notes = [262, 330, 392, 523, 659, 784];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playBeep(freq, 0.12, 'square');
        }, idx * 110);
      });
    } catch {
      // Audio fallback
    }
  }, [playBeep, soundEnabled]);

  // Generate City Skyline & Gorillas
  const initCityAndRound = useCallback((resetScores = false) => {
    if (resetScores) {
      setP1Score(0);
      setP2Score(0);
      setRoundNumber(1);
    }

    // Generate procedural buildings
    const buildings: Building[] = [];
    let currentX = 2;
    const numBuildings = 8;
    const avgWidth = Math.floor((CANVAS_WIDTH - 4) / numBuildings);

    for (let i = 0; i < numBuildings; i++) {
      const isLast = i === numBuildings - 1;
      const w = isLast ? CANVAS_WIDTH - currentX - 2 : Math.floor(avgWidth + (Math.random() * 20 - 10));
      const h = Math.floor(130 + Math.random() * 150); // Building height: 130 to 280
      const y = CANVAS_HEIGHT - h;
      const color = BUILDING_COLORS[i % BUILDING_COLORS.length];

      // Window grid
      const windowCols = Math.max(2, Math.floor(w / 14));
      const windowRows = Math.max(4, Math.floor(h / 18));
      const litWindows: boolean[][] = [];
      for (let r = 0; r < windowRows; r++) {
        litWindows[r] = [];
        for (let c = 0; c < windowCols; c++) {
          litWindows[r][c] = Math.random() > 0.4;
        }
      }

      buildings.push({
        x: currentX,
        y,
        width: w,
        height: h,
        color,
        windowCols,
        windowRows,
        litWindows,
      });

      currentX += w;
    }

    buildingsRef.current = buildings;

    // Place Gorillas on building 1 (left) and building 6 (right)
    const b1 = buildings[1];
    const b2 = buildings[buildings.length - 2];

    g1Ref.current = {
      x: Math.floor(b1.x + b1.width / 2),
      y: b1.y - 14,
      width: 28,
      height: 28,
      armState: 'idle',
    };

    g2Ref.current = {
      x: Math.floor(b2.x + b2.width / 2),
      y: b2.y - 14,
      width: 28,
      height: 28,
      armState: 'idle',
    };

    // Render static buildings to offscreen skyline canvas for punch-out destruction craters
    if (!skylineCanvasRef.current) {
      skylineCanvasRef.current = document.createElement('canvas');
      skylineCanvasRef.current.width = CANVAS_WIDTH;
      skylineCanvasRef.current.height = CANVAS_HEIGHT;
    }
    const skyCtx = skylineCanvasRef.current.getContext('2d');
    if (skyCtx) {
      skyCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Draw all buildings
      buildings.forEach((b) => {
        skyCtx.fillStyle = b.color;
        skyCtx.fillRect(b.x, b.y, b.width, b.height);

        // Dark edge border
        skyCtx.strokeStyle = '#000000';
        skyCtx.lineWidth = 1;
        skyCtx.strokeRect(b.x, b.y, b.width, b.height);

        // Windows
        const colSpacing = b.width / (b.windowCols + 1);
        const rowSpacing = b.height / (b.windowRows + 1);

        for (let r = 0; r < b.windowRows; r++) {
          for (let c = 0; c < b.windowCols; c++) {
            const wx = b.x + (c + 1) * colSpacing - 3;
            const wy = b.y + (r + 1) * rowSpacing - 4;
            skyCtx.fillStyle = b.litWindows[r][c] ? EGA_COLORS.windowLit : EGA_COLORS.windowDark;
            skyCtx.fillRect(wx, wy, 6, 8);
          }
        }
      });
    }

    // Roll random wind: between -14 and +14
    const newWind = Math.floor(Math.random() * 25) - 12;
    setWind(newWind);

    // Reset projectile & explosions
    bananaRef.current = null;
    explosionsRef.current = [];
    sunShockedRef.current = false;
    setTurn(1);
    setGameState('aiming');
    setWinnerMessage(null);
    setStatusLog(`Round started! Wind: ${newWind > 0 ? `+${newWind} (Right)` : newWind < 0 ? `${newWind} (Left)` : '0 (Calm)'}. Player 1 aim!`);
  }, []);

  // Initial mount: setup round
  useEffect(() => {
    initCityAndRound(true);
  }, [initCityAndRound]);

  // Carve crater in buildings canvas
  const carveCrater = (cx: number, cy: number, radius: number) => {
    const skyCtx = skylineCanvasRef.current?.getContext('2d');
    if (skyCtx) {
      skyCtx.save();
      skyCtx.globalCompositeOperation = 'destination-out';
      skyCtx.beginPath();
      skyCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      skyCtx.fill();
      skyCtx.restore();
    }
  };

  // Check collision of banana against buildings
  const checkBuildingCollision = (x: number, y: number): boolean => {
    if (!skylineCanvasRef.current) return false;
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return false;
    const skyCtx = skylineCanvasRef.current.getContext('2d');
    if (!skyCtx) return false;
    try {
      const pixel = skyCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      // If alpha > 30, it hit a non-transparent building pixel!
      return pixel[3] > 30;
    } catch {
      return false;
    }
  };

  // Score and Round State Refs for reliable access in 60fps canvas loop
  const p1ScoreRef = useRef<number>(0);
  const p2ScoreRef = useRef<number>(0);
  const roundNumberRef = useRef<number>(1);
  const switchTurnRef = useRef<() => void>(() => {});
  const executeThrowRef = useRef<(p: 1 | 2, a: number, v: number) => void>(() => {});

  // Synchronized refs for real-time keyboard control
  const angleRef = useRef<number>(angle);
  const velocityRef = useRef<number>(velocity);
  const gameStateRef = useRef<typeof gameState>(gameState);
  const turnRef = useRef<1 | 2>(turn);
  const modeRef = useRef<'pve' | 'pvp'>(mode);
  const handleNextRoundRef = useRef<() => void>(() => {});
  const handleRestartMatchRef = useRef<() => void>(() => {});

  // Update refs when state changes
  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    p1ScoreRef.current = p1Score;
  }, [p1Score]);

  useEffect(() => {
    p2ScoreRef.current = p2Score;
  }, [p2Score]);

  useEffect(() => {
    roundNumberRef.current = roundNumber;
  }, [roundNumber]);

  // Keyboard controls: Left/Right adjusts Angle, Up/Down adjusts Velocity, Space fires
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs (e.g., search or terminal prompt)
      const target = e.target as HTMLElement | null;
      const isTextInput = target && target.tagName === 'INPUT' && target.getAttribute('type') === 'text';
      if (isTextInput) return;

      const key = e.key;

      if (key === 'ArrowLeft') {
        e.preventDefault();
        setAngle((prev) => Math.max(0, Math.min(90, prev - (e.shiftKey ? 5 : 1))));
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        setAngle((prev) => Math.max(0, Math.min(90, prev + (e.shiftKey ? 5 : 1))));
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        setVelocity((prev) => Math.max(1, Math.min(150, prev + (e.shiftKey ? 5 : 1))));
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        setVelocity((prev) => Math.max(1, Math.min(150, prev - (e.shiftKey ? 5 : 1))));
      } else if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
        e.preventDefault();

        // Advance round or restart match if screen is currently showing an end overlay
        if (gameStateRef.current === 'roundOver') {
          handleNextRoundRef.current();
          return;
        }
        if (gameStateRef.current === 'gameOver') {
          handleRestartMatchRef.current();
          return;
        }

        // Fire banana if in aiming state and human player's turn
        if (gameStateRef.current === 'aiming') {
          if (turnRef.current === 2 && modeRef.current === 'pve') {
            return; // CPU turn
          }
          executeThrowRef.current(turnRef.current, angleRef.current, velocityRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Execute Throw
  const executeThrow = useCallback((throwingPlayer: 1 | 2, throwAngle: number, throwVelocity: number) => {
    const isP1 = throwingPlayer === 1;
    const shooter = isP1 ? g1Ref.current : g2Ref.current;

    shooter.armState = 'throwing';
    playThrowSound();

    // Spawn banana at gorilla's hand
    const startX = isP1 ? shooter.x + 14 : shooter.x - 14;
    const startY = shooter.y - 18;

    // Angle: 0 to 90 degrees elevation
    // P1 throws to the right (+vx), P2 throws to the left (-vx)
    const rad = (throwAngle * Math.PI) / 180;
    const speed = throwVelocity * 0.16;
    const vx = isP1 ? Math.cos(rad) * speed : -Math.cos(rad) * speed;
    const vy = -Math.sin(rad) * speed;

    bananaRef.current = {
      x: startX,
      y: startY,
      vx,
      vy,
      angle: throwAngle,
      rotation: 0,
      active: true,
      trail: [{ x: startX, y: startY }],
    };

    setGameState('flying');
    setStatusLog(`${isP1 ? 'Player 1' : mode === 'pve' ? 'Gorilla Bot (CPU)' : 'Player 2'} threw with Angle ${throwAngle}°, Velocity ${throwVelocity}!`);

    // Reset arm after brief throw animation
    setTimeout(() => {
      shooter.armState = 'idle';
    }, 350);
  }, [mode, playThrowSound]);

  executeThrowRef.current = executeThrow;

  // Turn Switcher
  const switchTurn = useCallback(() => {
    setGameState('aiming');
    setTurn((prev) => {
      const nextTurn = prev === 1 ? 2 : 1;
      if (nextTurn === 1) {
        setStatusLog("Player 1's turn! Adjust angle & velocity to throw.");
      }
      return nextTurn;
    });
  }, []);

  switchTurnRef.current = switchTurn;

  // CPU Bot AI Automatic Fire Turn Effect
  useEffect(() => {
    if (mode !== 'pve' || turn !== 2 || gameState !== 'aiming') return;

    setStatusLog('Gorilla Bot (CPU) is calculating wind & ballistic arc...');

    const timer = setTimeout(() => {
      // 1. Choose elevation angle (50° to 74°)
      const botAngle = 54 + Math.floor(Math.random() * 18);
      const rad = (botAngle * Math.PI) / 180;

      const g1 = g1Ref.current;
      const g2 = g2Ref.current;
      const startX = g2.x - 14;
      const startY = g2.y - 18;
      const targetX = g1.x;
      const targetY = g1.y - 14;

      // 2. Perform trajectory simulation to solve for optimal velocity
      let bestVelocity = 65;
      let minDistance = Infinity;

      for (let testV = 26; testV <= 130; testV += 1) {
        const speed = testV * 0.16;
        let simVx = -Math.cos(rad) * speed; // firing left towards P1
        let simVy = -Math.sin(rad) * speed;
        let sx = startX;
        let sy = startY;

        for (let step = 0; step < 120; step++) {
          simVx += wind * 0.0028;
          simVy += GRAVITY;
          sx += simVx;
          sy += simVy;

          const dist = Math.hypot(sx - targetX, sy - targetY);
          if (dist < minDistance) {
            minDistance = dist;
            bestVelocity = testV;
          }
          if (sy > CANVAS_HEIGHT || sx < -60 || sx > CANVAS_WIDTH + 60) break;
        }
      }

      // 3. Add retro human-like error spread (jitter) so bot doesn't 100% snipe on turn 1
      // Jitter gradually tightens as rounds progress
      const spread = Math.max(5, 18 - roundNumberRef.current * 3.5);
      const jitter = (Math.random() * 2 - 1) * spread;
      const finalVelocity = Math.max(22, Math.min(135, Math.round(bestVelocity + jitter)));

      // Update input display so player sees what the bot chose
      setAngle(botAngle);
      setVelocity(finalVelocity);

      // Launch banana from CPU Gorilla!
      executeThrowRef.current(2, botAngle, finalVelocity);
    }, 1200);

    return () => clearTimeout(timer);
  }, [mode, turn, gameState, wind]);

  // Handle User Throw Button / Enter key
  const handleThrow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (gameState !== 'aiming') return;
    if (turn === 2 && mode === 'pve') return; // CPU turn
    executeThrow(turn, angle, velocity);
  };

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const gameLoop = () => {
      if (!isMounted) return;

      // 1. Clear Screen with DOS Blue
      ctx.fillStyle = EGA_COLORS.sky;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Draw Smiling Sun in Upper Center
      const sunX = CANVAS_WIDTH / 2;
      const sunY = 46;
      const sunR = 18;

      // Sun rays
      ctx.strokeStyle = EGA_COLORS.sun;
      ctx.lineWidth = 2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const x1 = sunX + Math.cos(a) * (sunR + 2);
        const y1 = sunY + Math.sin(a) * (sunR + 2);
        const x2 = sunX + Math.cos(a) * (sunR + 8);
        const y2 = sunY + Math.sin(a) * (sunR + 8);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Sun body
      ctx.fillStyle = EGA_COLORS.sun;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sun Face
      ctx.fillStyle = '#000000';
      // Sunglasses / eyes
      ctx.fillRect(sunX - 8, sunY - 4, 4, 3);
      ctx.fillRect(sunX + 4, sunY - 4, 4, 3);
      ctx.fillRect(sunX - 5, sunY - 3, 3, 1); // bridge

      // Mouth: Smiling or Shocked "O"
      if (sunShockedRef.current) {
        ctx.beginPath();
        ctx.arc(sunX, sunY + 6, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(sunX, sunY + 3, 7, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
      }

      // 3. Blit Pre-rendered Skyline & Craters Canvas
      if (skylineCanvasRef.current) {
        ctx.drawImage(skylineCanvasRef.current, 0, 0);
      }

      // 4. Draw Gorillas
      const drawGorilla = (g: Gorilla, isPlayer1: boolean) => {
        ctx.save();
        ctx.translate(g.x, g.y);

        // Body (Chest)
        ctx.fillStyle = EGA_COLORS.gorilla;
        ctx.fillRect(-11, -22, 22, 18);

        // Head
        ctx.fillRect(-7, -30, 14, 10);

        // Ears
        ctx.fillRect(-9, -28, 3, 4);
        ctx.fillRect(6, -28, 3, 4);

        // Face & Muzzle
        ctx.fillStyle = EGA_COLORS.gorillaFace;
        ctx.fillRect(-5, -27, 10, 6);
        ctx.fillRect(-4, -22, 8, 4);

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-3, -26, 2, 2);
        ctx.fillRect(1, -26, 2, 2);

        // Chest details
        ctx.fillStyle = '#5A2D00';
        ctx.fillRect(-6, -18, 12, 10);

        // Feet
        ctx.fillStyle = EGA_COLORS.gorilla;
        ctx.fillRect(-10, -4, 7, 4);
        ctx.fillRect(3, -4, 7, 4);

        // Arms based on state
        if (g.armState === 'victory') {
          // Both arms raised high in victory dance
          ctx.fillStyle = EGA_COLORS.gorilla;
          ctx.fillRect(-16, -34, 5, 18);
          ctx.fillRect(11, -34, 5, 18);
        } else if (g.armState === 'throwing') {
          if (isPlayer1) {
            // Right arm up and forward
            ctx.fillStyle = EGA_COLORS.gorilla;
            ctx.fillRect(-15, -18, 5, 12);
            ctx.fillRect(10, -32, 5, 16);
          } else {
            // Left arm up and forward
            ctx.fillStyle = EGA_COLORS.gorilla;
            ctx.fillRect(-15, -32, 5, 16);
            ctx.fillRect(10, -18, 5, 12);
          }
        } else {
          // Idle: arms resting at sides
          ctx.fillStyle = EGA_COLORS.gorilla;
          ctx.fillRect(-15, -18, 5, 16);
          ctx.fillRect(10, -18, 5, 16);
        }

        ctx.restore();
      };

      drawGorilla(g1Ref.current, true);
      drawGorilla(g2Ref.current, false);

      // 5. Update & Draw Banana Projectile (3x Speed via sub-stepping)
      const banana = bananaRef.current;
      if (banana && banana.active) {
        const SPEED_MULTIPLIER = 3;

        for (let step = 0; step < SPEED_MULTIPLIER && banana.active; step++) {
          // Apply wind and gravity physics
          banana.vx += wind * 0.0028;
          banana.vy += GRAVITY;

          banana.x += banana.vx;
          banana.y += banana.vy;
          banana.rotation += 0.25;

          // Add trail point
          banana.trail.push({ x: banana.x, y: banana.y });
          if (banana.trail.length > 45) banana.trail.shift();

          // Check proximity to Sun -> trigger shocked expression!
          const distToSun = Math.hypot(banana.x - sunX, banana.y - sunY);
          if (distToSun < 48) {
            sunShockedRef.current = true;
          } else if (distToSun > 70 && sunShockedRef.current) {
            sunShockedRef.current = false;
          }

          // 6. Collision Checking
          const g1 = g1Ref.current;
          const g2 = g2Ref.current;
          const hitG1 = Math.hypot(banana.x - g1.x, banana.y - (g1.y - 14)) < 20;
          const hitG2 = Math.hypot(banana.x - g2.x, banana.y - (g2.y - 14)) < 20;
          const hitBuilding = checkBuildingCollision(banana.x, banana.y);
          const outOfBounds = banana.y > CANVAS_HEIGHT + 30 || banana.x < -80 || banana.x > CANVAS_WIDTH + 80;

          if (hitG1 || hitG2) {
            // Direct hit on Gorilla!
            banana.active = false;
            playExplosionSound(true);

            const targetX = hitG1 ? g1.x : g2.x;
            const targetY = hitG1 ? g1.y - 14 : g2.y - 14;

            explosionsRef.current.push({
              x: targetX,
              y: targetY,
              radius: 4,
              maxRadius: 36,
              color: EGA_COLORS.textRed,
              active: true,
            });

            // Carve crater
            carveCrater(targetX, targetY, 32);

            if (hitG2) {
              // P1 scored against P2!
              g1.armState = 'victory';
              g2.armState = 'hit';
              const nextScore = p1ScoreRef.current + 1;
              p1ScoreRef.current = nextScore;
              setP1Score(nextScore);
              if (nextScore >= 3) {
                setGameState('gameOver');
                setWinnerMessage('🏆 Player 1 (Nate) Wins the Match!');
              } else {
                setGameState('roundOver');
              }
              setStatusLog('DIRECT HIT! Gorilla 2 vaporized! Point to Player 1!');
              playVictoryFanfare();
            } else {
              // P1 hit themselves or P2 scored!
              g2.armState = 'victory';
              g1.armState = 'hit';
              const nextScore = p2ScoreRef.current + 1;
              p2ScoreRef.current = nextScore;
              setP2Score(nextScore);
              if (nextScore >= 3) {
                setGameState('gameOver');
                setWinnerMessage(mode === 'pve' ? '🤖 Gorilla Bot Wins the Match!' : '🏆 Player 2 Wins the Match!');
              } else {
                setGameState('roundOver');
              }
              setStatusLog(turn === 1 ? 'BLUNDER! Gorilla 1 hit itself! Point to Player 2!' : 'DIRECT HIT! Gorilla 1 hit! Point to Player 2!');
              playVictoryFanfare();
            }
            break;
          } else if (hitBuilding) {
            // Hit building -> create crater!
            banana.active = false;
            playExplosionSound(false);

            explosionsRef.current.push({
              x: banana.x,
              y: banana.y,
              radius: 2,
              maxRadius: 20,
              color: EGA_COLORS.sun,
              active: true,
            });

            carveCrater(banana.x, banana.y, 20);

            setStatusLog(`Building cratered! Missed gorillas. Switching turns.`);
            switchTurnRef.current();
            break;
          } else if (outOfBounds) {
            // Missed offscreen
            banana.active = false;
            setStatusLog(`Banana flew into the stratosphere! Missed. Switching turns.`);
            switchTurnRef.current();
            break;
          }
        }

        // Draw trail
        ctx.fillStyle = 'rgba(255, 255, 85, 0.4)';
        banana.trail.forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, idx * 0.08 + 1, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Banana Sprite (Crescent) if still active
        if (banana.active) {
          ctx.save();
          ctx.translate(banana.x, banana.y);
          ctx.rotate(banana.rotation);
          ctx.fillStyle = EGA_COLORS.banana;
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0.4 * Math.PI, 1.6 * Math.PI);
          ctx.quadraticCurveTo(2, 0, 0, 6);
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Update & Draw Explosions
      explosionsRef.current = explosionsRef.current.filter((exp) => exp.active);
      explosionsRef.current.forEach((exp) => {
        exp.radius += 1.8;
        if (exp.radius >= exp.maxRadius) {
          exp.active = false;
        }

        ctx.fillStyle = exp.radius < exp.maxRadius * 0.5 ? EGA_COLORS.sun : exp.radius < exp.maxRadius * 0.8 ? EGA_COLORS.textRed : '#888888';
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 8. Trajectory Arc Assist Preview (if enabled and aiming)
      if (showTrajectory && gameState === 'aiming') {
        const isP1 = turn === 1;
        const shooter = isP1 ? g1Ref.current : g2Ref.current;
        const startX = isP1 ? shooter.x + 14 : shooter.x - 14;
        const startY = shooter.y - 18;
        const rad = (angle * Math.PI) / 180;
        const speed = velocity * 0.16;
        let simVx = isP1 ? Math.cos(rad) * speed : -Math.cos(rad) * speed;
        let simVy = -Math.sin(rad) * speed;
        let simX = startX;
        let simY = startY;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(simX, simY);

        for (let step = 0; step < 40; step++) {
          simVx += wind * 0.0028;
          simVy += GRAVITY;
          simX += simVx;
          simY += simVy;
          ctx.lineTo(simX, simY);
          if (simY > CANVAS_HEIGHT || simX < 0 || simX > CANVAS_WIDTH) break;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Loop
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isMounted = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [wind, showTrajectory, gameState, turn, mode]);

  // Next Round Trigger
  const handleNextRound = useCallback(() => {
    setRoundNumber((r) => r + 1);
    initCityAndRound(false);
  }, []);

  handleNextRoundRef.current = handleNextRound;

  // Reset Full Match
  const handleRestartMatch = useCallback(() => {
    initCityAndRound(true);
  }, []);

  handleRestartMatchRef.current = handleRestartMatch;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 font-mono text-xs select-none">
      {/* DOS QBasic Header Banner */}
      <div className="bg-[#000088] px-3 py-2 border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2">
          <span className="text-amber-300 font-bold tracking-wider uppercase text-sm sm:text-base">
            Q B A S I C &nbsp; G O R I L L A S
          </span>
          <span className="text-[10px] text-cyan-300 hidden sm:inline">
            (MS-DOS 5.0 Banana Thrower 1991)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
            title={soundEnabled ? 'Mute 8-bit PC Speaker Audio' : 'Enable 8-bit PC Speaker Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => {
              const newMode = mode === 'pve' ? 'pvp' : 'pve';
              setMode(newMode);
              initCityAndRound(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            title="Toggle between 1-Player vs AI CPU or 2-Player Hot Seat"
          >
            {mode === 'pve' ? <Bot className="w-3 h-3 text-cyan-400" /> : <Users className="w-3 h-3 text-amber-400" />}
            <span>{mode === 'pve' ? 'vs CPU' : '2-Player'}</span>
          </button>

          {/* Trajectory Guide Assist */}
          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`p-1 rounded border text-[11px] ${
              showTrajectory ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Toggle Trajectory Arc Aim Guide"
          >
            {showTrajectory ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Keyboard Controls & Instructions Help */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`p-1 rounded border text-[11px] ${
              showHelp ? 'bg-amber-950 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Keyboard Controls & How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Restart */}
          <button
            onClick={handleRestartMatch}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
            title="Restart Match (Reset Scores & Skyline)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Exit to DOS */}
          <button
            onClick={() => onExit({ p1Score, p2Score, winner: p1Score > p2Score ? 'Player 1' : 'CPU' })}
            className="flex items-center gap-1 px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-[11px] font-bold"
            title="Exit to Jekyll CLI prompt"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit DOS</span>
          </button>
        </div>
      </div>

      {/* Retro Telemetry & Scoreboard Bar */}
      <div className="bg-[#0000AA] px-4 py-1.5 flex items-center justify-between border-b border-blue-800 text-white font-mono text-xs">
        {/* Player 1 Score */}
        <div className="flex items-center gap-2">
          <span className={`font-bold ${turn === 1 ? 'text-amber-300 underline underline-offset-4' : 'text-slate-300'}`}>
            🦍 P1 (Nate): <span className="text-yellow-300 text-sm">{p1Score}</span>
          </span>
          {turn === 1 && gameState === 'aiming' && (
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 animate-pulse">
              AIMING
            </span>
          )}
        </div>

        {/* Wind Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 rounded border border-slate-700 text-[11px]">
          <span className="text-slate-400">WIND:</span>
          {wind < 0 ? (
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              &lt;== {Math.abs(wind)} (Left)
            </span>
          ) : wind > 0 ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              {wind} (Right) ==&gt;
            </span>
          ) : (
            <span className="text-emerald-400 font-bold">0.0 (Calm)</span>
          )}
        </div>

        {/* Player 2 / CPU Score */}
        <div className="flex items-center gap-2">
          {turn === 2 && gameState === 'aiming' && (
            <span className="text-[10px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/40 animate-pulse">
              AIMING
            </span>
          )}
          <span className={`font-bold ${turn === 2 ? 'text-cyan-300 underline underline-offset-4' : 'text-slate-300'}`}>
            🦍 {mode === 'pve' ? 'Gorilla Bot (CPU)' : 'Player 2'}: <span className="text-yellow-300 text-sm">{p2Score}</span>
          </span>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full max-h-full object-contain aspect-[16/10] bg-[#0000AA]"
        />

        {/* Keyboard Controls & Instructions Modal */}
        {showHelp && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30 text-slate-200">
            <div className="bg-slate-900 border-2 border-amber-400 rounded-xl p-5 max-w-md w-full shadow-2xl shadow-amber-950/50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Keyboard className="w-4 h-4 text-amber-400" />
                  <span>KEYBOARD CONTROLS & AIMING</span>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">→</kbd>
                    <span className="font-semibold text-slate-200">Left / Right Arrows</span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold">Adjust Angle (0°–90°)</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700 font-bold">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700 font-bold">↓</kbd>
                    <span className="font-semibold text-slate-200">Up / Down Arrows</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">Adjust Velocity (1–150)</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 text-yellow-300 border border-slate-700 font-bold">Space</kbd>
                    <span className="text-slate-400">or</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-yellow-300 border border-slate-700 font-bold">Enter</kbd>
                  </div>
                  <span className="text-yellow-400 font-mono font-bold">THROW / Next Round</span>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded border border-slate-800 leading-relaxed">
                  💡 <span className="text-slate-200 font-semibold">Fast stepping:</span> Hold <kbd className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">Shift</kbd> + arrows to adjust by ±5. Bananas carve destructible craters out of the skyline!
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Resume Playing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay for Round Over / Game Over */}
        {gameState === 'roundOver' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="text-2xl font-bold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ROUND {roundNumber} COMPLETE!
            </div>
            <p className="text-sm text-slate-200 max-w-sm">{statusLog}</p>
            <button
              onClick={handleNextRound}
              className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
            >
              <span>Next Round (First to 3 Points)</span>
              <kbd className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded border border-emerald-400/40 text-emerald-200">Space</kbd>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="text-3xl font-bold text-yellow-300 drop-shadow-[0_2px_8px_rgba(255,255,85,0.4)]">
              {winnerMessage}
            </div>
            <p className="text-sm text-slate-200">
              Final Score: Player 1: {p1Score} &mdash; {mode === 'pve' ? 'Gorilla Bot' : 'Player 2'}: {p2Score}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleRestartMatch}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Rematch</span>
                <kbd className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded border border-emerald-400/40 text-emerald-200">Space</kbd>
              </button>
              <button
                onClick={() => onExit({ p1Score, p2Score, winner: p1Score > p2Score ? 'Player 1' : 'CPU' })}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Return to Jekyll CLI</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Aim & Fire Control HUD */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Left: Status Message */}
        <div className="flex items-center gap-2 text-slate-300 text-[11px] truncate max-w-full sm:max-w-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{statusLog}</span>
        </div>

        {/* Center / Right: Angle, Velocity & Fire Controls */}
        <form onSubmit={handleThrow} className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
          {/* Keyboard Legend Hint */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/90 px-2.5 py-1 rounded border border-slate-800">
            <Keyboard className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-slate-500">Keys:</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">←/→</kbd> Angle</span>
            <span className="text-slate-600">&bull;</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700 font-bold">↑/↓</kbd> Vel</span>
            <span className="text-slate-600">&bull;</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-yellow-300 border border-slate-700 font-bold">Space</kbd> Fire</span>
          </div>

          {/* Angle Input */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <kbd className="text-[10px] bg-slate-800 text-amber-300 px-1 py-0.5 rounded border border-slate-700 font-bold">←→</kbd>
              <span>Angle:</span>
            </span>
            <input
              type="number"
              min="0"
              max="90"
              value={angle}
              onChange={(e) => setAngle(Math.max(0, Math.min(90, parseInt(e.target.value) || 0)))}
              disabled={gameState !== 'aiming' || (turn === 2 && mode === 'pve')}
              className="w-12 bg-slate-900 border border-slate-700 text-amber-300 px-1 py-0.5 rounded text-center font-bold focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-400">&deg;</span>
            <input
              type="range"
              min="10"
              max="85"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              disabled={gameState !== 'aiming' || (turn === 2 && mode === 'pve')}
              className="w-16 accent-amber-400 cursor-pointer hidden md:inline"
            />
          </div>

          {/* Velocity Input */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <kbd className="text-[10px] bg-slate-800 text-emerald-300 px-1 py-0.5 rounded border border-slate-700 font-bold">↑↓</kbd>
              <span>Velocity:</span>
            </span>
            <input
              type="number"
              min="1"
              max="150"
              value={velocity}
              onChange={(e) => setVelocity(Math.max(1, Math.min(150, parseInt(e.target.value) || 1)))}
              disabled={gameState !== 'aiming' || (turn === 2 && mode === 'pve')}
              className="w-12 bg-slate-900 border border-slate-700 text-emerald-300 px-1 py-0.5 rounded text-center font-bold focus:outline-none focus:border-emerald-400"
            />
            <input
              type="range"
              min="20"
              max="120"
              value={velocity}
              onChange={(e) => setVelocity(parseInt(e.target.value))}
              disabled={gameState !== 'aiming' || (turn === 2 && mode === 'pve')}
              className="w-16 accent-emerald-400 cursor-pointer hidden md:inline"
            />
          </div>

          {/* Quick Preset Angles */}
          <div className="hidden lg:flex items-center gap-1 text-[10px]">
            {[35, 45, 60, 75].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAngle(preset)}
                disabled={gameState !== 'aiming' || (turn === 2 && mode === 'pve')}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                {preset}&deg;
              </button>
            ))}
          </div>

          {/* Fire / Throw Banana Button */}
          <button
            type="submit"
            disabled={gameState !== 'aiming' || (turn === 2 && mode === 'pve')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              gameState === 'aiming' && !(turn === 2 && mode === 'pve')
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>🍌 THROW</span>
            <span className="text-[10px] bg-slate-950/25 px-1 py-0.2 rounded font-mono hidden sm:inline">[Space]</span>
          </button>
        </form>
      </div>
    </div>
  );
};
