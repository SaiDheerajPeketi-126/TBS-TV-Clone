import React, { useState, useContext } from 'react';
import { WatchlistContext } from './WatchlistContext';

const WatchlistManagementModal = ({ isOpen, onClose }) => {
  const { 
    getWatchlistNames, 
    deleteWatchlist, 
    renameWatchlist, 
    activeWatchlist 
  } = useContext(WatchlistContext);

  const [editingWatchlist, setEditingWatchlist] = useState(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRename = (watchlistName) => {
    setEditingWatchlist(watchlistName);
    setNewName(watchlistName);
    setError('');
  };

  const handleDelete = (watchlistName) => {
    if (watchlistName === 'Default') {
      setError('Cannot delete the Default watchlist');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the "${watchlistName}" watchlist?`)) {
      deleteWatchlist(watchlistName);
    }
  };

  const handleSaveRename = () => {
    if (!newName.trim()) {
      setError('Watchlist name cannot be empty');
      return;
    }
    
    const success = renameWatchlist(editingWatchlist, newName);
    if (!success) {
      setError('A watchlist with this name already exists or you tried to rename the Default list');
      return;
    }
    
    setEditingWatchlist(null);
    setNewName('');
    setError('');
  };

  const handleCancelRename = () => {
    setEditingWatchlist(null);
    setNewName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-96 border border-gray-700">
        <h3 className="text-lg font-medium mb-4">Manage Watchlists</h3>
        
        <div className="max-h-60 overflow-y-auto">
          {getWatchlistNames().map((watchlistName) => (
            <div key={watchlistName} className="mb-2 p-2 border border-gray-700 rounded-md">
              {editingWatchlist === watchlistName ? (
                <div>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                      onClick={handleCancelRename}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-sm"
                      onClick={handleSaveRename}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    {watchlistName}
                    {activeWatchlist === watchlistName && (
                      <span className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                      onClick={() => handleRename(watchlistName)}
                      disabled={watchlistName === 'Default'}
                    >
                      Rename
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-md text-sm"
                      onClick={() => handleDelete(watchlistName)}
                      disabled={watchlistName === 'Default'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchlistManagementModal;