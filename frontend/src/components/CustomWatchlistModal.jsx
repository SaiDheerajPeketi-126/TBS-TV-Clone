import React, { useState } from 'react';

// Custom modal component for creating a new watchlist
const CustomWatchlistModal = ({ isOpen, onClose, onConfirm }) => {
  const [watchlistName, setWatchlistName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!watchlistName.trim()) {
      setError('Watchlist name cannot be empty');
      return;
    }
    
    onConfirm(watchlistName);
    setWatchlistName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-80 border border-gray-700">
        <h3 className="text-lg font-medium mb-4">Create New Watchlist</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="watchlist-name" className="block text-sm font-medium mb-1">
              Watchlist Name
            </label>
            <input
              type="text"
              id="watchlist-name"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={watchlistName}
              onChange={(e) => setWatchlistName(e.target.value)}
              placeholder="Enter watchlist name"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomWatchlistModal;