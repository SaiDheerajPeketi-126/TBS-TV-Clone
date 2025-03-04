import React from 'react';
import { StarIcon } from './Icons';

function ChartHeader({ symbol="BTCUSD", price, change, toggleSidebar, isSidebarOpen, toggleFullscreen, isFullscreen }) {
  return (
    <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        {/* Sidebar toggle button */}
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 hover:bg-gray-700 rounded mr-2"
          title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            {isSidebarOpen ? (
              <path d="M3 4.25A2.25 2.25 0 015.25 2h9.5A2.25 2.25 0 0117 4.25v11.5A2.25 2.25 0 0114.75 18h-9.5A2.25 2.25 0 013 15.75V4.25zM5.25 3.5A.75.75 0 004.5 4.25v11.5c0 .414.336.75.75.75h9.5a.75.75 0 00.75-.75V4.25a.75.75 0 00-.75-.75h-9.5z" />
            ) : (
              <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v11.5A2.25 2.25 0 0115.75 18H4.25A2.25 2.25 0 012 15.75V4.25zm13.5 1.5a.75.75 0 00-.75-.75h-8.5a.75.75 0 00-.75.75v8.5a.75.75 0 00.75.75h8.5a.75.75 0 00.75-.75v-8.5z" clipRule="evenodd" />
            )}
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">{symbol}</span>
          <button className="p-1 hover:bg-gray-700 rounded">
            <StarIcon className="h-4 w-4 text-yellow-400" />
          </button>
        </div>
        
        <div className={change >= 0 ? "text-green-500" : "text-red-500"}>{price}</div>
        <div className={change >= 0 ? "text-green-500" : "text-red-500"}>
          {change >= 0 ? "+" : ""}{change}%
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Fullscreen toggle button */}
        <button 
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-gray-700 rounded"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            {isFullscreen ? (
              <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM15 5.75a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5zm-8.5 6a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5a.75.75 0 00-.75-.75z" clipRule="evenodd" />
            )}
          </svg>
        </button>
        
        {/* <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm">
          Buy / Sell
        </button> */}
      </div>
    </div>
  );
}

export default ChartHeader;