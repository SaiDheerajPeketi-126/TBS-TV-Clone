import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChartContainer from './components/ChartContainer';
import Footer from './components/Footer';
import QuickSearch from './components/QuickSearch';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentInterval, setCurrentInterval] = useState('1D'); // Default timeframe
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD'); // Default symbol

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with animation */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
          } overflow-hidden`}
        >
          <Sidebar />
        </div>
        <ChartContainer 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          currentInterval={currentInterval}
          selectedSymbol={selectedSymbol}
          setCurrentInterval={setCurrentInterval}
        />
      </div>
      <Footer />

      {/* Global Quick Search */}
      <QuickSearch 
        intervals={['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M']} 
        setInterval={setCurrentInterval} 
        currentInterval={currentInterval}
        onSymbolSelect={setSelectedSymbol} 
      />
    </div>
  );
}

export default App;