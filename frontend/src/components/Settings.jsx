import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon, UserIcon, CogIcon, CloseIcon } from './Icons';
import QuickSearch from './QuickSearch';

function Settings({ isOpen, onClose }) {
    // State for different trading view settings
    const [theme, setTheme] = useState('dark');
    const [chartType, setChartType] = useState('candlestick');
    const [gridLines, setGridLines] = useState(true);
    const [volumeIndicator, setVolumeIndicator] = useState(true);
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg w-96 p-6 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 hover:bg-gray-700 rounded-full p-1"
          >
            <CloseIcon className="h-5 w-5 text-white" />
          </button>
          
          <h2 className="text-xl font-bold mb-4 text-white">Trading View Settings</h2>
          
          <div className="space-y-4">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme
              </label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-gray-700 text-white rounded p-2"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chart Type
              </label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                className="w-full bg-gray-700 text-white rounded p-2"
              >
                <option value="candlestick">Candlestick</option>
                <option value="line">Line</option>
                <option value="bar">Bar</option>
              </select>
            </div>
            
            {/* Grid Lines Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Show Grid Lines
              </label>
              <input 
                type="checkbox" 
                checked={gridLines}
                onChange={() => setGridLines(!gridLines)}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600"
              />
            </div>
            
            {/* Volume Indicator Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Show Volume Indicator
              </label>
              <input 
                type="checkbox" 
                checked={volumeIndicator}
                onChange={() => setVolumeIndicator(!volumeIndicator)}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

export default Settings;