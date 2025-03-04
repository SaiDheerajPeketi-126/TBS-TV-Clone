from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime
import math
import os
import requests

from classes.localExcel import LocalExcel

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

@app.get("/api/search")
async def get_all_sheets(path: str = "../sheets"):
    
    localexcel = LocalExcel(path=path)
    return localexcel.get_all_local()



@app.get("/api/data")
async def get_market_data(stock_exchange:str,stock_symbol:str ,path :str = "../sheets",stock_time_frame:int = 1):
    """
    Reads market data from an Excel file that has columns:
      timestamp, open, high, low, close, volume
    Then returns the requested date range in a format suitable for the frontend.
    """
    
    localexcel = LocalExcel(path=path)
    try:
        return localexcel.search_for_stock(stock_exchange=stock_exchange,stock_symbol=stock_symbol,stock_time_frame = stock_time_frame)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/backtest")
async def run_backtest(request: BacktestRequest):
    """
    Reads market data from an Excel file (same format as above),
    then runs the requested strategy on the specified date range.
    """
    try:
        # Read data from Excel
        data = pd.read_excel("../NSE_TRIVENI-BL_TRIVENI.xlsx")  # <-- change this to your Excel file name/path
        data["timestamp"] = pd.to_datetime(data["timestamp"])

        # Rename columns to match your existing strategy code
        data.rename(columns={
            "open": "Open",
            "high": "High",
            "low": "Low",
            "close": "Close",
            "volume": "Volume"
        }, inplace=True)
        
        # Filter data by start/end dates
        start_dt =  data["timestamp"].max()
        end_dt =  data["timestamp"].min()
        mask = (data["timestamp"] >= start_dt) & (data["timestamp"] <= end_dt)
        data = data.loc[mask].copy()
        
        # Sort and set index to timestamp so the strategy logic works as before
        data.sort_values("timestamp", inplace=True)
        data.set_index("timestamp", inplace=True)

        # mean1,median1 = data["volume"].mean(),data["volume"].median()
        # print(mean1)
        # print(median1)
        # Run the appropriate strategy
        # if request.strategy == "Moving Average Crossover":
        #     results = moving_average_strategy(data, request.parameters)
        # elif request.strategy == "RSI Strategy":
        #     results = rsi_strategy(data, request.parameters)
        # elif request.strategy == "Custom":
        #     results = custom_strategy(data, request.parameters)
        # else:
        #     raise HTTPException(status_code=400, detail="Unsupported strategy")
        
        # return {"Mean Volume":mean1,"Median Volume":median1}
        return {
    "totalTrades": 25,
    "winningTrades": 15,
    "losingTrades": 10,
    "winRate": 60.0,  # (15/25) * 100
    "profitFactor": 1.8,  # Gross profit / Gross loss
    "netProfit": 1250.75,  # Ending balance - starting balance
    "maxDrawdown": -5.4,  # Worst drawdown percentage
    "sharpeRatio": 1.25,  # Risk-adjusted return
    "startingBalance": 10000.0,
    "endingBalance": 11250.75,
    "trades": [
        {"type": "buy", "time": "2025-02-20T10:00:00", "price": 150.5, "profit": None},
        {"type": "sell", "time": "2025-02-21T14:30:00", "price": 155.0, "profit": 4.5, "entryTime": "2025-02-20T10:00:00"},
        {"type": "buy", "time": "2025-02-22T11:15:00", "price": 152.0, "profit": None},
        {"type": "sell", "time": "2025-02-23T13:45:00", "price": 149.0, "profit": -3.0, "entryTime": "2025-02-22T11:15:00"}
    ]
}

    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tradingview/market-data")
def tradingview_market_data():

    response = requests.get("http://localhost:3000/market-data?market=BINANCE:BTCUSDT")
    data = response.json()
    # print(data)
    return data

@app.get("/api/tradingview/technical-analysis")
def tradingview_technical_analysis():

    response = requests.get("http://localhost:3000/technical-analysis?market=BINANCE:BTCUSDT")
    data = response.json()
    # print(data)
    return data



def moving_average_strategy(data: pd.DataFrame):
    return data["volume"].mean(),data["volume"].median()


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
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    data["RSI"] = rsi
    
    # Generate signals
    data["signal"] = 0
    data.loc[data["RSI"] < oversold, "signal"] = 1  # Buy
    data.loc[data["RSI"] > overbought, "signal"] = -1  # Sell
    
    # Calculate positions
    data["position"] = 0
    position = 0
    for i in range(1, len(data)):
        if data["signal"].iloc[i] == 1 and position <= 0:
            position = 1
        elif data["signal"].iloc[i] == -1 and position >= 0:
            position = -1
        data["position"].iloc[i] = position
    
    # Calculate trades
    trades = []
    current_position = 0
    entry_price = 0
    entry_time = None
    
    for index, row in data.iterrows():
        if row["position"] > current_position:  # Buy
            current_position = 1
            entry_price = row["Close"]
            entry_time = index
            trades.append({
                "type": "buy",
                "time": index.isoformat(),
                "price": float(entry_price),
                "profit": None
            })
        elif row["position"] < current_position:  # Sell
            if current_position > 0:  # Close long
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
    starting_balance = 10000
    cumulative_returns = (1 + data["strategy_returns"].fillna(0)).cumprod()
    ending_balance = starting_balance * cumulative_returns.iloc[-1]
    
    winning_trades = len([t for t in trades if t.get("profit", 0) > 0])
    losing_trades = len([t for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) <= 0])
    total_trades = winning_trades + losing_trades
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    cumulative_max = cumulative_returns.cummax()
    drawdown = (cumulative_returns / cumulative_max - 1) * 100
    max_drawdown = abs(drawdown.min())
    
    if data["strategy_returns"].std() == 0:
        sharpe_ratio = 0
    else:
        sharpe_ratio = data["strategy_returns"].mean() / data["strategy_returns"].std() * (252 ** 0.5)
    
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
        "sharpeRatio": float(sharpe_ratio),
        "startingBalance": starting_balance,
        "endingBalance": float(ending_balance),
        "trades": trades
    }

def custom_strategy(data: pd.DataFrame, parameters: Dict[str, Any]):
    code = parameters.get("code", "")
    
    # Add some commonly used indicators
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
    
    # Execute user code safely
    try:
        local_env = {
            "df": data,
            "np": np,
            "pd": pd,
            "buy_signals": buy_signals,
            "sell_signals": sell_signals
        }
        exec(code, {}, local_env)
        buy_signals = local_env.get("buy_signals", buy_signals)
        sell_signals = local_env.get("sell_signals", sell_signals)
    except Exception as e:
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
    
    # Strategy returns
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
    starting_balance = 10000
    cumulative_returns = (1 + data["strategy_returns"].fillna(0)).cumprod()
    ending_balance = starting_balance * cumulative_returns.iloc[-1]
    
    winning_trades = len([t for t in trades if t.get("profit", 0) > 0])
    losing_trades = len([t for t in trades if t.get("profit", 0) is not None and t.get("profit", 0) <= 0])
    total_trades = winning_trades + losing_trades
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    cumulative_max = cumulative_returns.cummax()
    drawdown = (cumulative_returns / cumulative_max - 1) * 100
    max_drawdown = abs(drawdown.min())
    
    if data["strategy_returns"].std() == 0:
        sharpe_ratio = 0
    else:
        sharpe_ratio = data["strategy_returns"].mean() / data["strategy_returns"].std() * (252 ** 0.5)
    
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
        "sharpeRatio": float(sharpe_ratio),
        "startingBalance": starting_balance,
        "endingBalance": float(ending_balance),
        "trades": trades
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
