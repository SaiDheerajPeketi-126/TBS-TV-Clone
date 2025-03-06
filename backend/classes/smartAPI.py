from SmartApi  import SmartConnect  # Import SmartAPI
import pandas as pd
import pyotp
from logzero import logger
import requests
import json

def read_credentials(file_path):
    credentials = {}
    with open(file_path, "r") as file:
        for line in file:
            key, value = line.strip().split("=")
            credentials[key] = value
    return credentials

def df_to_excel(df,exchange,symbol):
    '''
    
    '''
    pass

# def download_stock_data(api_key, client_id, pin, qr_token, exchange, symbol, interval, from_date, to_date):
#     """
#     Fetches historical stock data from AngelOne's SmartAPI.
    
#     Parameters:
#         api_key (str): Your AngelOne API key
#         client_id (str): Your client ID
#         pin (str): Your login PIN
#         qr_token (str): QR-based token for TOTP generation
#         exchange (str): Stock exchange (e.g., 'NSE', 'BSE')
#         symbol (str): Stock symbol (e.g., 'RELIANCE')
#         interval (str): Time interval ('ONE_MINUTE', 'FIVE_MINUTE', 'DAILY', etc.)
#         from_date (str): Start date (format: 'YYYY-MM-DD HH:MM')
#         to_date (str): End date (format: 'YYYY-MM-DD HH:MM')
    
#     Returns:
#         pd.DataFrame: DataFrame containing historical stock data
#     """
#     try:
#         # Generate TOTP
#         try:
#             totp = pyotp.TOTP(qr_token).now()
#         except Exception as e:
#             logger.error("Invalid Token: The provided QR token is not valid.")
#             raise e
        
#         # Initialize SmartAPI session
#         smart_api = SmartConnect(api_key)
        
#         # Login and get session token
#         login_response = smart_api.generateSession(client_id, pin, totp)
#         if login_response['status'] == False:
#             logger.error("Login failed!", login_response)
#             return None
        
#         # Extract authentication tokens
#         auth_token = login_response['data']['jwtToken']
#         refresh_token = login_response['data']['refreshToken']
#         feed_token = smart_api.getfeedToken()
        
#         # Fetch historical data
#         historical_params = {
#             "exchange": exchange,
#             "symboltoken": smart_api.searchScrip(exchange, symbol)["token"],
#             "interval": interval,
#             "fromdate": from_date,
#             "todate": to_date,
#         }
        
#         response = smart_api.getCandleData(historical_params)
        
#         # Process response
#         if response["status"] and "data" in response:
#             data = response["data"]
#             df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
#             return df
#         else:
#             logger.error("Error fetching data:", response)
#             return None
    
#     except Exception as e:
#         logger.error("Exception occurred:", str(e))
#         return None
# 
    
def download_stock_data(api_key, client_id, pin, qr_token, exchange, symbol, interval, from_date, to_date,jwtToken=None):
    """
    Fetches historical stock data from AngelOne's SmartAPI.
    
    Parameters:
        api_key (str): Your AngelOne API key
        client_id (str): Your client ID
        pin (str): Your login PIN
        qr_token (str): QR-based token for TOTP generation
        exchange (str): Stock exchange (e.g., 'NSE', 'BSE')
        symbol (str): Stock symbol (e.g., 'RELIANCE')
        interval (str): Time interval ('ONE_MINUTE', 'FIVE_MINUTE', 'DAILY', etc.)
        from_date (str): Start date (format: 'YYYY-MM-DD HH:MM')
        to_date (str): End date (format: 'YYYY-MM-DD HH:MM')
    
    Returns:
        pd.DataFrame: DataFrame containing historical stock data
    """
    try:
        totp = pyotp.TOTP(qr_token).now()
    except Exception as e:
        logger.error("Invalid Token: The provided token is not valid.")
        raise e
    smartApi = SmartConnect(api_key)

    login_response = smartApi.generateSession(client_id, pin, totp)
    if login_response['status'] == False:
        logger.error("Login failed!", login_response)
        return None
    
    # symboltoken = get_token(exchange=exchange,symbol=symbol,jwtToken=jwtToken)
    # if symboltoken is None: return {"error" : f"{symboltoken} is Empty"}
    symboltoken = get_symbol_from_excel(exchange=exchange,symbol=symbol)
    print(symboltoken)
    try:
        historicParam={
        "exchange": exchange,
        "symboltoken": symboltoken, ###
        "interval": interval,
        "fromdate": from_date, 
        "todate": to_date
        }
        response = smartApi.getCandleData(historicParam)
 
#         # Process response
        if response["status"] and "data" in response:
            data = response["data"]
            df = pd.DataFrame(data, columns=["timestamp", "open", "high", "low", "close", "volume"])
            
    except Exception as e:
        logger.exception(f"Historic Api failed: {e}")
        return {"error" : e}

def login(qr_token,client_id,pin,api_key):
    totp = pyotp.TOTP(qr_token).now()
        
    # Login directly
    login_url = "https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword"
    login_payload = {
        "clientcode": client_id,
        "password": pin,
        "totp": totp
    }
    login_headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-UserType": "USER",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "CLIENT_LOCAL_IP",
        "X-ClientPublicIP": "CLIENT_PUBLIC_IP",
        "X-MACAddress": "MAC_ADDRESS",
        "X-PrivateKey": api_key
    }
    
    login_response = requests.post(login_url, json=login_payload, headers=login_headers)
    login_data = login_response.json()
    jwtToken = login_data['data']['jwtToken']
    if login_data.get('status') != True:
        logger.error(f"Login failed: {login_data}")
        return -1
    return jwtToken



# def get_token(exchange,symbol,jwtToken):
#         # Extract tokens

#         # Search for symbol
#         search_url = "https://apiconnect.angelbroking.com/rest/secure/angelbroking/market/v1/searchscrip"
#         search_payload = {
#             "exchange": exchange,
#             "searchtext": symbol
#         }
#         search_headers = {
#             "Content-Type": "application/json",
#             "Accept": "application/json",
#             "X-UserType": "USER",
#             "X-SourceID": "WEB",
#             "X-ClientLocalIP": "CLIENT_LOCAL_IP",
#             "X-ClientPublicIP": "CLIENT_PUBLIC_IP",
#             "X-MACAddress": "MAC_ADDRESS",
#             "Authorization": f"Bearer {jwtToken}"
#         }
#         search_response = requests.post(search_url, json=search_payload, headers=search_headers)
#         print(f"Search response status code: {search_response.status_code}")
#         print(f"Search response raw content: {search_response.text}")

#         if search_response.text.strip():
#             try:
#                 search_data = search_response.json()
#                 print(2)
#             except json.JSONDecodeError as e:
#                 print(f"JSON parsing error: {str(e)}")
#         else:
#             print("Received empty response from search API")

#         logger.info(f"Direct search response: {search_data}")
        
#         if not search_data.get('status'):
#             logger.error(f"Symbol search failed: {search_data}")
#             return None
        
#         # Extract symbol token
#         if 'data' in search_data and isinstance(search_data['data'], list) and len(search_data['data']) > 0:
#             print(3)
#             return search_data['data'][0]['symboltoken']
#         else:
#             logger.error(f"No symbol data found: {search_data}")
#             return None

def get_symbol_from_excel(exchange,symbol):
    '''
    
    '''
    import os

    path = "data"
    try:
        for root, dirs, files in os.walk(path):
            # Filter only Excel files
            excel_files = [f for f in files if f.endswith((".xlsx", ".xls"))]
            
            for i in excel_files:
                try:
                    temp_str = i.split("_")
                    temp_stock = temp_str[1]
                    if temp_stock.split(".")[0] == exchange:
                        path += "/" + i
                except Exception as e:
                    print(f"Error parsing filename {i}: {e}")
        df = pd.read_excel(path,index_col=False)
        if len(df) == 0: return None
        token = df[df["symbol"]==symbol]["token"].values[0]
        print(token)
        return str(token)
    except Exception as e:
        return {"error": str(e)}
    
def update_symbol_excel():
    import pandas as pd
    import requests
    import os

    # Your JSON data
    api_url = 'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'

    # Make a GET request to the API
    response = requests.get(api_url)

    if response.status_code == 200:
        data = response.json()  # Parse the JSON response
        df = pd.DataFrame(data)
        
        # Get unique values from the 'exch_seg' column
        unique_exch_seg = df['exch_seg'].unique()
        
        # Create a separate Excel file for each unique value in 'exch_seg'
        for value in unique_exch_seg:
            # Filter the DataFrame for the current 'exch_seg' value
            filtered_df = df[df['exch_seg'] == value]
            
            # Create the output filename
            output_file = f'output_{value}.xlsx'
            dir = "data"
            os.makedirs(dir, exist_ok=True)
            path = os.path.join(".",dir,output_file)
            # Write the filtered DataFrame to an Excel file
            filtered_df.to_excel(path, index=False)
            
            print(f'Data for {value} has been written to {output_file}')
    else:
        print(f'Failed to retrieve data. Status code: {response.status_code}')