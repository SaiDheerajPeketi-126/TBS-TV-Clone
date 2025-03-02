import React from 'react';
import { LineIcon, CandlestickIcon, IndicatorIcon, DrawingIcon, MeasureIcon, TemplateIcon, ShareIcon } from './Icons';

function ChartToolbar({ interval, setInterval }) {
  const intervals = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
  
  return (
    <div className="h-10 flex items-center justify-between px-2 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center space-x-1">
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <LineIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded bg-gray-700">
          <CandlestickIcon className="h-4 w-4" />
        </button>
        <div className="h-4 border-r border-gray-600 mx-1"></div>
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <IndicatorIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <DrawingIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <MeasureIcon className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center space-x-1">
        {intervals.map((int) => (
          <button 
            key={int}
            className={`px-2 py-0.5 text-xs rounded ${interval === int ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setInterval(int)}
          >
            {int}
          </button>
        ))}
      </div>
      
      <div className="flex items-center space-x-1">
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <TemplateIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <ShareIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default ChartToolbar;