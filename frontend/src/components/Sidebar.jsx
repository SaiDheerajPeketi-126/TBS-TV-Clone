import React from 'react';
import { StarIcon, EyeIcon, HistoryIcon, LayersIcon, GridIcon } from './Icons';

function Sidebar() {
  const symbols = [
    { name: 'BTC/USD', price: '66,423.50', change: 1.24 },
    { name: 'ETH/USD', price: '3,125.75', change: 0.89 },
    { name: 'EUR/USD', price: '1.0815', change: -0.32 },
    { name: 'AAPL', price: '189.97', change: 0.45 },
    { name: 'TSLA', price: '175.34', change: -1.25 },
  ];
  
  return (
    <div className="w-64 border-r border-gray-700 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Watchlist</div>
          <div className="flex space-x-1">
            <button className="p-1 hover:bg-gray-700 rounded">
              <StarIcon className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded">
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 h-64 overflow-y-auto">
          {symbols.map((symbol, index) => (
            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded cursor-pointer">
              <div className="font-medium">{symbol.name}</div>
              <div className="text-right">
                <div>{symbol.price}</div>
                <div className={symbol.change >= 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                  {symbol.change >= 0 ? "+" : ""}{symbol.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <div className="font-medium mb-2">Indicators</div>
        <div className="space-y-1 text-sm">
          <div className="p-2 hover:bg-gray-800 rounded cursor-pointer">Moving Average</div>
          <div className="p-2 hover:bg-gray-800 rounded cursor-pointer">RSI</div>
          <div className="p-2 hover:bg-gray-800 rounded cursor-pointer">MACD</div>
          <div className="p-2 hover:bg-gray-800 rounded cursor-pointer">Bollinger Bands</div>
          <div className="p-2 hover:bg-gray-800 rounded cursor-pointer">Volume</div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 p-2">
        <div className="flex justify-around">
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <HistoryIcon className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <LayersIcon className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <GridIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;