import os
import datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def generate_ecom_dataset():
    """
    Generates a realistic 90-day pricing dataset for popular electronics in India.
    Saves it as 'historical_prices.csv'.
    """
    print("[1/5] Generating historical e-commerce pricing dataset...")
    
    np.random.seed(42)
    products = [
        {"id": 1, "name": "Apple iPhone 15 Pro Max", "base_price": 159900},
        {"id": 2, "name": "Apple iPhone 15 Pro", "base_price": 129900},
        {"id": 3, "name": "Apple iPhone 15 Plus", "base_price": 89900},
        {"id": 4, "name": "Apple iPhone 15", "base_price": 79900},
        {"id": 5, "name": "Apple iPhone 14 Pro Max", "base_price": 139900},
        {"id": 6, "name": "Apple iPhone 14 Pro", "base_price": 119900},
        {"id": 7, "name": "Apple iPhone 14", "base_price": 69900},
        {"id": 8, "name": "Apple iPhone 13", "base_price": 59900},
        {"id": 9, "name": "Apple iPhone 12", "base_price": 49900},
        {"id": 10, "name": "Apple iPhone SE", "base_price": 43900},
        {"id": 11, "name": "Samsung Galaxy S24 Ultra 5G", "base_price": 129999},
        {"id": 12, "name": "Samsung Galaxy S24+ 5G", "base_price": 99999},
        {"id": 13, "name": "Samsung Galaxy S24 5G", "base_price": 79999},
        {"id": 14, "name": "Samsung Galaxy S23 Ultra 5G", "base_price": 109999},
        {"id": 15, "name": "Samsung Galaxy S23+ 5G", "base_price": 84999},
        {"id": 16, "name": "Samsung Galaxy S23 5G", "base_price": 64999},
        {"id": 17, "name": "Samsung Galaxy S23 FE 5G", "base_price": 49999},
        {"id": 18, "name": "Samsung Galaxy A55 5G", "base_price": 39999},
        {"id": 19, "name": "Samsung Galaxy A35 5G", "base_price": 30999},
        {"id": 20, "name": "Samsung Galaxy M55 5G", "base_price": 26999},
        {"id": 21, "name": "OnePlus 12 5G", "base_price": 64999},
        {"id": 22, "name": "OnePlus 12R 5G", "base_price": 45999},
        {"id": 23, "name": "OnePlus 11 5G", "base_price": 56999},
        {"id": 24, "name": "OnePlus 11R 5G", "base_price": 37999},
        {"id": 25, "name": "OnePlus Nord 4 5G", "base_price": 32999},
        {"id": 26, "name": "OnePlus Nord CE 4 5G", "base_price": 24999},
        {"id": 27, "name": "OnePlus Nord CE 4 Lite 5G", "base_price": 19999},
        {"id": 28, "name": "Google Pixel 8 Pro", "base_price": 106999},
        {"id": 29, "name": "Google Pixel 8", "base_price": 75999},
        {"id": 30, "name": "Google Pixel 8a", "base_price": 52999},
        {"id": 31, "name": "Google Pixel 7a", "base_price": 37999},
        {"id": 32, "name": "Xiaomi Redmi Note 13 Pro+ 5G", "base_price": 31999},
        {"id": 33, "name": "Xiaomi Redmi Note 13 Pro 5G", "base_price": 27999},
        {"id": 34, "name": "Xiaomi 14 5G", "base_price": 69999},
        {"id": 35, "name": "Nothing Phone", "base_price": 39999},
        {"id": 36, "name": "Nothing Phone", "base_price": 23999},
        {"id": 36, "name": "Apple MacBook Air", "base_price": 114900},
        {"id": 37, "name": "Apple MacBook Air", "base_price": 154900},
        {"id": 38, "name": "Apple MacBook Pro", "base_price": 169900},
        {"id": 39, "name": "Apple MacBook Pro", "base_price": 249900},
        {"id": 40, "name": "Apple MacBook Air", "base_price": 99900},
        {"id": 41, "name": "ASUS ROG Zephyrus G14 Gaming", "base_price": 134990},
        {"id": 42, "name": "ASUS TUF Gaming F15", "base_price": 64990},
        {"id": 43, "name": "ASUS Vivobook 16X", "base_price": 49990},
        {"id": 44, "name": "HP Spectre x360 2-in-1", "base_price": 154990},
        {"id": 45, "name": "HP Pavilion 15", "base_price": 54990},
        {"id": 46, "name": "HP Victus Gaming", "base_price": 62990},
        {"id": 47, "name": "Dell XPS 13", "base_price": 124990},
        {"id": 48, "name": "Dell Inspiron 15", "base_price": 44990},
        {"id": 49, "name": "Dell G15 Gaming", "base_price": 69990},
        {"id": 50, "name": "Lenovo Legion 5 Gaming", "base_price": 118990},
        {"id": 51, "name": "Lenovo IdeaPad Slim 3", "base_price": 32990},
        {"id": 52, "name": "Lenovo Yoga Slim 7 Carbon", "base_price": 139990},
        {"id": 53, "name": "Acer Predator Helios Neo 16", "base_price": 124990},
        {"id": 54, "name": "Acer Aspire 5", "base_price": 47990},
        {"id": 55, "name": "Apple iPad Air", "base_price": 59900},
        {"id": 56, "name": "Apple iPad Air", "base_price": 79900},
        {"id": 57, "name": "Apple iPad Pro", "base_price": 99900},
        {"id": 58, "name": "Apple iPad Pro", "base_price": 129900},
        {"id": 59, "name": "Apple iPad", "base_price": 34900},
        {"id": 60, "name": "Samsung Galaxy Tab S9 Ultra", "base_price": 108999},
        {"id": 61, "name": "Samsung Galaxy Tab S9 FE", "base_price": 34999},
        {"id": 62, "name": "Samsung Galaxy Tab A9+", "base_price": 18999},
        {"id": 63, "name": "OnePlus Pad Go", "base_price": 19999},
        {"id": 64, "name": "OnePlus Pad", "base_price": 35999},
        {"id": 65, "name": "Xiaomi Pad 6", "base_price": 26999},
        {"id": 66, "name": "Apple Watch Series 9", "base_price": 41900},
        {"id": 67, "name": "Apple Watch Series 9", "base_price": 44900},
        {"id": 68, "name": "Apple Watch SE", "base_price": 29900},
        {"id": 69, "name": "Apple Watch SE", "base_price": 26900},
        {"id": 70, "name": "Apple Watch Ultra 2 GPS + Cellular", "base_price": 89900},
        {"id": 71, "name": "Samsung Galaxy Watch 6 Bluetooth", "base_price": 33999},
        {"id": 72, "name": "Samsung Galaxy Watch 6 Bluetooth", "base_price": 29999},
        {"id": 73, "name": "Samsung Galaxy Watch 6 Classic LTE", "base_price": 43999},
        {"id": 74, "name": "Samsung Galaxy Watch 4 Bluetooth", "base_price": 12999},
        {"id": 75, "name": "Garmin Forerunner 55 GPS Running Watch", "base_price": 22990},
        {"id": 76, "name": "Garmin Venu 3 GPS", "base_price": 44990},
        {"id": 77, "name": "Fitbit Charge 6 Health & Fitness Tracker", "base_price": 14999},
        {"id": 78, "name": "Fitbit Luxe Fitness & Wellness Tracker", "base_price": 9999},
        {"id": 79, "name": "Casio G-Shock Analog-Digital Black Watch", "base_price": 9995},
        {"id": 80, "name": "Casio G-Shock Classic Digital Resin Watch", "base_price": 5995},
        {"id": 81, "name": "Casio Vintage Digital Dial Unisex Watch", "base_price": 1695},
        {"id": 82, "name": "Casio Vintage Digital Gold Dial Watch", "base_price": 5995},
        {"id": 83, "name": "Casio Edifice Chronograph Black Dial Steel Watch", "base_price": 11995},
        {"id": 84, "name": "Casio Enticer Men's Analog Stainless Steel Watch", "base_price": 3295},
        {"id": 85, "name": "Tissot PRX Powermatic 80 Blue Dial Steel Watch", "base_price": 68000},
        {"id": 86, "name": "Seiko 5 Sports Automatic Analog Steel Watch", "base_price": 25000},
        {"id": 87, "name": "Seiko Essentials Chronograph Dial Stainless Steel Watch", "base_price": 21000},
        {"id": 88, "name": "Citizen Eco-Drive Aviator Green Dial Watch", "base_price": 15999},
        {"id": 89, "name": "Fossil Gen 6", "base_price": 24995},
        {"id": 90, "name": "Fossil Grant Chronograph Blue Dial Leather Watch", "base_price": 12495},
        {"id": 91, "name": "Noise ColorFit Pro 5", "base_price": 4999},
        {"id": 92, "name": "Noise ColorFit Pulse 4", "base_price": 3499},
        {"id": 93, "name": "boAt Wave Sigma", "base_price": 2499},
        {"id": 94, "name": "boAt Lunar Oasis", "base_price": 3499},
        {"id": 95, "name": "Fastrack Limitless FS1", "base_price": 2999},
        {"id": 96, "name": "Nike Air Max Solo Sneakers", "base_price": 8495},
        {"id": 97, "name": "Nike Air Jordan 1 Low Sneakers", "base_price": 8995},
        {"id": 98, "name": "Nike Air Force 1 '07 Sneakers", "base_price": 9695},
        {"id": 99, "name": "Nike Air Zoom Pegasus 40 Running Shoes", "base_price": 11495},
        {"id": 100, "name": "Nike Court Vision Low Next Nature Sneakers", "base_price": 5995},
        {"id": 101, "name": "Adidas Ultraboost Light Running Shoes", "base_price": 19999},
        {"id": 102, "name": "Adidas Originals Superstar Sneakers", "base_price": 8999},
        {"id": 103, "name": "Adidas Samba OG Shoes", "base_price": 10999},
        {"id": 104, "name": "Adidas Ultraboost 1.0 Lifestyle Running Shoes", "base_price": 17999},
        {"id": 105, "name": "Adidas Stan Smith Classic Sneakers", "base_price": 7999},
        {"id": 106, "name": "Puma Classic Suede Black Sneaker Shoes", "base_price": 6999},
        {"id": 107, "name": "Puma Velocity Nitro 3 Running Shoes", "base_price": 11999},
        {"id": 108, "name": "Puma RS-X Reinvent Sneakers", "base_price": 9999},
        {"id": 109, "name": "Puma Smashic Unisex White Sneakers", "base_price": 3999},
        {"id": 110, "name": "Puma Deviate Nitro 2 Carbon-Plated Running Shoes", "base_price": 15999},
        {"id": 111, "name": "Reebok Classic Leather Sneakers", "base_price": 6999},
        {"id": 112, "name": "Reebok Floatride Energy 5 Running Shoes", "base_price": 8999},
        {"id": 113, "name": "Reebok Club C 85 Vintage Sneakers", "base_price": 7999},
        {"id": 114, "name": "Woodland Men's Camel High-Ankle Suede Leather Shoes", "base_price": 4295},
        {"id": 115, "name": "Woodland Olive Green Suede Leather Loafers", "base_price": 3795},
        {"id": 116, "name": "Crocs Unisex Classic Clog", "base_price": 2995},
        {"id": 117, "name": "Crocs Unisex LiteRide 360 Clogs", "base_price": 4995},
        {"id": 118, "name": "Under Armour Charged Assert 10 Running Shoes", "base_price": 6999},
        {"id": 119, "name": "Under Armour Hovr Sonic 6 Running Shoes", "base_price": 11999},
        {"id": 120, "name": "Asics Gel-Kayano 30 Premium Stability Running Shoes", "base_price": 15999},
        {"id": 121, "name": "Asics Gel-Nimbus 26 Premium Cushioned Running Shoes", "base_price": 17999},
        {"id": 122, "name": "Asics Gel-Nimbus 25 Cushioned Running Shoes", "base_price": 15999},
        {"id": 123, "name": "Skechers Go Walk Max Men's Slip-On Walking Shoes", "base_price": 4799},
        {"id": 124, "name": "Skechers D'Lites Bold Lifestyle Chunky Sneakers", "base_price": 6499},
        {"id": 125, "name": "Red Tape Classic Men's White Leather Sneakers", "base_price": 1999},
        {"id": 126, "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", "base_price": 29990},
        {"id": 127, "name": "Sony WH-1000XM4 Wireless ANC Over-Ear Headphones", "base_price": 19990},
        {"id": 128, "name": "Sony WH-CH720N Wireless Over-Ear ANC Headphones", "base_price": 9990},
        {"id": 129, "name": "Sony WF-1000XM5 Premium Noise Cancelling Earbuds", "base_price": 24990},
        {"id": 130, "name": "Sony WF-C700N Wireless ANC Earbuds", "base_price": 8990},
        {"id": 131, "name": "Sony LinkBuds S WF-LS900N Wireless ANC Earbuds", "base_price": 13990},
        {"id": 132, "name": "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones", "base_price": 35900},
        {"id": 133, "name": "Bose QuietComfort Wireless Over-Ear Headphones", "base_price": 29900},
        {"id": 134, "name": "Bose QuietComfort Ultra Wireless ANC Earbuds", "base_price": 25900},
        {"id": 135, "name": "Apple AirPods Pro", "base_price": 24900},
        {"id": 136, "name": "Apple AirPods Max Over-Ear Wireless Headphones", "base_price": 59900},
        {"id": 137, "name": "Apple AirPods", "base_price": 19900},
        {"id": 138, "name": "Sennheiser Accentum Wireless ANC Headphones", "base_price": 12990},
        {"id": 139, "name": "Sennheiser Momentum 4 Wireless ANC Headphones", "base_price": 34990},
        {"id": 140, "name": "Sennheiser Momentum True Wireless 4 ANC Earbuds", "base_price": 24990},
        {"id": 141, "name": "JBL Flip 6 Waterproof Portable Bluetooth Speaker", "base_price": 11999},
        {"id": 142, "name": "JBL Charge 5 Portable Waterproof Speaker", "base_price": 15999},
        {"id": 143, "name": "JBL Go 4 Pocket-Sized Waterproof Bluetooth Speaker", "base_price": 3999},
        {"id": 144, "name": "Marshall Kilburn II Portable Wireless Speaker", "base_price": 29999},
        {"id": 145, "name": "Marshall Emberton II Portable Bluetooth Speaker", "base_price": 17999},
        {"id": 146, "name": "Marshall Acton III Home Bluetooth Speaker", "base_price": 28999},
        {"id": 147, "name": "boAt Stone 350 Portable Wireless Speaker", "base_price": 1999},
        {"id": 148, "name": "boAt Rockerz 450 Bluetooth On-Ear Headphones", "base_price": 1499},
        {"id": 149, "name": "boAt Rockerz 255 Pro+ Wireless Neckband", "base_price": 1299},
        {"id": 150, "name": "boAt Airdopes 131 Wireless Earbuds", "base_price": 1199},
        {"id": 151, "name": "OnePlus Buds 3 Premium ANC Earbuds", "base_price": 5499},
        {"id": 152, "name": "OnePlus Nord Buds 2r Wireless Earbuds", "base_price": 2199},
        {"id": 153, "name": "Realme Buds Air 5 Pro Dual-Coil ANC Earbuds", "base_price": 4999},
        {"id": 154, "name": "Realme Buds T300 Wireless ANC Earbuds", "base_price": 2299},
        {"id": 155, "name": "Anker Soundcore Q20i Hybrid Active Noise Cancelling", "base_price": 4999},
        {"id": 156, "name": "Sony PlayStation 5 Console", "base_price": 54990},
        {"id": 157, "name": "Sony PlayStation 5 Digital Edition", "base_price": 44990},
        {"id": 158, "name": "Sony PlayStation VR2 Headset & Horizon Bundle", "base_price": 57990},
        {"id": 159, "name": "Sony DualSense Wireless Controller", "base_price": 5990},
        {"id": 160, "name": "Sony DualSense Edge Wireless Pro Controller", "base_price": 18990},
        {"id": 161, "name": "Nintendo Switch OLED Model", "base_price": 32990},
        {"id": 162, "name": "Nintendo Switch Lite", "base_price": 17990},
        {"id": 163, "name": "Nintendo Switch Joy-Con Pair", "base_price": 7490},
        {"id": 164, "name": "Xbox Series X Console", "base_price": 55990},
        {"id": 165, "name": "Xbox Series S", "base_price": 34990},
        {"id": 166, "name": "Xbox Wireless Controller", "base_price": 5590},
        {"id": 167, "name": "ASUS ROG Ally Handheld Gaming Console", "base_price": 69990},
        {"id": 168, "name": "Lenovo Legion Go Handheld Console", "base_price": 89990},
        {"id": 169, "name": "Steam Deck OLED Handheld Console", "base_price": 59990},
        {"id": 170, "name": "Sony PlayStation 5 Console Pulse 3D Headset", "base_price": 8590},
        {"id": 171, "name": "Dyson V11 Absolute Pro Cord-Free Vacuum Cleaner", "base_price": 52900},
        {"id": 172, "name": "Dyson V8 Absolute Cord-Free Vacuum Cleaner", "base_price": 34900},
        {"id": 173, "name": "Dyson Purifier Cool Gen1 Smart Air Purifier", "base_price": 32900},
        {"id": 174, "name": "Dyson Supersonic Hair Dryer", "base_price": 39900},
        {"id": 175, "name": "Philips Air Fryer HD9200/90", "base_price": 7999},
        {"id": 176, "name": "Philips HD9252/90 Air Fryer", "base_price": 9999},
        {"id": 177, "name": "Philips EasySpeed Plus 2400W Steam Iron", "base_price": 3499},
        {"id": 178, "name": "Philips GC1905 1440W Steam Iron with Spray", "base_price": 1999},
        {"id": 179, "name": "Philips Daily Collection HD9306/06 Kettle", "base_price": 1499},
        {"id": 180, "name": "Philips Viva Collection HD4928/01 Induction Cooktop", "base_price": 3499},
        {"id": 181, "name": "Echo Dot", "base_price": 5499},
        {"id": 182, "name": "Echo Dot", "base_price": 4499},
        {"id": 183, "name": "Echo Show 8", "base_price": 13999},
        {"id": 184, "name": "Echo Show 5", "base_price": 8999},
        {"id": 185, "name": "Amazon Fire TV Stick Lite with Alexa Voice Remote", "base_price": 3999},
        {"id": 186, "name": "Mi Smart Air Purifier 4", "base_price": 15999},
        {"id": 187, "name": "Mi Smart Air Purifier 4 Lite", "base_price": 9999},
        {"id": 188, "name": "Mi Smart TV X50", "base_price": 32999},
        {"id": 189, "name": "Samsung 55-inch The Frame 4K Ultra HD Smart QLED TV", "base_price": 89990},
        {"id": 190, "name": "Samsung 43-inch Crystal 4K Ultra HD Smart LED TV", "base_price": 32990},
        {"id": 191, "name": "Samsung 65-inch Crystal 4K Vivid Smart TV", "base_price": 62990},
        {"id": 192, "name": "Sony Bravia 65-inch 4K Ultra HD Smart LED TV", "base_price": 99990},
        {"id": 193, "name": "Sony Bravia 55-inch 4K Ultra HD Smart Google TV", "base_price": 59990},
        {"id": 194, "name": "OnePlus 43-inch Y1S Pro 4K Ultra HD Smart Android TV", "base_price": 29999},
        {"id": 195, "name": "Havells Instanio 3-Litre Instant Water Heater", "base_price": 3899},
        {"id": 196, "name": "Bajaj New Shakti Neo 15-Litre Storage Water Heater", "base_price": 6499},
        {"id": 197, "name": "Crompton Energion HS 5-Star 1200mm BLDC Ceiling Fan", "base_price": 3299},
        {"id": 198, "name": "Orient Electric Apex-FX 1200mm Ceiling Fan", "base_price": 1599},
        {"id": 199, "name": "Voltas 1.5 Ton 5 Star Split Inverter AC", "base_price": 37990},
        {"id": 200, "name": "Mi Smart Home Security Camera 360", "base_price": 2999}
    ]
    
    records = []
    start_date = datetime.date(2026, 2, 22) # 90 days before May 23, 2026
    
    for day_idx in range(91):
        current_date = start_date + datetime.timedelta(days=day_idx)
        
        # Determine if a seasonal sale is active (e.g., Day 40 to 50 represent holiday sales)
        is_sale_season = 1 if (40 <= day_idx <= 50) else 0
        sale_discount = 0.15 * np.sin(np.pi * (day_idx - 40) / 10) if is_sale_season else 0.0
        
        # Long term depreciation trend (prices slowly drop by 5% over 90 days)
        trend = 1 - (0.05 * (day_idx / 90))
        
        for prod in products:
            base = prod["base_price"] * trend
            
            # Weekend drops for Flipkart, weekday drops for Amazon
            day_of_week = current_date.weekday()
            amz_weekend_mod = 0.99 if day_of_week >= 5 else 0.975 # Weekday drops on Amazon
            fk_weekend_mod = 0.97 if day_of_week >= 5 else 0.995 # Weekend drops on Flipkart
            
            # Organic random price fluctuations (noise ± 1%)
            amz_noise = np.random.uniform(-0.01, 0.01)
            fk_noise = np.random.uniform(-0.01, 0.01)
            
            # Calculate final prices
            amz_price = base * (1 - sale_discount * 0.95) * amz_weekend_mod * (1 + amz_noise)
            fk_price = base * (1 - sale_discount * 1.05) * fk_weekend_mod * (1 + fk_noise)
            
            records.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day_index": day_idx,
                "product_id": prod["id"],
                "product_name": prod["name"],
                "base_original_price": prod["base_price"],
                "amazon_price": int(np.round(amz_price / 10) * 10),
                "flipkart_price": int(np.round(fk_price / 10) * 10),
                "is_sale_season": is_sale_season,
                "day_of_week": day_of_week,
                "day_of_month": current_date.day
            })
            
    df = pd.DataFrame(records)
    csv_path = "historical_prices.csv"
    df.to_csv(csv_path, index=False)
    print(f"--> Dataset successfully saved to '{csv_path}' ({len(df)} records).")
    return df

def train_and_evaluate_models(df):
    """
    Performs feature engineering, splits data, trains Random Forest & Linear Regression,
    prints comparative diagnostics, and serializes the model.
    """
    print("\n[2/5] Performing feature engineering & model training...")
    
    # We will train our model specifically on Product 1 (Apple iPhone 15 Pro) Amazon prices
    # as a clear demonstration of time-series predictive modeling.
    model_df = df[df["product_id"] == 1].copy()
    
    # Feature columns: day_index, is_sale_season, day_of_week, day_of_month
    X = model_df[["day_index", "is_sale_season", "day_of_week", "day_of_month"]]
    y = model_df["amazon_price"]
    
    # Split into train and test sets (80% training, 20% validation)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
    print(f"--> Training set size: {len(X_train)} days, Testing set size: {len(X_test)} days.")
    
    # 1. Train Linear Regression Model (baseline)
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)
    lr_preds = lr_model.predict(X_test)
    
    # 2. Train Random Forest Regressor Model (primary ML model)
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=6)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    
    # Model evaluation
    print("\n[3/5] Evaluating Machine Learning Model performance:")
    print("-------------------------------------------------------")
    print(f"Linear Regression baseline R2 Score : {r2_score(y_test, lr_preds):.4f}")
    print(f"Linear Regression baseline MAE      : Rs. {mean_absolute_error(y_test, lr_preds):.2f}")
    
    rf_r2 = r2_score(y_test, rf_preds)
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))
    
    print(f"Random Forest Regressor R2 Score    : {rf_r2:.4f} (Fit accuracy)")
    print(f"Random Forest Regressor MAE         : Rs. {rf_mae:.2f} (Avg absolute error)")
    print(f"Random Forest Regressor RMSE        : Rs. {rf_rmse:.2f} (Root Mean Squared Error)")
    print("-------------------------------------------------------")
    
    # Serialize the trained Random Forest model
    model_pickle_path = "price_predictor_model.pkl"
    with open(model_pickle_path, "wb") as f:
        pickle.dump(rf_model, f)
    print(f"--> Serialized ML model successfully saved to '{model_pickle_path}'.")
    
    return rf_model, X, y, model_df

def forecast_future_prices(rf_model, last_day_index, last_date_str):
    """
    Forecasts the next 30 days of prices using the trained Random Forest model.
    Accounts for simulated upcoming holiday sale factors.
    """
    print("\n[4/5] Executing 30-day ahead predictive forecasting...")
    
    last_date = datetime.datetime.strptime(last_date_str, "%Y-%m-%d").date()
    future_records = []
    
    for h in range(1, 31):
        future_day_idx = last_day_index + h
        future_date = last_date + datetime.timedelta(days=h)
        
        # Assume an upcoming promotional sale is active from Day 10 to Day 20 of forecast
        # (This showcases the model's ability to incorporate seasonal event signals)
        future_sale = 1 if (12 <= h <= 20) else 0
        
        future_records.append({
            "day_index": future_day_idx,
            "is_sale_season": future_sale,
            "day_of_week": future_date.weekday(),
            "day_of_month": future_date.day,
            "date": future_date.strftime("%Y-%m-%d")
        })
        
    future_df = pd.DataFrame(future_records)
    X_future = future_df[["day_index", "is_sale_season", "day_of_week", "day_of_month"]]
    
    # Predict future prices
    predicted_prices = rf_model.predict(X_future)
    future_df["predicted_price"] = np.round(predicted_prices / 10) * 10
    
    print("--> 30-day forecast computed. Sample predictions:")
    for idx, row in future_df.head(5).iterrows():
        print(f"    Date: {row['date']} | Pred Price: Rs. {int(row['predicted_price'])} | Sale Season Flag: {row['is_sale_season']}")
        
    return future_df

def plot_and_visualize(model_df, future_df):
    """
    Plots historical prices alongside the predicted 30-day future forecasting curve.
    Saves the visualization plot as 'price_forecast_plot.png'.
    """
    print("\n[5/5] Visualizing pricing trends & saving forecast plots...")
    
    plt.figure(figsize=(12, 6))
    
    # Plot historical actuals
    plt.plot(model_df["date"], model_df["amazon_price"], label="Historical Actual Price (Amazon India)", color="#3b82f6", linewidth=2)
    
    # Plot upcoming forecasts
    plt.plot(future_df["date"], future_df["predicted_price"], label="Random Forest 30-Day Forecast", color="#8b5cf6", linewidth=2.5, linestyle="--")
    
    # Draw a line indicating "Today"
    plt.axvline(x=model_df["date"].max(), color="#ef4444", linestyle=":", label="Today (May 23, 2026)", linewidth=1.5)
    
    # Style details
    plt.title("Apple iPhone 15 Pro - Price Trend Analysis & ML Forecast", fontsize=14, fontweight="bold")
    plt.xlabel("Date", fontsize=11)
    plt.ylabel("Price (INR ₹)", fontsize=11)
    
    # Reduce date ticks on x-axis for neatness
    ax = plt.gca()
    plt.xticks(rotation=45)
    every_nth = 10
    for n, label in enumerate(ax.xaxis.get_ticklabels()):
        if n % every_nth != 0:
            label.set_visible(False)
            
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(loc="upper right", frameon=True)
    plt.tight_layout()
    
    plot_path = "price_forecast_plot.png"
    plt.savefig(plot_path, dpi=300)
    print(f"--> Matplotlib forecast trend plot successfully saved to '{plot_path}'.")
    plt.close()

if __name__ == "__main__":
    print("=======================================================")
    print("      DealMate AI/ML Internship Working Model Script    ")
    print("=======================================================")
    
    # Execute full pipeline
    df = generate_ecom_dataset()
    rf_model, X, y, model_df = train_and_evaluate_models(df)
    
    last_day_idx = model_df["day_index"].max()
    last_date_str = model_df["date"].max()
    future_df = forecast_future_prices(rf_model, last_day_idx, last_date_str)
    
    plot_and_visualize(model_df, future_df)
    
    print("\n=======================================================")
    print("  Working ML Model is complete! deliverables exported.  ")
    print("  1. CSV Dataset: 'historical_prices.csv'              ")
    print("  2. Serialized Model: 'price_predictor_model.pkl'     ")
    print("  3. Matplotlib Visual Plot: 'price_forecast_plot.png'")
    print("=======================================================")
