import os
import pandas as pd
from datetime import datetime


class LocalExcel:
    '''
    
    '''
    def __init__(self,path):
        '''
        
        '''
        self.path = path


    def get_all_local(self, path=None):
        """
        Recursively retrieves all Excel files in the given directory.
        Returns a dictionary mapping folder names to stock names from Excel files.
        """
        if path is None:
            path = self.path

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
                        stock_list.append(temp_stock.split(".")[0])
                    except Exception as e:
                        print(f"Error parsing filename {i}: {e}")
                
                if stock_list:
                    folder_stock_map[folder_name] = stock_list
            
            return folder_stock_map
        
        except Exception as e:
            return {"error": str(e)}

    
    def search_for_stock(self,stock_exchange,stock_symbol,path = None,):
        '''
        
        '''
        if path is None: path = self.path
        try:
            # Read data from Excel
            path = path+"/"+stock_exchange
              
            folder_stock_map = {}
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
            
            return {"candles": candles}
    
        except Exception as e:
            return {"error": str(e)}


        
