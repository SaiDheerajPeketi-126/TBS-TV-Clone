import React, { useState } from 'react';

const strategies = [
  {
    name: 'Moving Average Crossover',
    parameters: [
      { name: 'fastPeriod', label: 'Fast MA Period', type: 'number', default: 9 },
      { name: 'slowPeriod', label: 'Slow MA Period', type: 'number', default: 21 },
      { name: 'maType', label: 'MA Type', type: 'select', default: 'sma', options: ['sma', 'ema'] }
    ]
  },
  {
    name: 'RSI Strategy',
    parameters: [
      { name: 'period', label: 'RSI Period', type: 'number', default: 14 },
      { name: 'overbought', label: 'Overbought Level', type: 'number', default: 70 },
      { name: 'oversold', label: 'Oversold Level', type: 'number', default: 30 }
    ]
  },
  {
    name: 'Custom',
    parameters: [
      { name: 'code', label: 'Python Code', type: 'textarea', default: '# Define your strategy logic\n\n# Example:\n# buy_signal = df["sma_9"] > df["sma_21"] and df["sma_9"].shift(1) <= df["sma_21"].shift(1)\n# sell_signal = df["sma_9"] < df["sma_21"] and df["sma_9"].shift(1) >= df["sma_21"].shift(1)\n\n# return buy_signals, sell_signals' }
    ]
  }
];

const StrategyBuilder = ({ onRunBacktest }) => {
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const [parameters, setParameters] = useState(() => {
    // Initialize with default values
    const params = {};
    selectedStrategy.parameters.forEach(param => {
      params[param.name] = param.default;
    });
    return params;
  });
  
  const handleStrategyChange = (e) => {
    const selected = strategies.find(s => s.name === e.target.value);
    setSelectedStrategy(selected);
    
    // Reset parameters to defaults for the new strategy
    const newParams = {};
    selected.parameters.forEach(param => {
      newParams[param.name] = param.default;
    });
    setParameters(newParams);
  };
  
  const handleParameterChange = (name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onRunBacktest(selectedStrategy.name, parameters);
  };
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 text-white">
      <h2 className="text-xl font-semibold mb-4">Strategy Builder</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Strategy Type</label>
          <select 
            className="w-full p-2 bg-slate-700 rounded"
            value={selectedStrategy.name}
            onChange={handleStrategyChange}
          >
            {strategies.map(strategy => (
              <option key={strategy.name} value={strategy.name}>
                {strategy.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Parameters</h3>
          {selectedStrategy.parameters.map(param => (
            <div key={param.name} className="mb-2">
              <label className="block mb-1">{param.label}</label>
              {param.type === 'select' ? (
                <select
                  className="w-full p-2 bg-slate-700 rounded"
                  value={parameters[param.name]}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                >
                  {param.options.map(option => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
              ) : param.type === 'textarea' ? (
                <textarea
                  className="w-full p-2 bg-slate-700 rounded h-48 font-mono"
                  value={parameters[param.name]}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                />
              ) : (
                <input
                  type={param.type}
                  className="w-full p-2 bg-slate-700 rounded"
                  value={parameters[param.name]}
                  onChange={(e) => handleParameterChange(param.name, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Run Backtest
        </button>
      </form>
    </div>
  );
};

export default StrategyBuilder;