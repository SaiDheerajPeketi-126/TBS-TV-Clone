import React, { useState } from "react";

const sampleTrades = [
  {
    id: 1,
    buyDate: "2025-03-01",
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
];

function JournalPage() {
  const [trades, setTrades] = useState(sampleTrades);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const deleteTrade = (id) => {
    setTrades(trades.filter((trade) => trade.id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Trading Journal</h2>

      {/* Filters Section */}
      <div className="mb-4 flex gap-4">
        <input type="date" className="border p-2 rounded" placeholder="Filter by date" />
        <input type="text" className="border p-2 rounded" placeholder="Search by scrip" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Apply Filters</button>
      </div>

      {/* Outer Card */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trades.map((trade) => (
            <div key={trade.id} className="border bg-white p-4 rounded-lg shadow-md">
              <p><strong>Buy Date:</strong> {trade.buyDate}</p>
              <p><strong>Sell Date:</strong> {trade.sellDate}</p>
              <p><strong>Buy Price:</strong> ₹{trade.buyPrice}</p>
              <p><strong>Sell Price:</strong> ₹{trade.sellPrice}</p>
              <p><strong>Stop Loss:</strong> ₹{trade.stopLoss}</p>
              <p><strong>Strategy:</strong> {trade.strategy}</p>
              <p><strong>Market:</strong> {trade.market}</p>
              <p><strong>Segment:</strong> {trade.segment}</p>
              <p><strong>Scrip:</strong> {trade.scrip}</p>
              <p><strong>Time of Buy:</strong> {trade.timeOfBuy}</p>
              <p><strong>Time of Sell:</strong> {trade.timeOfSell}</p>
              <p><strong>Capital Used:</strong> ₹{trade.capitalUsed}</p>
              <p><strong>Gain/Loss %:</strong> {trade.percentageChange}</p>
              <p><strong>Capital After Trade:</strong> ₹{trade.capitalAfterTrade}</p>
              <p><strong>Risk-Reward Ratio:</strong> {trade.riskRewardRatio}</p>
              <p><strong>Comments:</strong> {trade.comments}</p>

              <div className="mt-2 flex gap-2">
                <button onClick={() => setSelectedTrade(trade)} className="bg-green-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => deleteTrade(trade.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Trade Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-2">Edit Trade</h3>
            <input type="text" value={selectedTrade.strategy} className="border p-2 rounded w-full mb-2" />
            <textarea value={selectedTrade.comments} className="border p-2 rounded w-full mb-2" />
            <button onClick={() => setSelectedTrade(null)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            <button onClick={() => setSelectedTrade(null)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded ml-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalPage;
