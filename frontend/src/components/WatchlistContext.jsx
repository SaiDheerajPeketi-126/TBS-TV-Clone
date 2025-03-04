import React, { createContext, useState, useEffect } from 'react';

// Initial watchlist structure with multiple lists
const initialWatchlistData = {
  lists: {
    'Default': [],
    // 'Crypto': [],
    // 'Forex': []
  },
  activeList: 'Default'
};

export const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlistData, setWatchlistData] = useState(() => {
    // Try to get watchlist data from localStorage
    const savedData = localStorage.getItem('watchlistData');
    return savedData ? JSON.parse(savedData) : initialWatchlistData;
  });

  // For backward compatibility
  const [watchlist, setWatchlist] = useState(() => {
    const currentList = watchlistData.lists[watchlistData.activeList] || [];
    return currentList;
  });

  // Save watchlist data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlistData', JSON.stringify(watchlistData));
    // Update the legacy watchlist state for backward compatibility
    setWatchlist(watchlistData.lists[watchlistData.activeList] || []);
  }, [watchlistData]);

  // Set active watchlist
  const setActiveWatchlist = (listName) => {
    if (watchlistData.lists[listName]) {
      setWatchlistData({
        ...watchlistData,
        activeList: listName
      });
    }
  };

  // Create new watchlist
  const createWatchlist = (listName) => {
    if (!watchlistData.lists[listName]) {
      setWatchlistData({
        ...watchlistData,
        lists: {
          ...watchlistData.lists,
          [listName]: []
        }
      });
      return true;
    }
    return false;
  };

  // Delete watchlist
  const deleteWatchlist = (listName) => {
    if (listName === 'Default') return false; // Prevent deleting default list
    
    const newLists = { ...watchlistData.lists };
    delete newLists[listName];
    
    setWatchlistData({
      ...watchlistData,
      lists: newLists,
      activeList: watchlistData.activeList === listName ? 'Default' : watchlistData.activeList
    });
    return true;
  };

  // Add symbol to active watchlist
  const addToWatchlist = (symbol, listName = watchlistData.activeList) => {
    const targetList = watchlistData.lists[listName] || [];
    
    // Check if symbol already exists in the watchlist
    if (!targetList.some(item => item.name === symbol.name)) {
      const updatedList = [...targetList, symbol];
      
      setWatchlistData({
        ...watchlistData,
        lists: {
          ...watchlistData.lists,
          [listName]: updatedList
        }
      });
      return true;
    }
    return false;
  };

  // Remove symbol from watchlist
  const removeFromWatchlist = (symbolName, listName = watchlistData.activeList) => {
    const targetList = watchlistData.lists[listName] || [];
    const updatedList = targetList.filter(item => item.name !== symbolName);
    
    setWatchlistData({
      ...watchlistData,
      lists: {
        ...watchlistData.lists,
        [listName]: updatedList
      }
    });
  };

  // Toggle symbol in watchlist (add if not present, remove if present)
  const toggleInWatchlist = (symbol, listName = watchlistData.activeList) => {
    const targetList = watchlistData.lists[listName] || [];
    const exists = targetList.some(item => item.name === symbol.name);
    
    if (exists) {
      removeFromWatchlist(symbol.name, listName);
    } else {
      addToWatchlist(symbol, listName);
    }
  };

  // Check if symbol is in watchlist
  const isInWatchlist = (symbolName, listName = watchlistData.activeList) => {
    const targetList = watchlistData.lists[listName] || [];
    return targetList.some(item => item.name === symbolName);
  };

  // Get all watchlist names
  const getWatchlistNames = () => {
    return Object.keys(watchlistData.lists);
  };

  // Get current active watchlist
  const getActiveWatchlist = () => {
    return {
      name: watchlistData.activeList,
      symbols: watchlistData.lists[watchlistData.activeList] || []
    };
  };

  return (
    <WatchlistContext.Provider value={{ 
      watchlist, // For backward compatibility
      addToWatchlist, 
      removeFromWatchlist, 
      toggleInWatchlist,
      isInWatchlist,
      createWatchlist,
      deleteWatchlist,
      setActiveWatchlist,
      getWatchlistNames,
      getActiveWatchlist,
      watchlists: watchlistData.lists,
      activeWatchlist: watchlistData.activeList
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};