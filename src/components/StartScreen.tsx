import { StockData } from '../App';
import StockSelector from './StockSelector';

interface StartScreenProps {
  onStart: () => void;
  onStockSelect: (symbol: string) => void;
  selectedStock: StockData;
  stocks: StockData[];
  highScore: number;
}

export default function StartScreen({
  onStart,
  onStockSelect,
  selectedStock,
  stocks,
  highScore,
}: StartScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Glowing Orb Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px]" />

      {/* Title */}
      <div className="relative mb-8 md:mb-12">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-center">
          <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
            STOCK
          </span>
          <span className="block text-white -mt-2 md:-mt-4">RIDER</span>
        </h1>
        <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl -z-10 rounded-full" />
      </div>

      {/* Motorcycle Icon */}
      <div className="relative mb-6 md:mb-8">
        <svg viewBox="0 0 120 60" className="w-24 h-12 md:w-32 md:h-16">
          {/* Wheels */}
          <circle cx="25" cy="45" r="12" fill="none" stroke="#00ff88" strokeWidth="3" className="animate-spin" style={{ animationDuration: '2s', transformOrigin: '25px 45px' }} />
          <circle cx="95" cy="45" r="12" fill="none" stroke="#00ff88" strokeWidth="3" className="animate-spin" style={{ animationDuration: '2s', transformOrigin: '95px 45px' }} />
          {/* Frame */}
          <path d="M25 45 L45 25 L75 25 L95 45" fill="none" stroke="#00ffff" strokeWidth="3" />
          <path d="M45 25 L55 15 L70 15" fill="none" stroke="#00ffff" strokeWidth="3" />
          {/* Rider silhouette */}
          <circle cx="55" cy="10" r="5" fill="#fff" />
          <path d="M55 15 L55 25 L45 30 M55 20 L65 25" stroke="#fff" strokeWidth="2" fill="none" />
        </svg>
        <div className="absolute inset-0 bg-cyan-400/50 blur-xl -z-10" />
      </div>

      {/* High Score */}
      {highScore > 0 && (
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">High Score</p>
          <p className="text-2xl md:text-3xl font-mono text-yellow-400 animate-pulse">{highScore.toLocaleString()}</p>
        </div>
      )}

      {/* Stock Selector */}
      <div className="w-full max-w-md mb-8">
        <StockSelector
          stocks={stocks}
          selectedStock={selectedStock}
          onSelect={onStockSelect}
        />
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="group relative px-12 py-4 md:px-16 md:py-5 bg-transparent border-2 border-emerald-400 text-emerald-400 font-bold text-lg md:text-xl tracking-wider uppercase transition-all duration-300 hover:bg-emerald-400 hover:text-gray-950 hover:shadow-[0_0_40px_rgba(0,255,136,0.5)] active:scale-95"
      >
        <span className="relative z-10">Start Game</span>
        <div className="absolute inset-0 bg-emerald-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Controls Info */}
      <div className="mt-8 md:mt-12 text-center space-y-2">
        <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-3">Controls</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-emerald-400 font-mono">↑</kbd>
            <span>Lean Back</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-emerald-400 font-mono">↓</kbd>
            <span>Lean Forward</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-cyan-400 font-mono">SPACE</kbd>
            <span>Boost</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-4">Mobile: Tap left/right sides to lean, double-tap for boost</p>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
