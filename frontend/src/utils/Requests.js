import { API_CONFIG } from '../constants';  
  
// Fetch list of symbols data from API 
export const fetchSymbols = async (query, setIsLoading) => {
  setIsLoading(true);
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.SEARCH_ENDPOINT}?path=${API_CONFIG.STOCK_DATA_PATH}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }      
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return [];
  } finally {
    setIsLoading(false);
  }
};

// Fetch stock data from API
export const fetchChartData = async (stockExchange, symbol, timeframe, path) => {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/data?stock_exchange=${stockExchange}&stock_symbol=${symbol}&path=${path}&stock_time_frame=${timeframe}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      
      const data = await response.json();
      console.log(data)
      
      // Transform the API response to match the format expected by the chart
      return data.candles.map(candle => ({
        time: new Date(candle.time).getTime() / 1000, // Convert ISO timestamp to Unix seconds
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  };