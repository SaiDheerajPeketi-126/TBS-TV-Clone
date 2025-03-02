import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChartContainer from './components/ChartContainer';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChartContainer />
      </div>
      <Footer />
    </div>
  );
}

export default App;