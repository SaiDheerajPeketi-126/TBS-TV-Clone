import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon, UserIcon, CogIcon } from './Icons';
import { Link } from 'react-router-dom';
import QuickSearch from './QuickSearch';
import Settings from './Settings';

function Header({ setInterval, onSymbolSelect, setCurrentlyActiveExchange  }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <div className="text-blue-500 font-bold text-xl mr-6">TradingClone</div>
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="px-2 py-1 hover:bg-gray-700 rounded">Charts</Link>
            <a href="https://www.screener.in/" className="px-2 py-1 hover:bg-gray-700 rounded">Screener</a>
            <Link to="#" className="px-2 py-1 hover:bg-gray-700 rounded">Market</Link>
            <Link to="#" className="px-2 py-1 hover:bg-gray-700 rounded">Community</Link>
            <Link to="/journal" className="px-2 py-1 hover:bg-gray-700 rounded">Journal</Link>
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
              setCurrentlyActiveExchange={setCurrentlyActiveExchange}
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