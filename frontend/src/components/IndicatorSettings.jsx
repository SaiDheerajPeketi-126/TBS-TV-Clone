import React, { useState } from 'react';

function IndicatorSettings({ indicators, onUpdateIndicator, onRemoveIndicator }) {
  const [expandedIndicator, setExpandedIndicator] = useState(null);

  // Handle input change for indicator parameters
  const handleParamChange = (indicatorId, paramName, value) => {
    // Find the indicator
    const indicator = indicators.find(ind => ind.id === indicatorId);
    if (!indicator) return;
    
    // Create updated params
    const updatedParams = { ...indicator.params };
    
    // Convert numeric values
    if (typeof updatedParams[paramName] === 'number') {
      updatedParams[paramName] = Number(value);
    } else {
      updatedParams[paramName] = value;
    }
    
    // Update the indicator
    onUpdateIndicator(indicatorId, updatedParams);
  };

  // Component to render input based on parameter type
  const ParameterInput = ({ indicator, paramName }) => {
    const value = indicator.params[paramName];
    const paramType = typeof value;
    
    if (paramName === 'color') {
      return (
        <div className="relative">
          <input 
            type="color" 
            value={value}
            onChange={(e) => handleParamChange(indicator.id, paramName, e.target.value)}
            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
          />
          <div 
            className="absolute inset-0 rounded pointer-events-none border border-gray-600"
            aria-hidden="true"
          ></div>
        </div>
      );
    }
    
    if (paramType === 'boolean') {
      return (
        <div className="relative inline-block w-10 h-5">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleParamChange(indicator.id, paramName, e.target.checked)}
            className="opacity-0 w-0 h-0"
            id={`${indicator.id}-${paramName}`}
          />
          <label
            htmlFor={`${indicator.id}-${paramName}`}
            className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
              value ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span 
              className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                value ? 'transform translate-x-5' : 'translate-x-0.5'
              }`} 
              style={{ top: '2px' }}
            ></span>
          </label>
        </div>
      );
    }
    
    if (paramType === 'number') {
      return (
        <div className="flex items-center">
          <button
            onClick={() => handleParamChange(
              indicator.id, 
              paramName, 
              Math.max(paramName.includes('Period') ? 1 : 0, value - (paramName.includes('Dev') ? 0.1 : 1))
            )}
            className="w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-l text-xs"
          >
            -
          </button>
          <input 
            type="number" 
            value={value}
            min={paramName.includes('Period') ? 1 : 0}
            max={paramName.includes('Period') ? 200 : undefined}
            step={paramName.includes('Dev') ? 0.1 : 1}
            onChange={(e) => handleParamChange(indicator.id, paramName, e.target.value)}
            className="w-16 bg-gray-700 text-white text-xs p-1 border-x-0 text-center"
          />
          <button
            onClick={() => handleParamChange(
              indicator.id, 
              paramName, 
              value + (paramName.includes('Dev') ? 0.1 : 1)
            )}
            className="w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-r text-xs"
          >
            +
          </button>
        </div>
      );
    }
    
    return (
      <input 
        type="text" 
        value={value}
        onChange={(e) => handleParamChange(indicator.id, paramName, e.target.value)}
        className="w-24 bg-gray-700 text-white text-xs p-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
    );
  };

  // Format parameter name for display
  const formatParamName = (name) => {
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  // Get indicator type description
  const getIndicatorDescription = (type) => {
    const descriptions = {
      ma: 'Simple moving average',
      ema: 'Exponential moving average',
      bb: 'Bollinger bands with standard deviation',
      rsi: 'Relative Strength Index',
      macd: 'Moving Average Convergence Divergence',
      volume: 'Volume analysis'
    };
    return descriptions[type] || '';
  };

  return (
    <div className="absolute top-full left-0 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
      <div className="p-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium">Indicator Settings</span>
        <span className="text-xs text-gray-400">{indicators.length} active</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {indicators.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-gray-400">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm">No indicators added</div>
            <div className="text-xs mt-1">Click + to add technical indicators</div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {indicators.map(indicator => (
              <div 
                key={indicator.id} 
                className="border border-gray-700 rounded-md overflow-hidden transition-all duration-200"
                style={{ boxShadow: expandedIndicator === indicator.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none' }}
              >
                <div 
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    expandedIndicator === indicator.id ? 'bg-gray-700' : 'hover:bg-gray-750'
                  }`}
                  onClick={() => setExpandedIndicator(expandedIndicator === indicator.id ? null : indicator.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: indicator.params.color || '#4682B4' }}
                    ></div>
                    <div>
                      <span className="text-xs font-medium">{indicator.name}</span>
                      <div className="text-xs text-gray-400">{getIndicatorDescription(indicator.id)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      className="text-gray-400 hover:text-red-500 text-xs p-1 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveIndicator(indicator.id);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${expandedIndicator === indicator.id ? 'transform rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {expandedIndicator === indicator.id && (
                  <div className="p-3 border-t border-gray-700 bg-gray-750 space-y-3">
                    {Object.keys(indicator.params).map(paramName => (
                      <div key={paramName} className="flex items-center justify-between">
                        <div className="tooltip-container relative">
                          <label className="text-xs text-gray-300 font-medium">{formatParamName(paramName)}</label>
                          {paramName.includes('Period') && (
                            <div className="tooltip absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                              Number of periods to calculate
                            </div>
                          )}
                        </div>
                        <ParameterInput indicator={indicator} paramName={paramName} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IndicatorSettings;