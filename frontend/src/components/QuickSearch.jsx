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

  // For timeframe grid navigation
  const COLUMNS_PER_ROW = 4;
  
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
    if (searchResults.length === 0) return;
    
    if (searchType === 'timeframe') {
      // Grid navigation for timeframes
      const totalRows = Math.ceil(searchResults.length / COLUMNS_PER_ROW);
      const currentRow = Math.floor(selectedIndex / COLUMNS_PER_ROW);
      const currentCol = selectedIndex % COLUMNS_PER_ROW;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Move to the next row, same column
        const nextRowIndex = (currentRow + 1) % totalRows;
        const nextIndex = nextRowIndex * COLUMNS_PER_ROW + currentCol;
        
        // Stay within bounds
        if (nextIndex < searchResults.length) {
          setSelectedIndex(nextIndex);
        } else {
          // If we would go out of bounds, wrap to the first row
          setSelectedIndex(currentCol);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // Move to the previous row, same column
        const prevRowIndex = (currentRow - 1 + totalRows) % totalRows;
        const prevIndex = prevRowIndex * COLUMNS_PER_ROW + currentCol;
        
        // Stay within bounds
        if (prevIndex < searchResults.length) {
          setSelectedIndex(prevIndex);
        } else {
          // If we would go out of bounds, stay in the same position
          setSelectedIndex(selectedIndex);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Move to the next column, same row
        const nextColIndex = (currentCol + 1) % COLUMNS_PER_ROW;
        const nextIndex = currentRow * COLUMNS_PER_ROW + nextColIndex;
        
        // Stay within bounds
        if (nextIndex < searchResults.length) {
          setSelectedIndex(nextIndex);
        } else {
          // If we would go out of bounds, wrap to the next row
          const nextRowIndex = (currentRow + 1) % totalRows;
          setSelectedIndex(nextRowIndex * COLUMNS_PER_ROW);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Move to the previous column, same row
        const prevColIndex = (currentCol - 1 + COLUMNS_PER_ROW) % COLUMNS_PER_ROW;
        const prevIndex = currentRow * COLUMNS_PER_ROW + prevColIndex;
        
        // Stay within bounds
        if (prevIndex < searchResults.length && currentCol > 0) {
          setSelectedIndex(prevIndex);
        } else if (currentCol === 0) {
          // If we're at the leftmost column, wrap to the previous row
          const prevRowIndex = (currentRow - 1 + totalRows) % totalRows;
          const lastColInPrevRow = Math.min(COLUMNS_PER_ROW - 1, searchResults.length - prevRowIndex * COLUMNS_PER_ROW - 1);
          setSelectedIndex(prevRowIndex * COLUMNS_PER_ROW + lastColInPrevRow);
        }
      }
    } else {
      // Standard list navigation for symbols
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      }
    }
    
    // Enter key works the same for both
    if (e.key === 'Enter' && searchResults.length > 0) {
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
      {/* Search input that looks like the one in the commented out code */}
      <div className="relative">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Symbol Search or Alt+G" 
          className="bg-gray-700 text-sm rounded px-3 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          onClick={() => setIsOpen(true)}
          value={isOpen ? searchText : ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute right-3 top-2 h-4 w-4 text-gray-400">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
      </div>
      
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
                          ref={index === selectedIndex ? selectedItemRef : null}
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
              {searchType === 'timeframe' ? (
                <div>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">←</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">→</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">↓</kbd>
                  to navigate
                </div>
              ) : (
                <div>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded mr-1">↓</kbd>
                  to navigate
                </div>
              )}
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