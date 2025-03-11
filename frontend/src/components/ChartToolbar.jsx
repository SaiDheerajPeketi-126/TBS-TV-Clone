import React, { useState, useRef, useEffect } from 'react';
import { LineIcon, CandlestickIcon, IndicatorIcon, DrawingIcon, MeasureIcon, TemplateIcon, ShareIcon, ChevronDownIcon } from './Icons';
import IndicatorDropdown from './IndicatorDropdown';
import IndicatorSettings from './IndicatorSettings';

function ChartToolbar({ interval, setInterval, chartStyle, setChartStyle, onAddIndicator, activeIndicators, onUpdateIndicator, onRemoveIndicator  }) {
  const intervals = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showIndicatorDropdown, setShowIndicatorDropdown] = useState(false);
  const indicatorDropdownRef = useRef(null);

  const [showIndicatorSettings, setShowIndicatorSettings] = useState(false);
  const indicatorSettingsRef = useRef(null);

  const chartStyles = [
    { id: 'candles', name: 'Candles', icon: <CandlestickIcon className="h-4 w-4" /> },
    { id: 'hollow_candles', name: 'Hollow Candles', icon: <CandlestickIcon className="h-4 w-4" /> },
    { id: 'heikin_ashi', name: 'Heikin Ashi', icon: <CandlestickIcon className="h-4 w-4" /> },
    { id: 'bar', name: 'Bar', icon: <LineIcon className="h-4 w-4" /> },
    { id: 'line', name: 'Line', icon: <LineIcon className="h-4 w-4" /> },
    { id: 'area', name: 'Area', icon: <LineIcon className="h-4 w-4" /> },
    { id: 'baseline', name: 'Baseline', icon: <LineIcon className="h-4 w-4" /> },
  ];

  // Add this effect to close indicator dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (indicatorDropdownRef.current && !indicatorDropdownRef.current.contains(event.target)) {
        setShowIndicatorDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add this effect to close indicator settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (indicatorSettingsRef.current && !indicatorSettingsRef.current.contains(event.target)) {
        setShowIndicatorSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStyleDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-10 flex items-center justify-between px-2 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center space-x-1">
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center p-1.5 hover:bg-gray-700 rounded"
            onClick={() => setShowStyleDropdown(!showStyleDropdown)}
          >
            {chartStyles.find(style => style.id === chartStyle)?.icon || <CandlestickIcon className="h-4 w-4" />}
            <ChevronDownIcon className="h-3 w-3 ml-1" />
          </button>

          {showStyleDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
              {chartStyles.map((style) => (
                <button
                  key={style.id}
                  className={`flex items-center w-full px-3 py-2 text-left text-xs hover:bg-gray-700 ${chartStyle === style.id ? 'bg-gray-700' : ''}`}
                  onClick={() => {
                    setChartStyle(style.id);
                    setShowStyleDropdown(false);
                  }}
                >
                  <span className="mr-2">{style.icon}</span>
                  {style.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 border-r border-gray-600 mx-1"></div>
        
        <div className="relative" ref={indicatorDropdownRef}>
          <button
            className="p-1.5 hover:bg-gray-700 rounded"
            onClick={() => {
              setShowIndicatorDropdown(!showIndicatorDropdown);
              setShowIndicatorSettings(false);
            }}
          >
            <IndicatorIcon className="h-4 w-4" />
          </button>

          <IndicatorDropdown
            isOpen={showIndicatorDropdown}
            onClose={() => setShowIndicatorDropdown(false)}
            onSelectIndicator={(indicatorId) => {
              onAddIndicator(indicatorId);
              setShowIndicatorDropdown(false);
            }}
          />
        </div>
        
        {/* Add indicator settings button */}
        <div className="relative" ref={indicatorSettingsRef}>
          <button
            className={`p-1.5 rounded flex items-center ${activeIndicators.length > 0 ? 'text-blue-400 hover:bg-gray-700' : 'text-gray-500 cursor-not-allowed'}`}
            onClick={() => {
              if (activeIndicators.length > 0) {
                setShowIndicatorSettings(!showIndicatorSettings);
                setShowIndicatorDropdown(false);
              }
            }}
            disabled={activeIndicators.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {activeIndicators.length > 0 && (
              <span className="ml-1 text-xs">{activeIndicators.length}</span>
            )}
          </button>
          
          {showIndicatorSettings && (
            <IndicatorSettings 
              indicators={activeIndicators}
              onUpdateIndicator={onUpdateIndicator}
              onRemoveIndicator={onRemoveIndicator}
            />
          )}
        </div>
        
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <DrawingIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <MeasureIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1">
        {intervals.map((int) => (
          <button
            key={int}
            className={`px-2 py-0.5 text-xs rounded ${interval === int ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setInterval(int)}
          >
            {int}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-1">
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <TemplateIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-700 rounded">
          <ShareIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default ChartToolbar;