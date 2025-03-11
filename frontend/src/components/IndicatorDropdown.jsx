import React from 'react';

function IndicatorDropdown({ isOpen, onClose, onSelectIndicator }) {
  const indicators = [
    { id: 'ma', name: 'Moving Average', description: 'Calculates average price over specified period' },
    { id: 'ema', name: 'Exponential MA', description: 'Moving average with more weight to recent prices' },
    { id: 'bb', name: 'Bollinger Bands', description: 'Shows volatility channels around a moving average' },
    { id: 'rsi', name: 'RSI', description: 'Measures momentum and overbought/oversold conditions' },
    { id: 'macd', name: 'MACD', description: 'Trend-following momentum indicator' },
    { id: 'volume', name: 'Volume Profile', description: 'Displays trading volume at price levels' },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
      <div className="max-h-80 overflow-y-auto p-2">
        <div className="text-xs text-gray-400 mb-2 px-2 py-1 border-b border-gray-700">
          Select Technical Indicator
        </div>
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className="flex flex-col w-full mb-1 rounded hover:bg-gray-700 cursor-pointer border border-gray-700"
            onClick={() => {
              onSelectIndicator(indicator.id);
              onClose();
            }}
          >
            <div className="px-3 py-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                <span className="text-xs font-medium">{indicator.name}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 pl-5">
                {indicator.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndicatorDropdown;