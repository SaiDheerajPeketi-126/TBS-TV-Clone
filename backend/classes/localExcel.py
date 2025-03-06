import os
import pandas as pd
from datetime import datetime


class LocalExcel:
    '''
    All Local File Operations
    '''
    def __init__(self):
        '''
        
        '''


    def get_all_local(path):
        """
        Recursively retrieves all Excel files in the given directory.
        Returns a dictionary mapping folder names to stock names from Excel files.
        """
        if path is None or path == '':
            return {"error":"Path cannot be Empty"}

        folder_stock_map = {}
        
        try:
            for root, dirs, files in os.walk(path):
                folder_name = os.path.basename(root)
                
                # Filter only Excel files
                excel_files = [f for f in files if f.endswith((".xlsx", ".xls"))]
                stock_list = []
                
                for i in excel_files:
                    try:
                        temp_str = i.split("_")
                        temp_stock = temp_str[2]
                        stock_list.append({'name':temp_stock.split(".")[0],'symbol':temp_str[1]})
                    except Exception as e:
                        print(f"Error parsing filename {i}: {e}")
                
                if stock_list:
                    folder_stock_map[folder_name] = stock_list
            
            return folder_stock_map
        
        except Exception as e:
            return {"error": str(e)}

    
    def search_for_stock(stock_exchange,stock_symbol,path,stock_time_frame = 1):
        '''
        
        '''
        if path is None or path == '':
            return {"error":"Path cannot be Empty"}
        try:
            # Read data from Excel
            path = path+"/"+stock_exchange
              
            try:
                for root, dirs, files in os.walk(path):
                    folder_name = os.path.basename(root)
                    if folder_name != stock_exchange : continue

                    # Filter only Excel files
                    excel_files = [f for f in files if f.endswith((".xlsx", ".xls"))]
                    
                    for i in excel_files:
                        try:
                            temp_str = i.split("_")
                            temp_stock = temp_str[2]
                            if temp_stock.split(".")[0] == stock_symbol:
                                path += "/" + i

                        except Exception as e:
                            print(f"Error parsing filename {i}: {e}")
            except Exception as e:
                return {"error": str(e)}
            data = pd.read_excel(path) 
            start = data["timestamp"].max()
            end = data["timestamp"].min()
            
            data["timestamp"] = pd.to_datetime(data["timestamp"])

        # **Floor timestamps** to the nearest 5-min, 10-min, etc.
            time_interval = f"{stock_time_frame}T"  # 'T' represents minutes in pandas
            data["interval"] = data["timestamp"].dt.floor(time_interval)

            # Group by the new interval column
            data = data.groupby("interval").agg({
                "open": "first",  
                "high": "max",     
                "low": "min",      
                "close": "last",   
                "volume": "sum"   
            }).reset_index()

            # Convert timestamp column to datetime
            # data["datetime"] = pd.to_datetime(data["timestamp"])

        
        # Filter by the requested date range
            # start_dt = pd.to_datetime(start)
            # end_dt = pd.to_datetime(end)
            
            # Rename columns to match your existing strategy code
            data.rename(columns={
                "open": "Open",
                "high": "High",
                "low": "Low",
                "close": "Close",
                "volume": "Volume",
                'interval' : "timestamp"
            }, inplace=True)
            

            # Filter by the requested date range


            # data = data[(data["datetime"] >= start_dt) & (data["datetime"] <= end_dt)]
            # Sort by timestamp (just in case)
            # data.sort_values("timestamp", inplace=True)
            
            # Format data for the frontend
            candles = []
            
            for _, row in data.iterrows():
                candles.append({
                    "time": row["timestamp"],
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": float(row["Volume"])
                })
            
            return {"data_size":len(candles),"candles": candles}
    
        except Exception as e:
            return {"error": str(e)}


        
