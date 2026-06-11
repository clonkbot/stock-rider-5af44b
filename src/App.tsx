import { useState, useEffect, useCallback, useRef } from 'react';
import Game from './components/Game';
import StockSelector from './components/StockSelector';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';

export type GameState = 'start' | 'playing' | 'gameover';

export interface StockData {
  symbol: string;
  name: string;
  prices: number[];
}

// Pre-generated stock data for various companies
const STOCK_DATA: Record<string, StockData> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    prices: generateStockPrices(175, 0.02, 500, 'trending'),
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    prices: generateStockPrices(245, 0.04, 500, 'volatile'),
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    prices: generateStockPrices(480, 0.03, 500, 'bullish'),
  },
  GME: {
    symbol: 'GME',
    name: 'GameStop Corp.',
    prices: generateStockPrices(18, 0.08, 500, 'meme'),
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    prices: generateStockPrices(155, 0.015, 500, 'stable'),
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms',
    prices: generateStockPrices(380, 0.025, 500, 'trending'),
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    prices: generateStockPrices(375, 0.012, 500, 'stable'),
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    prices: generateStockPrices(42000, 0.05, 500, 'volatile'),
  },
};

function generateStockPrices(
  basePrice: number,
  volatility: number,
  count: number,
  pattern: string
): number[] {
  const prices: number[] = [];
  let price = basePrice;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    let trend = 0;

    switch (pattern) {
      case 'volatile':
        trend = Math.sin(i * 0.1) * volatility * basePrice * 0.5;
        break;
      case 'bullish':
        trend = t * basePrice * 0.3;
        break;
      case 'meme':
        // Sudden spikes
        if (i > 100 && i < 150) trend = (i - 100) * basePrice * 0.1;
        else if (i >= 150 && i < 200) trend = (200 - i) * basePrice * 0.08;
        if (i > 300 && i < 350) trend = (i - 300) * basePrice * 0.15;
        else if (i >= 350 && i < 400) trend = (400 - i) * basePrice * 0.12;
        break;
      case 'trending':
        trend = Math.sin(i * 0.02) * basePrice * 0.1 + t * basePrice * 0.15;
        break;
      case 'stable':
        trend = Math.sin(i * 0.03) * basePrice * 0.05;
        break;
    }

    const noise = (Math.random() - 0.5) * 2 * volatility * basePrice;
    price = basePrice + trend + noise;
    price = Math.max(price, basePrice * 0.3);
    prices.push(price);
  }

  return prices;
}

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedStock, setSelectedStock] = useState<StockData>(STOCK_DATA.TSLA);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('stockRiderHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [distance, setDistance] = useState(0);
  const [flips, setFlips] = useState(0);
  const gameRef = useRef<{ reset: () => void } | null>(null);

  const handleStockSelect = useCallback((symbol: string) => {
    setSelectedStock(STOCK_DATA[symbol]);
  }, []);

  const handleStart = useCallback(() => {
    setScore(0);
    setDistance(0);
    setFlips(0);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((finalScore: number, finalDistance: number, finalFlips: number) => {
    setScore(finalScore);
    setDistance(finalDistance);
    setFlips(finalFlips);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('stockRiderHighScore', finalScore.toString());
    }
    setGameState('gameover');
  }, [highScore]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setDistance(0);
    setFlips(0);
    if (gameRef.current) {
      gameRef.current.reset();
    }
    setGameState('playing');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setGameState('start');
  }, []);

  useEffect(() => {
    // Prevent default touch behaviors for better mobile experience
    const preventDefault = (e: TouchEvent) => {
      if (gameState === 'playing') {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative flex flex-col">
      {/* CRT Scanlines Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        }}
      />

      {/* Vignette Effect */}
      <div className="pointer-events-none fixed inset-0 z-40"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {gameState === 'start' && (
          <StartScreen
            onStart={handleStart}
            onStockSelect={handleStockSelect}
            selectedStock={selectedStock}
            stocks={Object.values(STOCK_DATA)}
            highScore={highScore}
          />
        )}

        {gameState === 'playing' && (
          <Game
            ref={gameRef}
            stockData={selectedStock}
            onGameOver={handleGameOver}
          />
        )}

        {gameState === 'gameover' && (
          <GameOverScreen
            score={score}
            distance={distance}
            flips={flips}
            highScore={highScore}
            stockName={selectedStock.name}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-20 py-3 text-center">
        <p className="text-[10px] sm:text-xs text-gray-600 tracking-wide font-mono">
          Requested by <span className="text-gray-500">@GoldenFarFR</span> · Built by <span className="text-gray-500">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
