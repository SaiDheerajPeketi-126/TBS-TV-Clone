import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { generateMockData } from '../utils/mockData';
import ChartToolbar from './ChartToolbar';
import ChartHeader from './ChartHeader';

function ChartContainer() {
  const chartContainerRef = useRef(null);
  const [interval, setInterval] = useState('1D');
  
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chartOptions = {
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight - 100, // Adjust for header and toolbar
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(42, 46, 57, 0.5)',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 1,
          labelBackgroundColor: '#758696',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 1,
          labelBackgroundColor: '#758696',
        },
      },
    };
    
    const chart = createChart(chartContainerRef.current, chartOptions);
    
    // Generate mock data
    const candleData = generateMockData(interval);
    
    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    candlestickSeries.setData(candleData);
    
    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    
    // Ensure the volume scale is independent
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.7, // Adjust how much space volume takes
        bottom: 0,
      },
    });
    
    // Create volume data from candleData
    const volumeData = candleData.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
    }));
    
    volumeSeries.setData(volumeData);
    
    // Handle window resize
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight - 100,
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [interval]);
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChartHeader symbol="BTC/USD" price="66,423.50" change={1.24} />
      <ChartToolbar interval={interval} setInterval={setInterval} />
      <div className="flex-1" ref={chartContainerRef}></div>
    </div>
  );
}

export default ChartContainer;