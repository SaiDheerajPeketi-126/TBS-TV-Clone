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
        <input 
          type="color" 
          value={value}
          onChange={(e) => handleParamChange(indicator.id, paramName, e.target.value)}
          className="w-6 h-6 p-0 border-0"
        />
      );
    }
    
    if (paramType === 'number') {
      return (
        <input 
          type="number" 
          value={value}
          min={paramName.includes('Period') ? 1 : 0}
          max={paramName.includes('Period') ? 200 : undefined}
          step={paramName.includes('Dev') ? 0.1 : 1}
          onChange={(e) => handleParamChange(indicator.id, paramName, e.target.value)}
          className="w-16 bg-gray-700 text-white text-xs p-1 rounded"
        />
      );
    }
    
    return (
      <input 
        type="text" 
        value={value}
        onChange={(e) => handleParamChange(indicator.id, paramName, e.target.value)}
        className="w-20 bg-gray-700 text-white text-xs p-1 rounded"
      />
    );
  };

  // Format parameter name for display
  const formatParamName = (name) => {
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  return (
    <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
      <div className="max-h-80 overflow-y-auto p-2">
        {indicators.length === 0 ? (
          <div className="text-gray-400 text-xs p-2">No indicators added</div>
        ) : (
          indicators.map(indicator => (
            <div key={indicator.id} className="mb-2 border border-gray-700 rounded">
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-700"
                onClick={() => setExpandedIndicator(expandedIndicator === indicator.id ? null : indicator.id)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: indicator.params.color || '#4682B4' }}
                  ></div>
                  <span className="text-xs font-medium">{indicator.name}</span>
                </div>
                <div className="flex items-center">
                  <button 
                    className="text-gray-400 hover:text-red-500 text-xs p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveIndicator(indicator.id);
                    }}
                  >
                    ×
                  </button>
                  <svg 
                    className={`w-3 h-3 transition-transform ${expandedIndicator === indicator.id ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedIndicator === indicator.id && (
                <div className="p-2 border-t border-gray-700 bg-gray-750">
                  {Object.keys(indicator.params).map(paramName => (
                    <div key={paramName} className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-400">{formatParamName(paramName)}</label>
                      <ParameterInput indicator={indicator} paramName={paramName} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default IndicatorSettings;