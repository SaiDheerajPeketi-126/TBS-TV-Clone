export function generateMockData(interval = '1D', numPeriods = 10000) { // Increased default numPeriods
  const data = [];
  const periods = {
    '1m': 60 * 24 * 30,   // 30 days of 1-minute data
    '5m': (60 * 24 * 30) / 5,
    '15m': (60 * 24 * 30) / 15,
    '30m': (60 * 24 * 30) / 30,
    '1H': 24 * 30,
    '4H': (24 * 30) / 4,
    '1D': 365 * 2,  // 2 years of daily data
    '1W': 52 * 5,   // 5 years of weekly data
    '1M': 12 * 10   // 10 years of monthly data
  };

  numPeriods = periods[interval] || numPeriods;  // Use the predefined period count or the provided value
  const now = Date.now() / 1000;  // Convert to seconds (Unix timestamp)
  let basePrice = 66500;
  let volatility = 0.02;  // 2% volatility

  const intervalSeconds = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1H': 3600,
    '4H': 14400,
    '1D': 86400,
    '1W': 604800,
    '1M': 2592000,  // Approximate month length
  };

  const timeStep = intervalSeconds[interval] || 86400; // Default to 1 day
  let currentTime = now - numPeriods * timeStep; // Start from the past

  for (let i = 0; i < numPeriods; i++) {
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    basePrice *= randomFactor;

    const open = basePrice;
    const high = open * (1 + Math.random() * volatility);
    const low = open * (1 - Math.random() * volatility);
    const close = (open + high + low) / 3 + (Math.random() - 0.5) * volatility * open;
    const volume = Math.round(500000 + Math.random() * 2000000);

    data.push({
      time: Math.floor(currentTime), // Use integer timestamp
      open,
      high,
      low,
      close,
      volume
    });

    currentTime += timeStep; // Move to the next time step
  }

  return data;
}
