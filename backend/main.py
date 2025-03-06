from fastapi import FastAPI, HTTPException, Request
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
from classes.smartAPI import download_stock_data,read_credentials,login,update_symbol_excel


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
    
    return LocalExcel.get_all_local(path=path)



@app.get("/api/data")
async def get_market_data(stock_exchange:str,stock_symbol:str ,path :str = "../sheets",stock_time_frame:int = 1):
    """
    Reads market data from an Excel file that has columns:
      timestamp, open, high, low, close, volume
    Then returns the requested date range in a format suitable for the frontend.
    """
    
    try:
        return LocalExcel.search_for_stock(stock_exchange=stock_exchange,stock_symbol=stock_symbol,stock_time_frame = stock_time_frame,path=path)
    
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

@app.get("/api/smartAPI/download")
async def download_data(request: Request):
    # print(request.json())
    try:
        params =  await request.json()  # Read raw JSON from request
        print(params)
        required_keys = [ "exchange", "symbol", "interval", "from_date", "to_date"]
        if not all(key in params for key in required_keys):
            raise HTTPException(status_code=400, detail="Missing required parameters")

        creds = read_credentials("../credentials.txt")
        # Call the function with extracted parameters
        data = download_stock_data(
            creds["api_key"],
            creds["client_id"],
            creds["pin"],
            creds["qr_token"],
            params["exchange"],
            params["symbol"],
            params["interval"],
            params["from_date"],
            params["to_date"],
            params["path"]
            
        )

        if data is not None:
            return data
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch stock data")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # # Example Usage
    # exchange = params["exchange"] #"NSE"
    # symbol = params["symbol"]#RELIANCE"
    # interval = params["interval"]#DAILY"
    # from_date = params["from_date"]#2024-03-01 09:15"
    # to_date = params["to_date"]#2024-03-05 15:30"

    # # Fetch stock data
    # df = download_stock_data(
    #     creds["api_key"],
    #     creds["client_id"],
    #     creds["pin"],
    #     creds["qr_token"],
    #     exchange,
    #     symbol,
    #     interval,
    #     from_date,
    #     to_date
    # )

    # # Display the DataFrame
    # if df is not None:
    #     return df.to_json()
    # else:
    #     print("Failed to fetch stock data.")
    # return data

if __name__ == "__main__":
    import uvicorn
    # creds = read_credentials("../credentials.txt")
    # jwtToken = login(creds["qr_token"],creds["client_id"],creds["pin"],creds["api_key"])
    # update_symbol_excel()
    uvicorn.run(app, host="0.0.0.0", port=8000)

