interface GameOverScreenProps {
  score: number;
  distance: number;
  flips: number;
  highScore: number;
  stockName: string;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export default function GameOverScreen({
  score,
  distance,
  flips,
  highScore,
  stockName,
  onRestart,
  onBackToMenu,
}: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Crash Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-transparent" />

      {/* Glitch Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Game Over Title */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight">
            <span className="block text-red-500 animate-pulse" style={{ textShadow: '0 0 40px rgba(255,0,0,0.5)' }}>
              CRASH!
            </span>
          </h1>
          {isNewHighScore && (
            <p className="mt-4 text-xl md:text-2xl text-yellow-400 animate-bounce font-bold tracking-wider">
              NEW HIGH SCORE!
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          <div className="bg-gray-900/80 border border-emerald-500/30 p-3 md:p-6">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 mb-1 md:mb-2">Score</p>
            <p className="text-2xl md:text-4xl font-mono text-emerald-400">{score.toLocaleString()}</p>
          </div>

          <div className="bg-gray-900/80 border border-cyan-500/30 p-3 md:p-6">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 mb-1 md:mb-2">Distance</p>
            <p className="text-2xl md:text-4xl font-mono text-cyan-400">{distance.toLocaleString()}</p>
          </div>

          <div className="bg-gray-900/80 border border-yellow-500/30 p-3 md:p-6">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 mb-1 md:mb-2">Flips</p>
            <p className="text-2xl md:text-4xl font-mono text-yellow-400">{flips}</p>
          </div>
        </div>

        {/* Stock Info */}
        <p className="text-gray-500 text-sm mb-8">
          Crashed on <span className="text-emerald-400">{stockName}</span>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="group relative px-8 py-4 md:px-12 md:py-4 bg-emerald-500 text-gray-950 font-bold text-base md:text-lg tracking-wider uppercase transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(0,255,136,0.5)] active:scale-95"
          >
            Try Again
          </button>

          <button
            onClick={onBackToMenu}
            className="group relative px-8 py-4 md:px-12 md:py-4 bg-transparent border-2 border-gray-600 text-gray-400 font-bold text-base md:text-lg tracking-wider uppercase transition-all duration-300 hover:border-gray-400 hover:text-white active:scale-95"
          >
            Change Stock
          </button>
        </div>

        {/* High Score Display */}
        <div className="mt-8 md:mt-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-600 mb-2">All-Time High</p>
          <p className="text-xl md:text-2xl font-mono text-yellow-400/70">{highScore.toLocaleString()}</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 opacity-20">
        <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32">
          <path
            d="M10,50 Q30,20 50,50 T90,50"
            fill="none"
            stroke="#ff4444"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div className="absolute top-10 right-10 opacity-20">
        <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#00ff88" strokeWidth="1" strokeDasharray="10,5" className="animate-spin" style={{ animationDuration: '10s' }} />
        </svg>
      </div>
    </div>
  );
}
