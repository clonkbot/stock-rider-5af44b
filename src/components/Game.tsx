import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { StockData } from '../App';

interface GameProps {
  stockData: StockData;
  onGameOver: (score: number, distance: number, flips: number) => void;
}

interface Motorcycle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  onGround: boolean;
  crashed: boolean;
}

interface Trail {
  x: number;
  y: number;
  age: number;
}

const Game = forwardRef<{ reset: () => void }, GameProps>(({ stockData, onGameOver }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const motorcycleRef = useRef<Motorcycle>({
    x: 100,
    y: 0,
    vx: 4,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    onGround: false,
    crashed: false,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const trailRef = useRef<Trail[]>([]);
  const cameraXRef = useRef(0);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const flipsRef = useRef(0);
  const airTimeRef = useRef(0);
  const totalRotationRef = useRef(0);
  const lastAngleRef = useRef(0);
  const boostRef = useRef(0);
  const lastTapRef = useRef(0);
  const touchSideRef = useRef<'left' | 'right' | null>(null);

  const [score, setScore] = useState(0);
  const [showFlipBonus, setShowFlipBonus] = useState(false);
  const [flipBonusAmount, setFlipBonusAmount] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Convert stock prices to terrain
  const getTerrainY = useCallback((worldX: number): number => {
    const priceIndex = Math.floor(worldX / 15);
    const nextIndex = priceIndex + 1;

    if (priceIndex < 0) return dimensions.height * 0.6;
    if (priceIndex >= stockData.prices.length - 1) {
      return dimensions.height * 0.6;
    }

    const prices = stockData.prices;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const normalizedCurrent = (prices[priceIndex] - minPrice) / priceRange;
    const normalizedNext = (prices[Math.min(nextIndex, prices.length - 1)] - minPrice) / priceRange;

    const t = (worldX / 15) - priceIndex;
    const normalized = normalizedCurrent + (normalizedNext - normalizedCurrent) * t;

    // Invert Y (higher price = higher on screen = lower Y value)
    const margin = dimensions.height * 0.15;
    const usableHeight = dimensions.height * 0.6;
    return dimensions.height - margin - (normalized * usableHeight);
  }, [stockData.prices, dimensions]);

  const getTerrainSlope = useCallback((worldX: number): number => {
    const y1 = getTerrainY(worldX - 5);
    const y2 = getTerrainY(worldX + 5);
    return Math.atan2(y2 - y1, 10);
  }, [getTerrainY]);

  const reset = useCallback(() => {
    motorcycleRef.current = {
      x: 100,
      y: getTerrainY(100) - 20,
      vx: 4,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      onGround: false,
      crashed: false,
    };
    cameraXRef.current = 0;
    scoreRef.current = 0;
    distanceRef.current = 0;
    flipsRef.current = 0;
    airTimeRef.current = 0;
    totalRotationRef.current = 0;
    lastAngleRef.current = 0;
    boostRef.current = 0;
    trailRef.current = [];
    setScore(0);
  }, [getTerrainY]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.min(rect.height, window.innerHeight * 0.7),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize motorcycle position
  useEffect(() => {
    motorcycleRef.current.y = getTerrainY(100) - 20;
  }, [getTerrainY, dimensions]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === ' ') {
        e.preventDefault();
        boostRef.current = 30;
        setIsBoosting(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
      if (e.key === ' ') {
        setIsBoosting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const centerX = rect.width / 2;

      // Double tap detection for boost
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        boostRef.current = 30;
        setIsBoosting(true);
        setTimeout(() => setIsBoosting(false), 500);
      }
      lastTapRef.current = now;

      if (x < centerX) {
        touchSideRef.current = 'left';
        keysRef.current.add('ArrowUp');
      } else {
        touchSideRef.current = 'right';
        keysRef.current.add('ArrowDown');
      }
    };

    const handleTouchEnd = () => {
      keysRef.current.delete('ArrowUp');
      keysRef.current.delete('ArrowDown');
      touchSideRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      const moto = motorcycleRef.current;

      if (moto.crashed) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Physics
      const gravity = 0.5 * deltaTime;
      const friction = 0.98;
      const airResistance = 0.995;

      // Controls
      if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) {
        moto.angularVelocity -= 0.15 * deltaTime;
      }
      if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) {
        moto.angularVelocity += 0.15 * deltaTime;
      }

      // Boost
      if (boostRef.current > 0) {
        moto.vx += 0.3 * deltaTime;
        boostRef.current -= deltaTime;
      }

      // Apply physics
      moto.vy += gravity;
      moto.angle += moto.angularVelocity * deltaTime;
      moto.angularVelocity *= 0.95;

      // Track rotation for flips
      if (!moto.onGround) {
        const angleDiff = moto.angle - lastAngleRef.current;
        totalRotationRef.current += angleDiff;
        airTimeRef.current += deltaTime;
      }
      lastAngleRef.current = moto.angle;

      // Move motorcycle
      moto.x += moto.vx * deltaTime;
      moto.y += moto.vy * deltaTime;

      // Terrain collision
      const terrainY = getTerrainY(moto.x);
      const terrainSlope = getTerrainSlope(moto.x);

      if (moto.y >= terrainY - 15) {
        // Landing check
        if (!moto.onGround) {
          // Check for flip completion
          const fullRotations = Math.abs(totalRotationRef.current) / (Math.PI * 2);
          if (fullRotations >= 0.8) {
            const flips = Math.floor(fullRotations);
            flipsRef.current += flips;
            const flipBonus = flips * 500;
            scoreRef.current += flipBonus;
            setFlipBonusAmount(flipBonus);
            setShowFlipBonus(true);
            setTimeout(() => setShowFlipBonus(false), 1000);
          }

          totalRotationRef.current = 0;
          airTimeRef.current = 0;

          // Crash check - angle difference from terrain
          const angleDiff = Math.abs(moto.angle - terrainSlope);
          const normalizedAngleDiff = angleDiff % (Math.PI * 2);
          const effectiveAngleDiff = Math.min(normalizedAngleDiff, Math.PI * 2 - normalizedAngleDiff);

          if (effectiveAngleDiff > Math.PI / 3 && Math.abs(moto.vy) > 3) {
            moto.crashed = true;
            onGameOver(scoreRef.current, distanceRef.current, flipsRef.current);
            return;
          }
        }

        moto.y = terrainY - 15;
        moto.onGround = true;
        moto.vy = 0;

        // Align to slope smoothly
        const slopeAlignStrength = 0.2;
        moto.angle = moto.angle * (1 - slopeAlignStrength) + terrainSlope * slopeAlignStrength;
        moto.angularVelocity *= 0.5;

        // Friction
        moto.vx *= friction;

        // Maintain minimum speed
        const minSpeed = 3;
        if (moto.vx < minSpeed) {
          moto.vx += (minSpeed - moto.vx) * 0.1;
        }

        // Speed boost going downhill
        if (terrainSlope > 0.1) {
          moto.vx += terrainSlope * 0.5 * deltaTime;
        }
        // Slow down going uphill
        if (terrainSlope < -0.1) {
          moto.vx += terrainSlope * 0.3 * deltaTime;
        }
      } else {
        moto.onGround = false;
        moto.vx *= airResistance;
      }

      // Speed limits
      moto.vx = Math.max(2, Math.min(moto.vx, 15));

      // Update camera
      const targetCameraX = moto.x - dimensions.width * 0.3;
      cameraXRef.current += (targetCameraX - cameraXRef.current) * 0.1;

      // Update score
      distanceRef.current = Math.floor(moto.x / 10);
      scoreRef.current = distanceRef.current + flipsRef.current * 100;
      setScore(scoreRef.current);

      // Add trail
      if (Math.random() > 0.3) {
        trailRef.current.push({
          x: moto.x - Math.cos(moto.angle) * 25,
          y: moto.y + Math.sin(moto.angle) * 5,
          age: 0,
        });
      }

      // Age and remove old trail particles
      trailRef.current = trailRef.current
        .map(t => ({ ...t, age: t.age + deltaTime }))
        .filter(t => t.age < 30);

      // Render
      render(ctx, moto);

      // Check for end of chart
      if (moto.x > stockData.prices.length * 15) {
        moto.crashed = true;
        onGameOver(scoreRef.current, distanceRef.current, flipsRef.current);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [stockData, getTerrainY, getTerrainSlope, onGameOver, dimensions]);

  const render = (ctx: CanvasRenderingContext2D, moto: Motorcycle) => {
    const { width, height } = dimensions;
    const cameraX = cameraXRef.current;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const startGridX = Math.floor(cameraX / gridSize) * gridSize;

    for (let x = startGridX; x < cameraX + width + gridSize; x += gridSize) {
      const screenX = x - cameraX;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw terrain (stock chart)
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let screenX = 0; screenX <= width; screenX += 3) {
      const worldX = screenX + cameraX;
      const terrainY = getTerrainY(worldX);
      ctx.lineTo(screenX, terrainY);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    // Terrain gradient
    const terrainGradient = ctx.createLinearGradient(0, 0, 0, height);
    terrainGradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
    terrainGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.1)');
    terrainGradient.addColorStop(1, 'rgba(0, 255, 136, 0.02)');
    ctx.fillStyle = terrainGradient;
    ctx.fill();

    // Terrain line glow
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let screenX = 0; screenX <= width; screenX += 3) {
      const worldX = screenX + cameraX;
      const terrainY = getTerrainY(worldX);
      if (screenX === 0) ctx.moveTo(screenX, terrainY);
      else ctx.lineTo(screenX, terrainY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw trail
    trailRef.current.forEach(trail => {
      const screenX = trail.x - cameraX;
      const alpha = Math.max(0, 1 - trail.age / 30);
      ctx.beginPath();
      ctx.arc(screenX, trail.y, 3 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
      ctx.fill();
    });

    // Draw motorcycle
    const motoScreenX = moto.x - cameraX;
    ctx.save();
    ctx.translate(motoScreenX, moto.y);
    ctx.rotate(moto.angle);

    // Glow effect
    ctx.shadowColor = isBoosting ? '#ff00ff' : '#00ffff';
    ctx.shadowBlur = isBoosting ? 30 : 15;

    // Wheels
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;

    // Back wheel
    ctx.beginPath();
    ctx.arc(-18, 8, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Front wheel
    ctx.beginPath();
    ctx.arc(18, 8, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Frame
    ctx.strokeStyle = isBoosting ? '#ff00ff' : '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.lineTo(-5, -8);
    ctx.lineTo(10, -8);
    ctx.lineTo(18, 8);
    ctx.stroke();

    // Handlebar
    ctx.beginPath();
    ctx.moveTo(10, -8);
    ctx.lineTo(15, -15);
    ctx.stroke();

    // Rider
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -18, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(0, -5);
    ctx.lineTo(-8, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(10, -10);
    ctx.stroke();

    ctx.restore();
    ctx.shadowBlur = 0;

    // Draw stock symbol
    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.font = `bold ${Math.min(width * 0.15, 120)}px "Orbitron", sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(stockData.symbol, width - 20, height - 30);
  };

  return (
    <div ref={containerRef} className="w-full h-[60vh] md:h-[70vh] relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 border border-emerald-500/30">
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Score</p>
          <p className="text-xl md:text-3xl font-mono text-emerald-400">{score.toLocaleString()}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 border border-cyan-500/30">
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider text-right">{stockData.symbol}</p>
            <p className="text-sm md:text-lg font-mono text-cyan-400">{stockData.name}</p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 border border-yellow-500/30">
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Flips</p>
            <p className="text-lg md:text-xl font-mono text-yellow-400">{flipsRef.current}</p>
          </div>
        </div>
      </div>

      {/* Flip Bonus Popup */}
      {showFlipBonus && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce">
          <p className="text-3xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(255,200,0,0.8)]">
            +{flipBonusAmount} FLIP!
          </p>
        </div>
      )}

      {/* Boost Indicator */}
      {isBoosting && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <p className="text-lg md:text-2xl font-black text-fuchsia-400 animate-pulse tracking-widest">
            BOOST!
          </p>
        </div>
      )}

      {/* Mobile Touch Zones Indicator */}
      <div className="md:hidden absolute bottom-16 left-4 right-4 flex justify-between pointer-events-none opacity-30">
        <div className="text-xs text-emerald-400 uppercase">← Lean Back</div>
        <div className="text-xs text-emerald-400 uppercase">Lean Forward →</div>
      </div>
    </div>
  );
});

Game.displayName = 'Game';

export default Game;
