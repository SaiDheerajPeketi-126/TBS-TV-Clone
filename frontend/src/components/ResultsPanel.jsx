import React from 'react';

const ResultsPanel = ({ results }) => {
  if (!results) return null;
  
  const { 
    totalTrades, 
    winningTrades, 
    losingTrades, 
    winRate, 
    profitFactor,
    netProfit,
    maxDrawdown,
    sharpeRatio,
    startingBalance,
    endingBalance,
    trades
  } = results;
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 text-white">
      <h2 className="text-xl font-semibold mb-4">Backtest Results</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-gray-400 text-sm">Net Profit</div>
          <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${netProfit.toFixed(2)} ({((endingBalance / startingBalance - 1) * 100).toFixed(2)}%)
          </div>
        </div>
        
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-gray-400 text-sm">Win Rate</div>
          <div className="text-xl font-bold">
            {winRate.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-gray-400 text-sm">Profit Factor</div>
          <div className="text-xl font-bold">
            {profitFactor.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-gray-400 text-sm">Max Drawdown</div>
          <div className="text-xl font-bold text-red-500">
            {maxDrawdown.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-gray-400 text-sm">Sharpe Ratio</div>
          <div className="text-xl font-bold">
            {sharpeRatio.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-slate-700 p-3 rounded">
          <div className="text-gray-400 text-sm">Total Trades</div>
          <div className="text-xl font-bold">
            {totalTrades} ({winningTrades} wins, {losingTrades} losses)
          </div>
        </div>
      </div>
      
      <h3 className="font-medium mb-2">Equity Curve</h3>
      <div className="bg-slate-700 h-40 rounded mb-4">
        {/* We could implement a simple equity curve chart here with a library like recharts */}
        <div className="h-full flex items-center justify-center text-gray-400">
          Equity curve visualization would go here
        </div>
      </div>
      
      <h3 className="font-medium mb-2">Recent Trades</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-700 rounded">
          <thead>
            <tr className="text-left border-b border-slate-600">
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Price</th>
              <th className="p-2">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(-5).map((trade, index) => (
              <tr key={index} className="border-b border-slate-600">
                <td className="p-2">{new Date(trade.exitTime || trade.time).toLocaleDateString()}</td>
                <td className="p-2">
                  <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-2">${trade.price.toFixed(2)}</td>
                <td className={`p-2 ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trade.profit ? `$${trade.profit.toFixed(2)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsPanel;