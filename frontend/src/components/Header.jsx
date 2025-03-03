import React from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon, UserIcon, CogIcon } from './Icons';

function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center">
        <div className="text-blue-500 font-bold text-xl mr-6">TradingClone</div>
        <nav className="hidden md:flex space-x-4">
          <a href="#" className="px-2 py-1 hover:bg-gray-700 rounded">Charts</a>
          <a href="https://www.screener.in/" className="px-2 py-1 hover:bg-gray-700 rounded">Screener</a>
          <a href="#" className="px-2 py-1 hover:bg-gray-700 rounded">Market</a>
          <a href="#" className="px-2 py-1 hover:bg-gray-700 rounded">Community</a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Symbol Search" 
            className="bg-gray-700 text-sm rounded px-3 py-1.5 w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <SearchIcon className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
        </div>
        
        <button className="p-1.5 hover:bg-gray-700 rounded-full">
          <BellIcon className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-700 rounded cursor-pointer">
          <UserIcon className="h-5 w-5" />
          <span className="text-sm hidden md:inline">Profile</span>
          <ChevronDownIcon className="h-4 w-4" />
        </div>
        
        <button className="p-1.5 hover:bg-gray-700 rounded-full">
          <CogIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export default Header;