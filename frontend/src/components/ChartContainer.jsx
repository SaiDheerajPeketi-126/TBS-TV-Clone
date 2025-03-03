import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { generateMockData } from '../utils/mockData';
import ChartToolbar from './ChartToolbar';
import ChartHeader from './ChartHeader';

function ChartContainer() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [interval, setInterval] = useState('1D');
  const [chartStyle, setChartStyle] = useState('candles');
  const [chartData, setChartData] = useState(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear the seriesRef when recreating the chart
    seriesRef.current = null;

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
      height: chartContainerRef.current.clientHeight - 100,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(42, 46, 57, 0.5)',
      },
    };

    chartRef.current = createChart(chartContainerRef.current, chartOptions);
    
    // Generate and store data
    const data = generateMockData(interval);
    setChartData(data);

    // Add volume series (stays consistent across chart types)
    const volumeSeries = chartRef.current.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    const volumeData = data.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
    }));

    volumeSeries.setData(volumeData);

    // Set price scale for volume
    chartRef.current.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const handleResize = () => {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight - 100,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chartRef.current.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [interval]);

  // Handle chart style changes
  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    // Remove previous series if it exists
    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current);
      } catch (error) {
        console.warn('Failed to remove series:', error);
        // Continue with creating a new series
      }
    }

    // Remove previous series if it exists
    // if (seriesRef.current) {
    //   chartRef.current.removeSeries(seriesRef.current);
    // }

    // Apply different chart styles
    switch (chartStyle) {
      case 'candles':
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        seriesRef.current.setData(chartData);
        break;
        
      case 'hollow_candles':
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: true,
          borderUpColor: '#26a69a',
          borderDownColor: '#ef5350',
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          // For hollow candles, we use a different color for the body
          upColor: 'rgba(38, 166, 154, 0.1)',  // Very transparent green
          downColor: 'rgba(239, 83, 80, 0.1)',  // Very transparent red
        });
        seriesRef.current.setData(chartData);
        break;
        
      case 'heikin_ashi':
        // Convert to Heikin Ashi data
        const haData = [];
        for (let i = 0; i < chartData.length; i++) {
          const current = chartData[i];
          
          if (i === 0) {
            // First candle is the same
            haData.push(current);
            continue;
          }
          
          const previous = haData[i-1];
          // Heikin Ashi calculations
          const haClose = (current.open + current.high + current.low + current.close) / 4;
          const haOpen = (previous.open + previous.close) / 2;
          const haHigh = Math.max(current.high, haOpen, haClose);
          const haLow = Math.min(current.low, haOpen, haClose);
          
          haData.push({
            time: current.time,
            open: haOpen,
            high: haHigh,
            low: haLow,
            close: haClose,
            volume: current.volume
          });
        }
        
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        seriesRef.current.setData(haData);
        break;
        
      case 'bar':
        seriesRef.current = chartRef.current.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          thinBars: false,
        });
        seriesRef.current.setData(chartData);
        break;
        
      case 'line':
        seriesRef.current = chartRef.current.addLineSeries({
          color: '#2196F3',
          lineWidth: 2,
        });
        // Line chart needs different data format
        const lineData = chartData.map(d => ({
          time: d.time,
          value: d.close
        }));
        seriesRef.current.setData(lineData);
        break;
        
      case 'area':
        seriesRef.current = chartRef.current.addAreaSeries({
          topColor: 'rgba(33, 150, 243, 0.56)',
          bottomColor: 'rgba(33, 150, 243, 0.04)', 
          lineColor: 'rgba(33, 150, 243, 1)',
          lineWidth: 2,
        });
        // Area chart needs different data format
        const areaData = chartData.map(d => ({
          time: d.time,
          value: d.close
        }));
        seriesRef.current.setData(areaData);
        break;
        
      case 'baseline':
        seriesRef.current = chartRef.current.addBaselineSeries({
          baseValue: { type: 'price', price: chartData[0].open },
          topLineColor: 'rgba(38, 166, 154, 1)',
          topFillColor1: 'rgba(38, 166, 154, 0.28)',
          topFillColor2: 'rgba(38, 166, 154, 0.05)',
          bottomLineColor: 'rgba(239, 83, 80, 1)',
          bottomFillColor1: 'rgba(239, 83, 80, 0.28)',
          bottomFillColor2: 'rgba(239, 83, 80, 0.05)',
          lineWidth: 2,
        });
        // Baseline chart needs different data format
        const baselineData = chartData.map(d => ({
          time: d.time,
          value: d.close
        }));
        seriesRef.current.setData(baselineData);
        break;
    }

    // Adjust price scale margins
    chartRef.current.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.25,
      },
    });

  }, [chartStyle, chartData]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChartHeader symbol="BTC/USD" price="66,423.50" change={1.24} />
      <ChartToolbar 
        interval={interval} 
        setInterval={setInterval} 
        chartStyle={chartStyle} 
        setChartStyle={setChartStyle} 
      />
      <div className="flex-1" ref={chartContainerRef}></div>
    </div>
  );
}

export default ChartContainer;