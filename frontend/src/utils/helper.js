export const convertIntervalToMinutes = (interval) => {
    const unit = interval.slice(-1); // Get the last character (m, H, D, W, M)
    const value = parseInt(interval.slice(0, -1), 10); // Extract the numeric part
  
    switch (unit) {
      case 'm': return value; // Minutes as is
      case 'H': return value * 60; // Hours to minutes
      case 'D': return value * 1440; // Days to minutes (24 * 60)
      case 'W': return value * 10080; // Weeks to minutes (7 * 24 * 60)
      case 'M': return value * 43200; // Months to minutes (30 * 24 * 60) - Approximation
      default: return null; // Handle unexpected cases
    }
  };