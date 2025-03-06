import React, { useState } from "react";

const sampleTrades = [
  {
    id: 1,
    image: "https://source.unsplash.com/400x300/?stock-market",
    buyDate: "2025-03-01",
    result: "Profit",
    sellDate: "2025-03-02",
    buyPrice: 19500,
    sellPrice: 19800,
    stopLoss: 19450,
    strategy: "Breakout + RSI Divergence",
    comments: "Executed as per plan, good trade.",
    market: "NSE",
    segment: "Equity",
    scrip: "NIFTY 50",
    timeOfBuy: "10:30 AM",
    timeOfSell: "12:45 PM",
    capitalUsed: 50000,
    percentageChange: "+6%",
    capitalAfterTrade: 53000,
    riskRewardRatio: "1:2",
  },
  // Add a few more sample trades for testing scrolling
  {
    id: 2,
    image: "https://source.unsplash.com/400x300/?trading",
    buyDate: "2025-02-24",
    result: "Loss",
    sellDate: "2025-02-25",
    buyPrice: 64500,
    sellPrice: 63800,
    stopLoss: 63750,
    strategy: "Support Level Bounce",
    comments: "Stopped out, market reversed quickly after.",
    market: "Crypto",
    segment: "Spot",
    scrip: "BTCUSD",
    timeOfBuy: "09:15 AM",
    timeOfSell: "11:30 AM",
    capitalUsed: 75000,
    percentageChange: "-1.1%",
    capitalAfterTrade: 74175,
    riskRewardRatio: "1:1.5",
  },
  {
    id: 3,
    image: "https://source.unsplash.com/400x300/?crypto",
    buyDate: "2025-02-28",
    result: "Profit",
    sellDate: "2025-03-04",
    buyPrice: 65500,
    sellPrice: 66250,
    stopLoss: 65200,
    strategy: "Trendline Break + Volume Confirmation",
    comments: "Held through weekend, longer position than planned but worked out.",
    market: "Crypto",
    segment: "Spot",
    scrip: "BTCUSD",
    timeOfBuy: "14:20 PM",
    timeOfSell: "10:15 AM",
    capitalUsed: 65000,
    percentageChange: "+1.14%",
    capitalAfterTrade: 65741,
    riskRewardRatio: "1:2.5",
  }
];

function JournalPage() {
  const [trades, setTrades] = useState(sampleTrades);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [filterValue, setFilterValue] = useState("");

  const deleteTrade = (id) => {
    setTrades(trades.filter((trade) => trade.id !== id));
    setSelectedTrade(null);
  };

  // Filter trades based on search input
  const filteredTrades = trades.filter(trade => 
    trade.scrip.toLowerCase().includes(filterValue.toLowerCase()) ||
    trade.strategy.toLowerCase().includes(filterValue.toLowerCase()) ||
    trade.result.toLowerCase().includes(filterValue.toLowerCase()) ||
    trade.market.toLowerCase().includes(filterValue.toLowerCase())
  );

  // Render result badges with appropriate colors
  const renderResultBadge = (result) => {
    if (result === "Profit") {
      return <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">{result}</span>;
    } else if (result === "Loss") {
      return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">{result}</span>;
    }
    return <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">{result}</span>;
  };

  return (
    <div className="flex-1 p-6 bg-gray-900 text-gray-100 overflow-y-auto">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Trading Journal</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter trades..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
              {filterValue && (
                <button 
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
                  onClick={() => setFilterValue("")}
                >
                  ×
                </button>
              )}
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              + New Trade
            </button>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">No trades found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTrades.map((trade) => (
              <div 
                key={trade.id} 
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => setSelectedTrade(trade)}
              >
                <div className="relative">
                  <img src={trade.image} alt="Trade" className="w-full h-40 object-cover" />
                  <div className="absolute top-2 right-2">
                    {renderResultBadge(trade.result)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-lg">{trade.scrip}</p>
                    <p className={`font-bold text-lg ${trade.result === "Profit" ? "text-green-400" : "text-red-400"}`}>
                      {trade.percentageChange}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>{trade.buyDate} | {trade.market}</p>
                    <p className="mt-1 truncate">{trade.strategy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Details Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-400">Trade Details</h3>
                  <p className="text-gray-400">{selectedTrade.scrip} | {selectedTrade.market}</p>
                </div>
                <button 
                  onClick={() => setSelectedTrade(null)} 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <img src={selectedTrade.image} alt="Trade" className="w-full h-60 object-cover rounded-lg mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Entry Date</h4>
                  <p className="font-medium">{selectedTrade.buyDate} | {selectedTrade.timeOfBuy}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Exit Date</h4>
                  <p className="font-medium">{selectedTrade.sellDate} | {selectedTrade.timeOfSell}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Entry Price</h4>
                  <p className="font-medium">₹{selectedTrade.buyPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Exit Price</h4>
                  <p className="font-medium">₹{selectedTrade.sellPrice.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Stop Loss</h4>
                  <p className="font-medium">₹{selectedTrade.stopLoss.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Result</h4>
                  <p className={`font-bold ${selectedTrade.result === "Profit" ? "text-green-400" : "text-red-400"}`}>
                    {selectedTrade.percentageChange} ({selectedTrade.result})
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Capital Used</h4>
                  <p className="font-medium">₹{selectedTrade.capitalUsed.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-1">Capital After Trade</h4>
                  <p className="font-medium">₹{selectedTrade.capitalAfterTrade.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg col-span-1 md:col-span-2">
                  <h4 className="text-sm text-gray-400 mb-1">Strategy</h4>
                  <p className="font-medium">{selectedTrade.strategy}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg col-span-1 md:col-span-2">
                  <h4 className="text-sm text-gray-400 mb-1">Comments</h4>
                  <p className="font-medium">{selectedTrade.comments}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">Edit</button>
                <button 
                  onClick={() => deleteTrade(selectedTrade.id)} 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalPage;