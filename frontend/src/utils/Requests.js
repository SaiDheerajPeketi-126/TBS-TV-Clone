import { API_CONFIG } from '../constants';  
  
// Fetch symbol data from API - modified to accept setIsLoading parameter
export const fetchSymbols = async (query, setIsLoading) => {
  setIsLoading(true);
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.SEARCH_ENDPOINT}?path=${API_CONFIG.STOCK_DATA_PATH}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }      
    const data = await response.json();
    console.log(data)
    return data['NSE'];
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return [];
  } finally {
    setIsLoading(false);
  }
};