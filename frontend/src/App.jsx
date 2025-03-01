import { useState, useEffect } from 'react';
import Chart from './components/Chart';
import StrategyBuilder from './components/StrategyBuilder';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1d');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  
  // Fetch historical data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/data`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setMarketData(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run backtest
  const runBacktest = async (strategyName, parameters) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol,
          timeframe,
          startDate,
          endDate,
          strategy: strategyName,
          parameters
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to run backtest');
      }
      
      const results = await response.json();
      setBacktestResults(results);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TradingView Clone</h1>
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              className="bg-slate-700 p-2 rounded"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol"
            />
            <select 
              className="bg-slate-700 p-2 rounded"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="1d">Daily</option>
              <option value="1h">Hourly</option>
              <option value="1w">Weekly</option>
            </select>
            <input 
              type="date" 
              className="bg-slate-700 p-2 rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
              type="date" 
              className="bg-slate-700 p-2 rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button 
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
              onClick={fetchData}
            >
              Fetch Data
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        {isLoading && (
          <div className="flex justify-center items-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-800 p-4 rounded my-4">
            Error: {error}
          </div>
        )}
        
        {marketData && (
          <div className="bg-slate-800 p-4 rounded-lg mb-4">
            <Chart 
              data={marketData.candles} 
              trades={backtestResults?.trades}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StrategyBuilder onRunBacktest={runBacktest} />
          {backtestResults && <ResultsPanel results={backtestResults} />}
        </div>
      </main>
    </div>
  );
}

export default App;