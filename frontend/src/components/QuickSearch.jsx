import React, { useState, useEffect, useRef } from 'react';

// This component handles both timeframe quick switching and symbol search
function QuickSearch({ 
  intervals, 
  setInterval, 
  currentInterval,
  onSymbolSelect 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchType, setSearchType] = useState(null); // 'timeframe' or 'symbol'
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const selectedItemRef = useRef(null);

  
  // Mock symbols for demo purposes
  const mockSymbols = [
    { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar' },
    { symbol: 'ETHUSD', name: 'Ethereum / US Dollar' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'BNB', name: 'Binance Coin' }
  ];
  
  // Handle keyboard shortcuts to open quick search (Alt+G common in trading platforms)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+G to open search
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 10);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && inputRef.current && !inputRef.current.contains(e.target) && 
          resultsRef.current && !resultsRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Determine search type based on first character
    const isTimeframeSearch = /^\d/.test(value);
    setSearchType(isTimeframeSearch ? 'timeframe' : 'symbol');
    
    if (isTimeframeSearch) {
      // Filter timeframes
      const filteredIntervals = intervals.filter(interval => 
        interval.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredIntervals);
    } else {
      // Filter symbols
      const filteredSymbols = mockSymbols.filter(item => 
        item.symbol.toLowerCase().includes(value.toLowerCase()) || 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredSymbols);
    }
    
    setSelectedIndex(0);
  };
  
  // Handle keydown for navigation and selection
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      handleSelection(searchResults[selectedIndex]);
    }
  };

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);
  
  // Handle selection
  const handleSelection = (item) => {
    if (searchType === 'timeframe') {
      setInterval(item);
    } else {
      onSymbolSelect(item.symbol);
    }
    setIsOpen(false);
    setSearchText('');
  };
  
  return (
    <>
      {/* Button to open quick search */}
      <button 
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 10);
        }}
        className="text-sm px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        <span>Go to...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-gray-800 rounded">Alt+G</kbd>
      </button>
      
      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md z-50 flex items-start justify-center pt-20">
          <div className="bg-gray-800 w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a number for timeframe or text for symbol search..."
                className="w-full px-4 py-3 bg-gray-800 text-white border-b border-gray-700 focus:outline-none"
                autoFocus
              />
            </div>
            
            {searchResults.length > 0 && (
              <div ref={resultsRef} className="max-h-64 overflow-y-auto">
                {searchType === 'timeframe' ? (
                  <div className="p-2">
                    <div className="text-xs text-gray-400 px-2 py-1">Timeframes</div>
                    <div className="grid grid-cols-4 gap-2">
                      {searchResults.map((interval, index) => (
                        <div
                          key={interval}
                          className={`px-3 py-2 rounded cursor-pointer text-center ${
                            selectedIndex === index ? 'bg-blue-600' : 'hover:bg-gray-700'
                          } ${currentInterval === interval ? 'text-blue-400' : 'text-white'}`}
                          onClick={() => handleSelection(interval)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          {interval}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-gray-400 px-4 py-2">Symbols</div>
                    {searchResults.map((item, index) => (
                      <div
                        key={item.symbol}
                        ref={index === selectedIndex ? selectedItemRef : null} // Attach ref to selected item
                        className={`px-4 py-2 cursor-pointer flex justify-between items-center ${
                          selectedIndex === index ? 'bg-blue-600' : 'hover:bg-gray-700'
                        }`}
                        onClick={() => handleSelection(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-sm text-gray-400">{item.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {searchText && searchResults.length === 0 && (
              <div className="p-4 text-gray-400">
                No results found for "{searchText}"
              </div>
            )}
            
            <div className="px-4 py-2 bg-gray-900 text-xs text-gray-400 flex justify-between">
              <div>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">↓</kbd>
                to navigate
              </div>
              <div>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">Enter</kbd>
                to select
              </div>
              <div>
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Esc</kbd>
                to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickSearch;