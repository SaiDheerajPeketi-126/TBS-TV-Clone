import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChartContainer from './components/ChartContainer';
import Footer from './components/Footer';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;