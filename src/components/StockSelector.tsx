import { useState } from 'react';
import { StockData } from '../App';

interface StockSelectorProps {
  stocks: StockData[];
  selectedStock: StockData;
  onSelect: (symbol: string) => void;
}

export default function StockSelector({ stocks, selectedStock, onSelect }: StockSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getMiniChart = (prices: number[]) => {
    const samplePrices = prices.filter((_, i) => i % 10 === 0);
    const min = Math.min(...samplePrices);
    const max = Math.max(...samplePrices);
    const range = max - min || 1;

    const points = samplePrices.map((price, i) => {
      const x = (i / (samplePrices.length - 1)) * 60;
      const y = 20 - ((price - min) / range) * 18;
      return `${x},${y}`;
    }).join(' ');

    const isUp = samplePrices[samplePrices.length - 1] > samplePrices[0];

    return (
      <svg viewBox="0 0 60 22" className="w-16 h-6">
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? '#00ff88' : '#ff4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="relative">
      <label className="block text-xs uppercase tracking-[0.3em] text-gray-500 mb-2 text-center">
        Select Stock Chart
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 hover:border-emerald-500/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-emerald-400 font-mono">{selectedStock.symbol}</span>
          <span className="text-sm text-gray-400 hidden sm:inline">{selectedStock.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {getMiniChart(selectedStock.prices)}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 border border-gray-700 backdrop-blur-sm z-50 max-h-64 overflow-y-auto">
          {stocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => {
                onSelect(stock.symbol);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors ${
                stock.symbol === selectedStock.symbol ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-emerald-400 font-mono">{stock.symbol}</span>
                <span className="text-sm text-gray-400">{stock.name}</span>
              </div>
              {getMiniChart(stock.prices)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
