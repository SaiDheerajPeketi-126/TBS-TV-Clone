import React from 'react';

function IndicatorDropdown({ isOpen, onClose, onSelectIndicator }) {
  const indicators = [
    { id: 'ma', name: 'Moving Average' },
    { id: 'ema', name: 'Exponential MA' },
    { id: 'bb', name: 'Bollinger Bands' },
    { id: 'rsi', name: 'RSI' },
    { id: 'macd', name: 'MACD' },
    { id: 'volume', name: 'Volume Profile' },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
      {indicators.map((indicator) => (
        <button
          key={indicator.id}
          className="flex items-center w-full px-3 py-2 text-left text-xs hover:bg-gray-700"
          onClick={() => {
            onSelectIndicator(indicator.id);
            onClose();
          }}
        >
          {indicator.name}
        </button>
      ))}
    </div>
  );
}

export default IndicatorDropdown;