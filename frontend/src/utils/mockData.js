export function generateMockData(interval = '1D') {
    // Mock data for candles
    const today = new Date();
    const numCandles = {
      '1m': 500,
      '5m': 500,
      '15m': 400,
      '30m': 300,
      '1H': 200,
      '4H': 150,
      '1D': 100,
      '1W': 52,
      '1M': 24
    };
    
    const timeIncrement = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1H': 3600,
      '4H': 14400,
      '1D': 86400,
      '1W': 604800,
      '1M': 2592000
    };
    
    const count = numCandles[interval] || 100;
    const increment = timeIncrement[interval] || 86400;
    
    // Start X days ago
    let time = Math.floor(today.getTime() / 1000) - (count * increment);
    
    // Generate candles
    const candles = [];
    let price = 66000; // Starting price for BTC
    
    for (let i = 0; i < count; i++) {
      // Add some randomness to the price
      const changePercent = (Math.random() * 2 - 1) * 2; // -2% to +2%
      const priceChange = price * (changePercent / 100);
      
      // Calculate open, high, low, close
      const open = price;
      const close = price + priceChange;
      const high = Math.max(open, close) + (Math.random() * Math.abs(priceChange));
      const low = Math.min(open, close) - (Math.random() * Math.abs(priceChange));
      
      // Calculate volume based on price change
      const baseVolume = 1000 + Math.random() * 5000;
      const volume = baseVolume * (1 + Math.abs(changePercent) / 2);
      
      candles.push({
        time: time + (i * increment),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.round(volume)
      });
      
      // Use close as the next open
      price = close;
    }
    
    return candles;
  }