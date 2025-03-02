import React from 'react';
import { StarIcon } from './Icons';

function ChartHeader({ symbol, price, change }) {
  return (
    <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">{symbol}</span>
          <button className="p-1 hover:bg-gray-700 rounded">
            <StarIcon className="h-4 w-4 text-yellow-400" />
          </button>
        </div>
        
        <div className="text-lg font-medium">{price}</div>
        <div className={change >= 0 ? "text-green-500" : "text-red-500"}>
          {change >= 0 ? "+" : ""}{change}%
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm">
          Buy / Sell
        </button>
      </div>
    </div>
  );
}

export default ChartHeader;