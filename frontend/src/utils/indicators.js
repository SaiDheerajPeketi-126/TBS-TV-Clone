// Moving Average (MA)
export const calculateMA = (data, period) => {
    if (!data || data.length === 0) return [];
    
    const maData = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // Not enough data points yet
        continue;
      }
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      
      maData.push({
        time: data[i].time,
        value: sum / period
      });
    }
    
    return maData;
  };
  
  // Exponential Moving Average (EMA)
  export const calculateEMA = (data, period) => {
    if (!data || data.length === 0) return [];
    
    const emaData = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate first EMA as SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    let prevEMA = sum / period;
    
    emaData.push({
      time: data[period - 1].time,
      value: prevEMA
    });
    
    // Calculate subsequent EMAs
    for (let i = period; i < data.length; i++) {
      const currentClose = data[i].close;
      const currentEMA = (currentClose - prevEMA) * multiplier + prevEMA;
      prevEMA = currentEMA;
      
      emaData.push({
        time: data[i].time,
        value: currentEMA
      });
    }
    
    return emaData;
  };
  
  // Bollinger Bands
  export const calculateBollingerBands = (data, period, stdDev) => {
    if (!data || data.length === 0) return { upper: [], middle: [], lower: [] };
    
    const middle = calculateMA(data, period);
    const upper = [];
    const lower = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const middleIndex = i - (period - 1);
      if (middleIndex < 0 || middleIndex >= middle.length) continue;
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        const diff = data[i - j].close - middle[middleIndex].value;
        sum += diff * diff;
      }
      
      const stdDevValue = Math.sqrt(sum / period);
      
      upper.push({
        time: data[i].time,
        value: middle[middleIndex].value + (stdDevValue * stdDev)
      });
      
      lower.push({
        time: data[i].time,
        value: middle[middleIndex].value - (stdDevValue * stdDev)
      });
    }
    
    return { upper, middle, lower };
  };
  
  // Relative Strength Index (RSI)
  export const calculateRSI = (data, period) => {
    if (!data || data.length < period + 1) return [];
    
    const rsiData = [];
    let gains = 0;
    let losses = 0;
    
    // Calculate first average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate first RSI
    let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    let rsiValue = 100 - (100 / (1 + rs));
    
    rsiData.push({
      time: data[period].time,
      value: rsiValue
    });
    
    // Calculate subsequent RSIs
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      let currentGain = change >= 0 ? change : 0;
      let currentLoss = change < 0 ? Math.abs(change) : 0;
      
      // Smooth averages
      avgGain = ((avgGain * (period - 1)) + currentGain) / period;
      avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
      
      rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
      rsiValue = 100 - (100 / (1 + rs));
      
      rsiData.push({
        time: data[i].time,
        value: rsiValue
      });
    }
    
    return rsiData;
  };
  
  // Moving Average Convergence Divergence (MACD)
  export const calculateMACD = (data, fastPeriod, slowPeriod, signalPeriod) => {
    if (!data || data.length === 0) return { macd: [], signal: [], histogram: [] };
    
    // Calculate EMAs
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);
    
    // Calculate MACD line (fast EMA - slow EMA)
    const macdLine = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < slowEMA.length; i++) {
      const fastIndex = i + startIndex;
      if (fastIndex < 0 || fastIndex >= fastEMA.length) continue;
      
      macdLine.push({
        time: slowEMA[i].time,
        value: fastEMA[fastIndex].value - slowEMA[i].value
      });
    }
    
    // Calculate signal line (EMA of MACD)
    const macdData = macdLine.map(point => ({
      close: point.value,
      time: point.time
    }));
    
    const signalLine = calculateEMA(macdData, signalPeriod);
    
    // Calculate histogram (MACD - signal)
    const histogram = [];
    
    for (let i = 0; i < signalLine.length; i++) {
      const macdIndex = i + (macdLine.length - signalLine.length);
      if (macdIndex < 0 || macdIndex >= macdLine.length) continue;
      
      histogram.push({
        time: signalLine[i].time,
        value: macdLine[macdIndex].value - signalLine[i].value
      });
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  };
  
  // Volume Profile
  export const calculateVolumeProfile = (data, numOfBars) => {
    if (!data || data.length === 0) return [];
    
    // Find highest and lowest prices in the data
    let highestPrice = -Infinity;
    let lowestPrice = Infinity;
    
    data.forEach(candle => {
      highestPrice = Math.max(highestPrice, candle.high);
      lowestPrice = Math.min(lowestPrice, candle.low);
    });
    
    // Calculate price range and bar size
    const priceRange = highestPrice - lowestPrice;
    const barSize = priceRange / numOfBars;
    
    // Initialize volume profile bars
    const volumeBars = Array(numOfBars).fill(0);
    
    // Count volume in each price level
    data.forEach(candle => {
      // Use the average price of the candle for simplicity
      const avgPrice = (candle.high + candle.low + candle.open + candle.close) / 4;
      const barIndex = Math.min(
        numOfBars - 1,
        Math.floor((avgPrice - lowestPrice) / barSize)
      );
      
      volumeBars[barIndex] += candle.volume;
    });
    
    // Create data for visualization
    const volumeProfile = volumeBars.map((volume, index) => {
      const price = lowestPrice + (index * barSize) + (barSize / 2);
      return { price, volume };
    });
    
    return volumeProfile;
  };
  
  // Default parameters for indicators
  export const getDefaultParams = (indicatorId) => {
    switch (indicatorId) {
      case 'ma':
        return { period: 20, color: '#2196F3' };
      case 'ema':
        return { period: 14, color: '#FF9800' };
      case 'bb':
        return { period: 20, stdDev: 2, color: '#9C27B0' };
      case 'rsi':
        return { period: 14, overbought: 70, oversold: 30, color: '#4CAF50' };
      case 'macd':
        return { 
          fastPeriod: 12, 
          slowPeriod: 26, 
          signalPeriod: 9, 
          fastColor: '#2196F3',
          slowColor: '#F44336',
          signalColor: '#FF9800'
        };
      case 'volume':
        return { numOfBars: 10, color: '#7986CB' };
      default:
        return {};
    }
  };