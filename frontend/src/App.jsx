import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChartContainer from './components/ChartContainer';
import Footer from './components/Footer';
import { WatchlistProvider } from './components/WatchlistContext';
import JournalPage from './components/JournalPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentInterval, setCurrentInterval] = useState('1D'); // Default timeframe
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD'); // Default symbol

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
  };

  return (
    <WatchlistProvider>
      <Router>
        <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">
          <Header
            setInterval={setCurrentInterval}
            onSymbolSelect={handleSymbolSelect}
          />
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar with animation */}
            <div
              className={`transition-all duration-50 ease-in-out ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
                } overflow-hidden`}
            >
              <Sidebar onSymbolSelect={handleSymbolSelect} />
            </div>
            <Routes>
              <Route path="/" element={<ChartContainer isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} currentInterval={currentInterval} selectedSymbol={selectedSymbol} setCurrentInterval={setCurrentInterval} />} />
              <Route path="/journal" element={<JournalPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </WatchlistProvider>
  );
}

export default App;