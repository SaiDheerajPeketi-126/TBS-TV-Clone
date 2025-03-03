import React, { useEffect, useRef, useState } from 'react';
import { createChart, PriceScaleMode, CrosshairMode } from 'lightweight-charts';
import { generateMockData } from '../utils/mockData';
import ChartToolbar from './ChartToolbar';
import ChartHeader from './ChartHeader';

function ChartContainer({ isSidebarOpen, toggleSidebar }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [interval, setInterval] = useState('1D');
  const [chartStyle, setChartStyle] = useState('candles');
  const [chartData, setChartData] = useState(null);
  const [highlightedCandle, setHighlightedCandle] = useState({
    open: "N/A",
    high: "N/A",
    low: "N/A",
    close: "N/A",
    change: "N/A",
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Function to update volume scale dynamically
  const updateVolumeScale = (data) => {
    if (!chartRef.current || !volumeSeriesRef.current) return;

    // Find the max volume to determine scale
    const maxVolume = Math.max(...data.map(d => d.volume));

    // Adjust scale dynamically based on max volume
    const topMargin = Math.max(0.7 - maxVolume / 10000000, 0.4); // Adjust range as needed

    chartRef.current.priceScale('volume').applyOptions({
      scaleMargins: {
        top: topMargin,
        bottom: 0,
      },
    });
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear the seriesRef when recreating the chart
    seriesRef.current = null;
    volumeSeriesRef.current = null;

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
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(42, 46, 57, 0.5)',
      },
      priceScale: {
        mode: PriceScaleMode.Normal, // Keeps price movement free
        autoScale: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal, // Disable snapping to price
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
        top: 0.91,
        bottom: 0,
      },
    });

    // Apply dynamic scaling
    updateVolumeScale(data);

    // Update OHLC data on crosshair move and update ChartHeader
    chartRef.current.subscribeCrosshairMove(param => {
      if (!param || !param.seriesData) return;

      const candleData = param.seriesData.get(seriesRef.current);
      if (!candleData) return;

      const { open, high, low, close } = candleData;
      const percentageChange = ((close - open) / open) * 100;
      const formattedChange = `${percentageChange.toFixed(2)}`;

      setHighlightedCandle({
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        change: formattedChange,
      });
    });

    const handleResize = () => {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });

      updateVolumeScale(chartData); // Update volume scale on resize
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chartRef.current.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [interval, isFullscreen]);

  // Update volume scale when chart data changes
  useEffect(() => {
    if (chartData) updateVolumeScale(chartData);
  }, [chartData]);

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
        top: 0.05,
        bottom: 0.15,
      },
    });

  }, [chartStyle, chartData]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (chartContainerRef.current.requestFullscreen) {
        chartContainerRef.current.requestFullscreen();
      } else if (chartContainerRef.current.webkitRequestFullscreen) {
        chartContainerRef.current.webkitRequestFullscreen();
      } else if (chartContainerRef.current.msRequestFullscreen) {
        chartContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events (e.g., when user presses Esc to exit)
  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);
    };
  }, []);

  // Update chart size when sidebar toggle state changes
  useEffect(() => {
    if (chartRef.current && chartContainerRef.current) {
      // Schedule the resize after the DOM has been updated
      setTimeout(() => {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
        updateVolumeScale(chartData);
      }, 0);
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChartHeader 
        symbol="BTC/USD" 
        price={`O: ${highlightedCandle.open} H: ${highlightedCandle.high} L: ${highlightedCandle.low} C: ${highlightedCandle.close}`} 
        change={highlightedCandle.change} 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
      <ChartToolbar 
        interval={interval} 
        setInterval={setInterval} 
        chartStyle={chartStyle} 
        setChartStyle={setChartStyle} 
      />
      <div className="flex-1 relative" ref={chartContainerRef}>
        {!isFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded opacity-50 hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M5.25 2A3.25 3.25 0 002 5.25v9.5A3.25 3.25 0 005.25 18h9.5A3.25 3.25 0 0018 14.75v-9.5A3.25 3.25 0 0014.75 2h-9.5zm.22 13.72h2.03a.75.75 0 000-1.5H5.5a.75.75 0 00-.75.75v2c0 .414.336.75.75.75a.75.75 0 00.75-.75v-1.25zm9.03-8.72H12.5a.75.75 0 010-1.5h2a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0V7z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default ChartContainer;