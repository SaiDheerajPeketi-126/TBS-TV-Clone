import React, { useContext } from 'react';
import { StarIcon, EyeIcon, HistoryIcon, LayersIcon, GridIcon } from './Icons';
import { WatchlistContext } from './WatchlistContext';

function Sidebar({ onSymbolSelect }) {
  const { 
    removeFromWatchlist, 
    getWatchlistNames, 
    setActiveWatchlist, 
    createWatchlist,
    watchlists, 
    activeWatchlist 
  } = useContext(WatchlistContext);
  
  // Function to handle when a symbol is clicked
  const handleSymbolClick = (symbol) => {
    if (onSymbolSelect) {
      onSymbolSelect(symbol);
    }
  };

  // Function to switch between watchlists
  const switchWatchlist = (listName) => {
    setActiveWatchlist(listName);
  };

  // Function to add a new watchlist
  const addNewWatchlist = () => {
    const newListName = prompt("Enter watchlist name:");
    if (newListName && !watchlists[newListName]) {
      createWatchlist(newListName);
    }
  };
  
  return (
    <div className="w-64 border-r border-gray-700 flex flex-col h-full">
      {/* Watchlist Header with selection */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Watchlist</div>
          <div className="flex space-x-1">
            <button className="p-1 hover:bg-gray-700 rounded" title="Manage lists">
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Watchlist selection tabs */}
        <div className="flex overflow-x-auto text-xs py-1 border-b border-gray-700 mb-2">
          {getWatchlistNames().map((listName) => (
            <button
              key={listName}
              className={`px-3 py-1 rounded-md whitespace-nowrap mr-1 ${
                activeWatchlist === listName ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => switchWatchlist(listName)}
            >
              {listName}
            </button>
          ))}
          <button 
            className="px-3 py-1 rounded-md whitespace-nowrap bg-gray-700 hover:bg-gray-600"
            onClick={addNewWatchlist}
          >
            + New
          </button>
        </div>
      </div>
      
      {/* Scrollable watchlist content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-3">
          {watchlists[activeWatchlist] && watchlists[activeWatchlist].length > 0 ? (
            watchlists[activeWatchlist].map((symbol) => (
              <div 
                key={symbol.name} 
                className="flex items-center justify-between p-2 hover:bg-gray-800 rounded cursor-pointer mb-1"
                onClick={() => handleSymbolClick(symbol.name)}
              >
                <div className="font-medium">{symbol.name}</div>
                <div className="flex items-center">
                  <div className="text-right mr-2">
                    <div>{symbol.price}</div>
                    <div className={symbol.change >= 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                      {symbol.change >= 0 ? "+" : ""}{symbol.change}%
                    </div>
                  </div>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(symbol.name);
                    }}
                  >
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No symbols in {activeWatchlist} watchlist.
              <div className="mt-2 text-sm">Click the star icon in the chart header to add symbols.</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed bottom menu bar */}
      <div className="border-t border-gray-700 p-2 mt-auto bg-gray-900">
        <div className="flex justify-around">
          <button className="p-2 hover:bg-gray-700 rounded-full" title="History">
            <HistoryIcon className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full" title="Layers">
            <LayersIcon className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full" title="Layout">
            <GridIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;