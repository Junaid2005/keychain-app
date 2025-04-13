import requests
import time
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyAlWcXwbuP2WG1Xjq8shCrt4D2h3jLWeU0"

# Set up the Gemini API and model
genai.configure(api_key=GEMINI_API_KEY)
#bot = Bot(token=TELEGRAM_BOT_TOKEN)
model = genai.GenerativeModel('gemini-1.5-pro-latest')

collections = {
    "FounderAccessPass": "founderaccesspass",
    "ZKRace Horses": "zkrace-horses",
    "Darth Samurai": "darth-samurai",
    "Extraordinary Attorney Woo": "extraordinary-attorney-woo",
    "LokDrago Polygon": "lokdrago-polygon",
    "ORL Ocean Racers": "orl-ocean-racers",
    "Hellboy Avatars": "hellboy-avatars",
    "Forest Knight": "forest-knight",
    "Trump Digital Trading Cards Series 2": "trump-digital-trading-cards-series-2",
    "Courtyard NFT": "courtyard-nft"
}

headers = {
    "accept": "application/json",
    "X-API-KEY": "32eb0141b4aa4ceabbac56d35824fe57"
}

# Function to get data from OpenSea
def get_opensea_data():
    collection_data = {}
    for name, slug in collections.items():
        url = f"https://api.opensea.io/api/v2/collections/{slug}/stats"
        response = requests.get(url, headers=headers)
        data = response.json()

        collection_data[name] = {
            "one_day": {},
            "seven_day": {}
        }

        intervals = data.get("intervals", [])
        for interval in intervals:
            interval_name = interval.get("interval")
            if interval_name in ["one_day", "seven_day"]:
                collection_data[name][interval_name] = {key.replace('_', ' ').capitalize(): value for key, value in interval.items() if key != "interval"}

        time.sleep(0.5)  # To respect API rate limits
    return collection_data

# Function to send data to Gemini for analysis and get multiplier
def get_multiplier_from_gemini(collection_data):
    prompt = f"""Please analyze the following OpenSea data for each collection and provide a multiplier to apply to NFTs on Polygon based on the market trends.
    remember to only send a multiplyer thats all you send back nothing else this is very important just send the number thats it
    {collection_data}"""

    # # Send the prompt to Gemini API for analysis
    # response = model.chat(messages=[{'role': 'user', 'content': prompt}])
    # multiplier = response['choices'][0]['message']['content']  # Assuming response contains the multiplier

    response = model.generate_content(prompt)
    return response.text

# Main function to orchestrate the process
def main():
    # Get the latest data from OpenSea
    collection_data = get_opensea_data()

    # Send data to Gemini for analysis and get the multiplier
    multiplier = get_multiplier_from_gemini(collection_data)
    return str(multiplier)  

    # Here, you can apply the multiplier to your NFTs on Polygon
    # For example, you can multiply your Polygon NFT values using the multiplier
    # Apply your multiplier to NFT prices or any other logic for your Polygon NFTs

multiplier_value = main().strip()
