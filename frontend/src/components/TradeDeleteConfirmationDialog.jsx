import React from 'react';

const TradeDeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, tradeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-96 border border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-red-500">Delete Trade</h3>
        <p className="text-gray-300 mb-4">Are you sure you want to delete the "{tradeName}" trade? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeDeleteConfirmationDialog;