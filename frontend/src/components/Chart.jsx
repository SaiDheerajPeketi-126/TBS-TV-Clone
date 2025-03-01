import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const Chart = ({ data, trades }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;
    
    // Clear previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartContainerRef.current.innerHTML = '';
    }
    
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        backgroundColor: '#253248',
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: {
          color: 'rgba(42, 46, 57, 0.5)',
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.5)',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    chartRef.current = chart;
    
    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    // Format data for lightweight-charts
    const formattedData = data.map(candle => ({
      time: new Date(candle.time).getTime() / 1000,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    
    candlestickSeries.setData(formattedData);
    
    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    
    const volumeData = data.map(candle => ({
      time: new Date(candle.time).getTime() / 1000,
      value: candle.volume,
      color: candle.close > candle.open ? '#26a69a' : '#ef5350',
    }));
    
    volumeSeries.setData(volumeData);
    
    // Add trades markers if available
    if (trades && trades.length > 0) {
      const markers = trades.map(trade => ({
        time: new Date(trade.time).getTime() / 1000,
        position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
        color: trade.type === 'buy' ? '#26a69a' : '#ef5350',
        shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
        text: `${trade.type.toUpperCase()} $${trade.price.toFixed(2)}`,
      }));
      
      candlestickSeries.setMarkers(markers);
    }
    
    // Handle window resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Fit content to visible range
    chart.timeScale().fitContent();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, trades]);
  
  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default Chart;