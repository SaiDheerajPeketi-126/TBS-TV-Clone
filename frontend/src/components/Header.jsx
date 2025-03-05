import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon, UserIcon, CogIcon } from './Icons';
import QuickSearch from './QuickSearch';
import Settings from './Settings';

function Header({ setInterval, onSymbolSelect }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
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
          {/* QuickSearch component placed here instead of at bottom of screen */}
          <div className="relative w-56">
            <QuickSearch
              intervals={['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M']}
              setInterval={setInterval}
              currentInterval={null}  // Will be properly passed from App.jsx
              onSymbolSelect={onSymbolSelect}
            />
          </div>

          <button className="p-1.5 hover:bg-gray-700 rounded-full">
            <BellIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 hover:bg-gray-700 rounded-full">
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </header>
      {/* Trading View Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default Header;