from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import math

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str
    startDate: str
    endDate: str
    strategy: str
    parameters: Dict[str, Any]

@app.get("/api/data")
async def get_market_data(symbol: str, timeframe: str, start: str, end: str):
    try:
        # Convert timeframe to yfinance format
        interval = {
            "1m": "1m",
            "5m": "5m",
            "15m": "15m",
            "30m": "30m",
            "1h": "1h",
            "1d": "1d",
            "1w": "1wk",
        }.get(timeframe, "1d")
        
        # Fetch data from Yahoo Finance
        data = yf.download(
            symbol,
            start=start,
            end=end,
            interval=interval,
            auto_adjust=True
        )
        
        # Format data for frontend
        candles = []
        for timestamp, row in data.iterrows():
            candles.append({
                "time": timestamp.isoformat(),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"])
            })
        
        return {"candles": candles}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backtest")
async def run_backtest(request: BacktestRequest):
    try:
        # Fetch market data
        interval = {
            "1m": "1m",
            "5m": "5m",
            "15m": "15m",
            "30m": "30m",
            "1h": "1h",
            "1d": "1d",
            "1w": "1wk",
        }.get(request.timeframe, "1d")
        
        data = yf.download(
            request.symbol,
            start=request.startDate,
            end=request.endDate,
            interval=interval,
            auto_adjust=True
        )
        
        # Run the appropriate strategy
        if request.strategy == "Moving Average Crossover":
            results = moving_average_strategy(data, request.parameters)
        elif request.strategy == "RSI Strategy":
            results = rsi_strategy(data, request.parameters)
        elif request.strategy == "Custom":
            results = custom_strategy(data, request.parameters)
        else:
            raise HTTPException(status_code=400, detail="Unsupported strategy")
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def moving_average_strategy(data: pd.DataFrame, parameters: Dict[str, Any]):
    fast_period = parameters.get("fastPeriod", 9)
    slow_period = parameters.get("slowPeriod", 21)
    ma_type = parameters.get("maType", "sma")
    
    # Calculate indicators
    if ma_type == "sma":
        data["fast_ma"] = data["Close"].rolling(window=fast_period).mean()
        data["slow_ma"] = data["Close"].rolling(window=slow_period).mean()
    else:  # EMA
        data["fast_ma"] = data["Close"].ewm(span=fast_period, adjust=False).mean()
        data["slow_ma"] = data["Close"].ewm(span=slow_period, adjust=False).mean()
    
    # Generate signals
    data["signal"] = 0
    data.loc[data["fast_ma"] > data["slow_ma"], "signal"] = 1
    data.loc[data["fast_ma"] < data["slow_ma"], "signal"] = -1
    
    # Calculate trades
    data["position"] = data["signal"].shift(1)
    data["position"] = data["position"].fillna(0)
    
    # Calculate trade entries and exits
    trades = []
    current_position = 0
    entry_price = 0
    entry_time = None
    
    for index, row in data.iterrows():
        if row["position"] > current_position:  # Buy signal
            current_position = 1
            entry_price = row["Close"]
            entry_time = index
            trades.append({
                "type": "buy",
                "time": index.isoformat(),
                "price": float(entry_price),
                "profit": None
            })
        elif row["position"] < current_position:  # Sell signal
            if current_position > 0:  # If we have a position to close
                profit = row["Close"] - entry_price
                trades.append({
                    "type": "sell",
                    "time": index.isoformat(),
                    "price": float(row["Close"]),
                    "profit": float(profit),
                    "entryTime": entry_time.isoformat()
                })
            current_position = -1
            entry_price = row["Close"]
            entry_time = index
    
    # Calculate returns
    data["returns"] = data["Close"].pct_change()
    data["strategy_returns"] = data["position"] * data["returns"]
    
    # Calculate metrics
    starting_balance = 10000  # Starting with $10,000
    cumulative_returns = (1 + data["strategy_returns"]).cumprod()
    ending_balance = starting_balance * cumulative_returns.iloc[-1]
    
    # Calculate winning and losing trades
    winning_trades = len([t for t in trades if t.get("profit", 0) > 0])
    losing_trades = len([t for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) <= 0])
    total_trades = winning_trades + losing_trades
    
    # Calculate win rate
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    # Calculate max drawdown
    cumulative_max = cumulative_returns.cummax()
    drawdown = (cumulative_returns / cumulative_max - 1) * 100
    max_drawdown = abs(drawdown.min())
    
    # Calculate Sharpe ratio (assuming risk-free rate = 0)
    sharpe_ratio = data["strategy_returns"].mean() / data["strategy_returns"].std() * (252 ** 0.5)  # Annualized
    
    # Calculate profit factor
    gross_profit = sum([t.get("profit", 0) for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) > 0])
    gross_loss = abs(sum([t.get("profit", 0) for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) < 0]))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    return {
        "totalTrades": total_trades,
        "winningTrades": winning_trades,
        "losingTrades": losing_trades,
        "winRate": win_rate,
        "profitFactor": profit_factor,
        "netProfit": float(ending_balance - starting_balance),
        "maxDrawdown": float(max_drawdown),
        "sharpeRatio": float(sharpe_ratio) if not math.isnan(sharpe_ratio) else 0,
        "startingBalance": starting_balance,
        "endingBalance": float(ending_balance),
        "trades": trades
    }

def rsi_strategy(data: pd.DataFrame, parameters: Dict[str, Any]):
    period = parameters.get("period", 14)
    overbought = parameters.get("overbought", 70)
    oversold = parameters.get("oversold", 30)
    
    # Calculate RSI
    delta = data["Close"].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    
    # First RSI calculation
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    data["RSI"] = rsi
    
    # Generate signals
    data["signal"] = 0
    data.loc[data["RSI"] < oversold, "signal"] = 1  # Buy when RSI is oversold
    data.loc[data["RSI"] > overbought, "signal"] = -1  # Sell when RSI is overbought
    
    # Calculate trades
    data["position"] = 0
    position = 0
    
    for i in range(1, len(data)):
        if data["signal"].iloc[i] == 1 and position <= 0:
            position = 1  # Enter long position
        elif data["signal"].iloc[i] == -1 and position >= 0:
            position = -1  # Enter short position
        data["position"].iloc[i] = position
    
    # Calculate trade entries and exits
    trades = []
    current_position = 0
    entry_price = 0
    entry_time = None
    
    for index, row in data.iterrows():
        if row["position"] > current_position:  # Buy signal
            current_position = 1
            entry_price = row["Close"]
            entry_time = index
            trades.append({
                "type": "buy",
                "time": index.isoformat(),
                "price": float(entry_price),
                "profit": None
            })
        elif row["position"] < current_position:  # Sell signal
            if current_position > 0:  # If we have a position to close
                profit = row["Close"] - entry_price
                trades.append({
                    "type": "sell",
                    "time": index.isoformat(),
                    "price": float(row["Close"]),
                    "profit": float(profit),
                    "entryTime": entry_time.isoformat()
                })
            current_position = -1
            entry_price = row["Close"]
            entry_time = index
    
    # Calculate returns
    data["returns"] = data["Close"].pct_change()
    data["strategy_returns"] = data["position"].shift(1) * data["returns"]
    
    # Calculate metrics
    starting_balance = 10000  # Starting with $10,000
    cumulative_returns = (1 + data["strategy_returns"].fillna(0)).cumprod()
    ending_balance = starting_balance * cumulative_returns.iloc[-1]
    
    # Calculate winning and losing trades
    winning_trades = len([t for t in trades if t.get("profit", 0) > 0])
    losing_trades = len([t for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) <= 0])
    total_trades = winning_trades + losing_trades
    
    # Calculate win rate
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    # Calculate max drawdown
    cumulative_max = cumulative_returns.cummax()
    drawdown = (cumulative_returns / cumulative_max - 1) * 100
    max_drawdown = abs(drawdown.min())
    
    # Calculate Sharpe ratio (assuming risk-free rate = 0)
    sharpe_ratio = data["strategy_returns"].mean() / data["strategy_returns"].std() * (252 ** 0.5)  # Annualized
    
    # Calculate profit factor
    gross_profit = sum([t.get("profit", 0) for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) > 0])
    gross_loss = abs(sum([t.get("profit", 0) for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) < 0]))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    return {
        "totalTrades": total_trades,
        "winningTrades": winning_trades,
        "losingTrades": losing_trades,
        "winRate": win_rate,
        "profitFactor": profit_factor,
        "netProfit": float(ending_balance - starting_balance),
        "maxDrawdown": float(max_drawdown),
        "sharpeRatio": float(sharpe_ratio) if not math.isnan(sharpe_ratio) else 0,
        "startingBalance": starting_balance,
        "endingBalance": float(ending_balance),
        "trades": trades
    }

def custom_strategy(data: pd.DataFrame, parameters: Dict[str, Any]):
    code = parameters.get("code", "")
    
    # Add some commonly used indicators to the dataframe
    data["sma_9"] = data["Close"].rolling(window=9).mean()
    data["sma_21"] = data["Close"].rolling(window=21).mean()
    data["ema_9"] = data["Close"].ewm(span=9, adjust=False).mean()
    data["ema_21"] = data["Close"].ewm(span=21, adjust=False).mean()
    
    # Calculate RSI
    delta = data["Close"].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    rs = avg_gain / avg_loss
    data["rsi_14"] = 100 - (100 / (1 + rs))
    
    # Create buy_signal and sell_signal arrays
    buy_signals = np.zeros(len(data))
    sell_signals = np.zeros(len(data))
    
    # Execute user code
    try:
        # Create a local environment with necessary variables
        local_env = {
            "df": data,
            "np": np,
            "pd": pd,
            "buy_signals": buy_signals,
            "sell_signals": sell_signals
        }
        
        # Execute the code
        exec(code, {}, local_env)
        
        # Get results
        buy_signals = local_env.get("buy_signals", buy_signals)
        sell_signals = local_env.get("sell_signals", sell_signals)
    except Exception as e:
        # Return error
        return {
            "error": str(e),
            "totalTrades": 0,
            "winningTrades": 0,
            "losingTrades": 0,
            "winRate": 0,
            "profitFactor": 0,
            "netProfit": 0,
            "maxDrawdown": 0,
            "sharpeRatio": 0,
            "startingBalance": 10000,
            "endingBalance": 10000,
            "trades": []
        }
    
    # Calculate positions and trades
    position = 0
    trades = []
    entry_price = 0
    entry_time = None
    
    for i, index in enumerate(data.index):
        if buy_signals[i] and position <= 0:
            position = 1
            entry_price = data["Close"].iloc[i]
            entry_time = index
            trades.append({
                "type": "buy",
                "time": index.isoformat(),
                "price": float(entry_price),
                "profit": None
            })
        elif sell_signals[i] and position >= 0:
            if position > 0:
                profit = data["Close"].iloc[i] - entry_price
                trades.append({
                    "type": "sell",
                    "time": index.isoformat(),
                    "price": float(data["Close"].iloc[i]),
                    "profit": float(profit),
                    "entryTime": entry_time.isoformat()
                })
            position = -1
            entry_price = data["Close"].iloc[i]
            entry_time = index
    
    # Calculate strategy returns
    position_array = np.zeros(len(data))
    current_position = 0
    
    for i in range(len(data)):
        if buy_signals[i] and current_position <= 0:
            current_position = 1
        elif sell_signals[i] and current_position >= 0:
            current_position = -1
        position_array[i] = current_position
    
    data["position"] = position_array
    data["returns"] = data["Close"].pct_change()
    data["strategy_returns"] = data["position"].shift(1) * data["returns"]
    
    # Calculate metrics
    starting_balance = 10000  # Starting with $10,000
    cumulative_returns = (1 + data["strategy_returns"].fillna(0)).cumprod()
    ending_balance = starting_balance * cumulative_returns.iloc[-1]
    
    # Calculate winning and losing trades
    winning_trades = len([t for t in trades if t.get("profit", 0) > 0])
    losing_trades = len([t for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) <= 0])
    total_trades = winning_trades + losing_trades
    
    # Calculate win rate
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    # Calculate max drawdown
    cumulative_max = cumulative_returns.cummax()
    drawdown = (cumulative_returns / cumulative_max - 1) * 100
    max_drawdown = abs(drawdown.min())
    
    # Calculate Sharpe ratio (assuming risk-free rate = 0)
    sharpe_ratio = data["strategy_returns"].mean() / data["strategy_returns"].std() * (252 ** 0.5)  # Annualized
    
    # Calculate profit factor
    gross_profit = sum([t.get("profit", 0) for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) > 0])
    gross_loss = abs(sum([t.get("profit", 0) for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) < 0]))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    return {
        "totalTrades": total_trades,
        "winningTrades": winning_trades,
        "losingTrades": losing_trades,
        "winRate": win_rate,
        "profitFactor": profit_factor,
        "netProfit": float(ending_balance - starting_balance),
        "maxDrawdown": float(max_drawdown),
        "sharpeRatio": float(sharpe_ratio) if not math.isnan(sharpe_ratio) else 0,
        "startingBalance": starting_balance,
        "endingBalance": float(ending_balance),
        "trades": trades
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

