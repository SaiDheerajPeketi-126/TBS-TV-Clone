import React, { useEffect, useRef, useState } from 'react';
import { createChart, PriceScaleMode, CrosshairMode } from 'lightweight-charts';
import { fetchChartData } from '../utils/Requests';
import { generateMockData } from '../utils/mockData';
import { convertIntervalToMinutes } from '../utils/helper';
import ChartToolbar from './ChartToolbar';
import ChartHeader from './ChartHeader';
import { API_CONFIG } from '../constants';

function ChartContainer({ isSidebarOpen, toggleSidebar, currentInterval, selectedSymbol, setCurrentInterval }) {
  const chartContainerRef = useRef(null);
  const fullScreenContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // Configure volume series with TradingView-like appearance
  const configureVolumeSeries = (chart, data) => {
    if (!chart || !data || data.length === 0) return null;

    // Remove previous volume series if it exists
    if (volumeSeriesRef.current) {
      try {
        chart.removeSeries(volumeSeriesRef.current);
      } catch (error) {
        console.warn('Failed to remove volume series:', error);
      }
    }

    // Create new volume series with TradingView-like appearance
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
        precision: 0,
        minMove: 1,
      },
      priceScaleId: 'volume',
      scaleMargins: {
        top: 0.8, // Initial position - will be dynamically adjusted
        bottom: 0,
      },
      baseLineVisible: false,
      lastValueVisible: false,
    });

    // Format volume data with appropriate coloring
    const volumeData = data.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    }));

    volumeSeries.setData(volumeData);

    // Configure volume price scale like TradingView
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0.05,
      },
      borderVisible: false,
      entireTextOnly: true,
      drawTicks: false,
      visible: true,
      alignLabels: true,
    });

    return volumeSeries;
  };

  // Configure price scale with TradingView-like appearance
  const configurePriceScale = (chart) => {
    if (!chart) return;

    // Configure right price scale like TradingView
    chart.priceScale('right').applyOptions({
      borderColor: 'rgba(42, 46, 57, 0.5)',
      borderVisible: true,
      entireTextOnly: false,
      mode: PriceScaleMode.Normal,
      autoScale: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.2, // Leave space for volume series
      },
      ticksVisible: false,
      alignLabels: true,
    });
  };

  // Calculate dynamic volume scale based on data
  const calculateVolumeScaleMargins = (data) => {
    if (!data || data.length === 0) return { top: 0.8, bottom: 0.05 };

    // Calculate average volume to set a more appropriate scale
    const averageVolume = data.reduce((sum, item) => sum + item.volume, 0) / data.length;
    const maxVolume = Math.max(...data.map(item => item.volume));

    // Use ratio between max and average to determine how much space to allocate
    const ratio = maxVolume / averageVolume;

    // Adaptive calculation based on volume characteristics
    // Higher ratio means more volatility in volume, which needs more space
    const volumeHeight = Math.min(0.25, 0.15 + (ratio > 3 ? 0.1 : 0));

    return {
      top: 1 - volumeHeight,
      bottom: 0.05
    };
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || !selectedSymbol) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    seriesRef.current = null;
    volumeSeriesRef.current = null;

    // Create chart with TradingView-like appearance
    const chartOptions = {
      layout: {
        background: { type: 'solid', color: '#131722' },
        textColor: '#d1d4dc',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.2)', style: 0 },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)', style: 0 },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(42, 46, 57, 0.5)',
        rightOffset: 12,
        barSpacing: 6,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(224, 227, 235, 0.65)',
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: 'rgba(224, 227, 235, 0.65)',
          width: 1,
          style: 3,
          visible: true,
          labelVisible: true,
        },
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
    };

    chartRef.current = createChart(chartContainerRef.current, chartOptions);

    // Configure price scale
    configurePriceScale(chartRef.current);

    // Define an async function to load data
    const loadChartData = async () => {
      setIsLoading(true);
      let data;

      try {
        // Try to fetch data from API
        data = await fetchChartData(
          'NSE',
          '',
          convertIntervalToMinutes(currentInterval),
          API_CONFIG.STOCK_DATA_PATH
        );

        // If no data returned, fall back to mock data
        if (!data || data.length === 0) {
          console.log('No data returned from API, using mock data');
          data = generateMockData(currentInterval);
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Fall back to mock data on error
        data = generateMockData(currentInterval);
      }

      setChartData(data);
      setIsLoading(false);

      // Configure volume series with TradingView-like appearance
      volumeSeriesRef.current = configureVolumeSeries(chartRef.current, data);

      // Apply specific volume scale margins based on data characteristics
      const volumeMargins = calculateVolumeScaleMargins(data);
      chartRef.current.priceScale('volume').applyOptions({
        scaleMargins: volumeMargins,
      });

      // Apply the appropriate chart style
      applyChartStyle(chartStyle, data);

      // Set chart's visible range to show most recent data with some history
      chartRef.current.timeScale().fitContent();
    };

    // Call the async function
    loadChartData();

    // Update OHLC data on crosshair move
    chartRef.current.subscribeCrosshairMove(param => {
      if (!param || !param.seriesData || !seriesRef.current) return;

      // Get data from the current series
      const candleData = param.seriesData.get(seriesRef.current);
      if (!candleData) return;

      // Process data based on chart style
      let open, high, low, close;

      if (chartStyle === 'line' || chartStyle === 'area' || chartStyle === 'baseline') {
        // For line-based charts, only the close value is available
        close = candleData.value;
        // Find the corresponding candle in the original data for the remaining values
        if (chartData && chartData.length > 0) {
          const timeStr = param.time && param.time.toString();
          const originalCandle = chartData.find(candle => candle.time.toString() === timeStr);
          if (originalCandle) {
            open = originalCandle.open;
            high = originalCandle.high;
            low = originalCandle.low;
          } else {
            open = close;
            high = close;
            low = close;
          }
        } else {
          open = close;
          high = close;
          low = close;
        }
      } else {
        // For candle-based charts, all values are available
        open = candleData.open;
        high = candleData.high;
        low = candleData.low;
        close = candleData.close;
      }

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
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });

        // Recalculate volume scale on resize
        if (chartData) {
          const volumeMargins = calculateVolumeScaleMargins(chartData);
          chartRef.current.priceScale('volume').applyOptions({
            scaleMargins: volumeMargins,
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [currentInterval, selectedSymbol, isFullscreen]);

  // Helper function to apply chart style
  const applyChartStyle = (style, data) => {
    if (!chartRef.current || !data) return;

    // Remove previous series if it exists
    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current);
      } catch (error) {
        console.warn('Failed to remove series:', error);
      }
    }

    // Apply different chart styles with TradingView-like appearance
    switch (style) {
      case 'candles':
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2, // Dotted line for price
        });
        seriesRef.current.setData(data);
        break;

      case 'hollow_candles':
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: 'rgba(38, 166, 154, 0.1)',  // Transparent green
          downColor: 'rgba(239, 83, 80, 0.1)',  // Transparent red
          borderVisible: true,
          borderUpColor: '#26a69a',
          borderDownColor: '#ef5350',
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2,
        });
        seriesRef.current.setData(data);
        break;

      case 'heikin_ashi':
        // Convert to Heikin Ashi data
        const haData = [];
        for (let i = 0; i < data.length; i++) {
          const current = data[i];

          if (i === 0) {
            // First candle is the same
            haData.push(current);
            continue;
          }

          const previous = haData[i - 1];
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
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2,
        });
        seriesRef.current.setData(haData);
        break;

      case 'bar':
        seriesRef.current = chartRef.current.addBarSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          thinBars: true,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2,
        });
        seriesRef.current.setData(data);
        break;

      case 'line':
        seriesRef.current = chartRef.current.addLineSeries({
          color: '#2196F3',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        // Line chart needs different data format
        const lineData = data.map(d => ({
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
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        // Area chart needs different data format
        const areaData = data.map(d => ({
          time: d.time,
          value: d.close
        }));
        seriesRef.current.setData(areaData);
        break;

      case 'baseline':
        seriesRef.current = chartRef.current.addBaselineSeries({
          baseValue: { type: 'price', price: data[0].open },
          topLineColor: 'rgba(38, 166, 154, 1)',
          topFillColor1: 'rgba(38, 166, 154, 0.28)',
          topFillColor2: 'rgba(38, 166, 154, 0.05)',
          bottomLineColor: 'rgba(239, 83, 80, 1)',
          bottomFillColor1: 'rgba(239, 83, 80, 0.28)',
          bottomFillColor2: 'rgba(239, 83, 80, 0.05)',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          lastValueVisible: true,
          priceLineVisible: true,
          priceLineWidth: 1,
          priceLineColor: '#4682B4',
          priceLineStyle: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        // Baseline chart needs different data format
        const baselineData = data.map(d => ({
          time: d.time,
          value: d.close
        }));
        seriesRef.current.setData(baselineData);
        break;
    }
  };

  // Apply chart style when it changes
  useEffect(() => {
    if (chartData) {
      applyChartStyle(chartStyle, chartData);
    }
  }, [chartStyle, chartData]);

  // Toggle fullscreen mode
  // Listen for fullscreen change events
  // Update the fullscreenChangeHandler function in ChartContainer.jsx
  useEffect(() => {
    const fullscreenChangeHandler = () => {
      const isInFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isInFullscreen);

      // Give the DOM time to update with the new dimensions
      setTimeout(() => {
        if (chartRef.current && chartContainerRef.current) {
          // Explicitly resize the chart to fit the container
          chartRef.current.resize(
            chartContainerRef.current.clientWidth,
            chartContainerRef.current.clientHeight
          );

          // Recalculate volume margins with updated dimensions
          if (chartData && volumeSeriesRef.current) {
            const volumeMargins = calculateVolumeScaleMargins(chartData);
            chartRef.current.priceScale('volume').applyOptions({
              scaleMargins: volumeMargins,
            });
          }

          // Ensure time scale is properly fitted
          chartRef.current.timeScale().fitContent();
        }
      }, 300); // Increased timeout to ensure DOM updates are complete
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
  }, [chartData]);


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (fullScreenContainerRef.current.requestFullscreen) {
        fullScreenContainerRef.current.requestFullscreen();
      } else if (fullScreenContainerRef.current.webkitRequestFullscreen) {
        fullScreenContainerRef.current.webkitRequestFullscreen();
      } else if (fullScreenContainerRef.current.msRequestFullscreen) {
        fullScreenContainerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      // Adding an immediate resize attempt before the fullscreenchange event fires
      setTimeout(() => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.resize(
            chartContainerRef.current.clientWidth,
            chartContainerRef.current.clientHeight
          );
        }
      }, 50);
    }
  };

  // Update chart size when sidebar toggle state changes
  useEffect(() => {
    if (chartRef.current && chartContainerRef.current) {
      // Schedule the resize after the DOM has been updated
      setTimeout(() => {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });

        // Recalculate volume scale
        if (chartData) {
          const volumeMargins = calculateVolumeScaleMargins(chartData);
          chartRef.current.priceScale('volume').applyOptions({
            scaleMargins: volumeMargins,
          });
        }

        // Ensure time scale is properly adjusted
        chartRef.current.timeScale().fitContent();
      }, 300); // Match transition duration
    }
  }, [isSidebarOpen, chartData]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" ref={fullScreenContainerRef}>
      <ChartHeader
        symbol={selectedSymbol}
        price={`O: ${highlightedCandle.open} H: ${highlightedCandle.high} L: ${highlightedCandle.low} C: ${highlightedCandle.close}`}
        change={highlightedCandle.change}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
      <ChartToolbar
        interval={currentInterval}
        setInterval={setCurrentInterval}
        chartStyle={chartStyle}
        setChartStyle={setChartStyle}
      />
      <div className="flex-1 relative transition-all duration-300 ease-in-out" ref={chartContainerRef}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {!isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-2 right-2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded opacity-50 hover:opacity-100 transition-opacity duration-300"
            title="Toggle Fullscreen"
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