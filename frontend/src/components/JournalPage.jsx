import React, { useState, useRef, useEffect } from "react";
import TradeDeleteConfirmationDialog from './TradeDeleteConfirmationDialog';

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

// Initial empty trade template
const emptyTradeTemplate = {
  id: null,
  image: "https://source.unsplash.com/400x300/?trading-default",
  buyDate: "",
  result: "",
  sellDate: "",
  buyPrice: "",
  sellPrice: "",
  stopLoss: "",
  strategy: "",
  comments: "",
  market: "",
  segment: "",
  scrip: "",
  timeOfBuy: "",
  timeOfSell: "",
  capitalUsed: "",
  percentageChange: "",
  capitalAfterTrade: "",
  riskRewardRatio: "",
};

function JournalPage() {
  const [trades, setTrades] = useState(sampleTrades);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyTradeTemplate);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Refs for modal content
  const tradeDetailsRef = useRef(null);
  const formRef = useRef(null);

  // Handle clicks outside of modals
  useEffect(() => {
    function handleClickOutside(event) {
      // For trade details modal
      if (selectedTrade && tradeDetailsRef.current && !tradeDetailsRef.current.contains(event.target)) {
        setSelectedTrade(null);
      }

      // For form modal
      if (isFormOpen && formRef.current && !formRef.current.contains(event.target)) {
        setIsFormOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTrade, isFormOpen]);

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData({
          ...formData,
          image: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle paste from clipboard
  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          setFormData({
            ...formData,
            image: e.target.result
          });
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // Add useEffect to set up the paste event listener
  useEffect(() => {
    if (isFormOpen) {
      document.addEventListener('paste', handlePaste);
    }
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isFormOpen]);

  // Delete a trade
  const deleteTrade = (id) => {
    setTrades(trades.filter((trade) => trade.id !== id));
    setSelectedTrade(null);
    setIsDeleteDialogOpen(false);
    setTradeToDelete(null);
  };

  // Open form for creating a new trade
  const openNewTradeForm = () => {
    setFormData(emptyTradeTemplate);
    setIsEditing(false);
    setIsFormOpen(true);
    setSelectedTrade(null);
  };

  // Open form for editing an existing trade
  const openEditForm = (trade) => {
    setFormData({ ...trade });
    setIsEditing(true);
    setIsFormOpen(true);
    setSelectedTrade(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  // Add a function to handle opening the delete dialog
  const openDeleteDialog = (trade) => {
    setTradeToDelete(trade);
    setIsDeleteDialogOpen(true);
  };

  // Calculate percentage change and capital after trade
  const calculateResults = () => {
    if (formData.buyPrice && formData.sellPrice && formData.capitalUsed) {
      const buyPrice = parseFloat(formData.buyPrice);
      const sellPrice = parseFloat(formData.sellPrice);
      const capitalUsed = parseFloat(formData.capitalUsed);

      const percentageChange = ((sellPrice - buyPrice) / buyPrice * 100).toFixed(2);
      const changeAmount = capitalUsed * (percentageChange / 100);
      const capitalAfterTrade = capitalUsed + changeAmount;

      setFormData({
        ...formData,
        percentageChange: percentageChange > 0 ? `+${percentageChange}%` : `${percentageChange}%`,
        result: percentageChange > 0 ? "Profit" : "Loss",
        capitalAfterTrade: capitalAfterTrade.toFixed(0)
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update existing trade
      setTrades(trades.map(trade =>
        trade.id === formData.id ? formData : trade
      ));
    } else {
      // Create new trade with a unique ID
      const newId = Math.max(...trades.map(trade => trade.id), 0) + 1;
      setTrades([...trades, { ...formData, id: newId }]);
    }

    // Close the form
    setIsFormOpen(false);
    setFormData(emptyTradeTemplate);
  };

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        if (isDeleteDialogOpen) {
          setIsDeleteDialogOpen(false);
        } else {
          setSelectedTrade(null);
          setIsFormOpen(false);
        }
      }
    }
  
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDeleteDialogOpen]);

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
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              onClick={openNewTradeForm}
            >
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
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-md z-50">
          <div
            ref={tradeDetailsRef}
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full m-4 flex flex-col"
            style={{
              maxHeight: '90vh',
            }}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-blue-400">Trade Details</h3>
                  <p className="text-gray-400">{selectedTrade.scrip} | {selectedTrade.market}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrade(null);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-4 flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
            </div>

            <div className="p-6 border-t border-gray-700 mt-auto">
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditForm(selectedTrade);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(selectedTrade);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Trade Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-md backdrop-blur-md z-50">
          <div
            ref={formRef}
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-3xl w-full m-4 flex flex-col"
            style={{
              maxHeight: '90vh',
            }}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-blue-400">
                  {isEditing ? "Edit Trade" : "Add New Trade"}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFormOpen(false);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h4 className="text-lg font-medium text-blue-300">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Scrip/Symbol</label>
                        <input
                          type="text"
                          name="scrip"
                          value={formData.scrip}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Market</label>
                        <select
                          name="market"
                          value={formData.market}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Market</option>
                          <option value="NSE">NSE</option>
                          <option value="BSE">BSE</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Forex">Forex</option>
                          <option value="Commodities">Commodities</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Segment</label>
                        <select
                          name="segment"
                          value={formData.segment}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Segment</option>
                          <option value="Equity">Equity</option>
                          <option value="F&O">F&O</option>
                          <option value="Spot">Spot</option>
                          <option value="Futures">Futures</option>
                          <option value="Options">Options</option>
                        </select>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-1">Trade Image</label>
                        <div className="flex flex-col space-y-3">
                          {imagePreview && (
                            <div className="relative">
                              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData({ ...formData, image: "" });
                                }}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                placeholder="Enter image URL"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                              >
                                Upload Image
                              </button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              <button
                                type="button"
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                                onClick={() => alert("Paste image from clipboard anywhere in the form (Ctrl+V or Cmd+V)")}
                              >
                                Paste (Ctrl+V)
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            You can upload an image, paste from clipboard, or enter an image URL
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Entry Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-300">Entry Details</h4>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Entry Date</label>
                      <input
                        type="date"
                        name="buyDate"
                        value={formData.buyDate}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Entry Time</label>
                      <input
                        type="text"
                        name="timeOfBuy"
                        value={formData.timeOfBuy}
                        onChange={handleInputChange}
                        placeholder="e.g. 10:30 AM"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
                      <input
                        type="number"
                        name="buyPrice"
                        value={formData.buyPrice}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Stop Loss</label>
                      <input
                        type="number"
                        name="stopLoss"
                        value={formData.stopLoss}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Exit Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-blue-300">Exit Details</h4>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Exit Date</label>
                      <input
                        type="date"
                        name="sellDate"
                        value={formData.sellDate}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Exit Time</label>
                      <input
                        type="text"
                        name="timeOfSell"
                        value={formData.timeOfSell}
                        onChange={handleInputChange}
                        placeholder="e.g. 02:45 PM"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Exit Price</label>
                      <input
                        type="number"
                        name="sellPrice"
                        value={formData.sellPrice}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Capital Used</label>
                      <input
                        type="number"
                        name="capitalUsed"
                        value={formData.capitalUsed}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Trade Analysis */}
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h4 className="text-lg font-medium text-blue-300">Trade Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Risk/Reward Ratio</label>
                        <input
                          type="text"
                          name="riskRewardRatio"
                          value={formData.riskRewardRatio}
                          onChange={handleInputChange}
                          placeholder="e.g. 1:2"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Strategy</label>
                        <input
                          type="text"
                          name="strategy"
                          value={formData.strategy}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={calculateResults}
                          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Calculate Results
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Comments/Notes</label>
                      <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-700 mt-auto">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFormOpen(false);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  {isEditing ? "Update Trade" : "Add Trade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <TradeDeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteTrade(tradeToDelete?.id)}
        tradeName={tradeToDelete?.scrip}
      />
    </div>
  );
}

export default JournalPage;