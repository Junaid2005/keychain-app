import os
import re
import json
import time
import requests
from datetime import datetime, timezone
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from google import genai
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Constants
OPENSEA_API_KEY = os.getenv('OPENSEA_API_KEY')
GEMINI_API_KEY  = os.getenv('GEMINI_API_KEY')
SUPABASE_URL    = os.getenv('SUPABASE_URL')
SUPABASE_KEY    = os.getenv('SUPABASE_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# NFT Collections with slug, contract and token ID
COLLECTIONS = {
    "Pudgy Penguin":         ("pudgy-penguins",        "0xbd3531da5cf5857e7cfaa92426877b022e612cf8", 8333),
    "CryptoPunks":           ("cryptopunks",           "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb", 5813),

}

HEADERS = {
    "accept":    "application/json",
    "x-api-key": OPENSEA_API_KEY
}

def init_webdriver(headless: bool = False):
    options = uc.ChromeOptions()
    if headless:
        options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    driver = uc.Chrome(options=options)
    print(f"🖥️ undetected_chromedriver initiated (headless={headless})")
    return driver

def fetch_v2_nft_data(chain: str, contract: str, token_id: int) -> dict:
    url = f"https://api.opensea.io/api/v2/chain/{chain}/contract/{contract}/nfts/{token_id}"
    print(f"🔗 GET {url}")
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    nft = resp.json().get('nft', {})
    print(f"📦 Fetched NFT data: name={nft.get('name')}, traits={len(nft.get('traits', []))}")
    return nft

def scrape_trait_floor_prices(driver, contract: str, token_id: int) -> dict:
    page_url = f"https://opensea.io/assets/ethereum/{contract}/{token_id}"
    print(f"🌐 Navigating to {page_url}")
    driver.get(page_url)
    time.sleep(5)  # allow dynamic content to load

    elems = driver.find_elements(By.CSS_SELECTOR, '.Price--amount')
    print(f"🔍 Found {len(elems)} price elements")
    prices = {}
    for i, e in enumerate(elems, 1):
        text = e.text.strip()
        prices[f"price_{i}"] = text
        print(f"  {i}. {text}")

    return {"page_url": page_url, "prices": prices}

def send_to_gemini(nft_list: list) -> float:
    print(f"🤖 Sending {len(nft_list)} items to Gemini")
    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = (
        "You are an expert NFT market analyst. "
        "Given the following list of NFTs, each with metadata and a dictionary of scraped floor prices for their traits, "
        "calculate a multiplier factor to adjust an NFT's sale price for current dynamic market conditions. "
        "Consider these factors:\n"
        "  • Trait floor price relative to the collection floor price.\n"
        "  • Rarity of each trait (scarcer traits warrant higher multipliers).\n"
        "  • Dispersion of prices across different traits (high variance => cautious multiplier).\n"
        "  • Recency and velocity of recent sales for similar traits.\n"
        "  • Overall market trend signals (bullish vs. bearish indicators).\n"
        "Return only one floating‑point number, rounded to two decimal places, "
        "with strictly no additional commentary just a number.\n\n"
        f"NFT_DATA: {json.dumps(nft_list)}"
    )
    res = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    text = res.text
    print(f"📨 Gemini says: {text}")
    m = re.search(r"[-+]?\d*\.?\d+", text)
    return float(m.group()) if m else 1.0

def run_task():
    driver   = init_webdriver(headless=False)
    payloads = []

    for name, (slug, contract, tok) in COLLECTIONS.items():
        print(f"\n🔄 Processing {name} (#{tok})…")
        try:
            nft     = fetch_v2_nft_data('ethereum', contract, tok)
            scraped = scrape_trait_floor_prices(driver, contract, tok)
            payloads.append({
                "slug":        slug,
                "contract":    contract,
                "token_id":    tok,
                "name":        nft.get("name"),
                "description": nft.get("description"),
                "image_url":   nft.get("image_url"),
                "page_url":    scraped["page_url"],
                "prices":      scraped["prices"],
            })
        except Exception as e:
            print(f"❌ Error fetching {slug}#{tok}: {e}")

    number = send_to_gemini(payloads)
    print(f"🚀 Computed number: {number}")

    # Use timezone‑aware UTC now
    now = datetime.now(timezone.utc).isoformat()
    latest = "latest"

    print(f"💾 Writing to Supabase ‘multiplier’ (time='{latest}') → time={now}, number={number}")
    resp = (
        supabase.table("multiplier").update({"number": number}).eq("time", latest).execute()
    )

    if resp.error:
        print(f"❌ Supabase error: {resp.error}")
    else:
        print("✅ Supabase updated successfully.")

    driver.quit()

if __name__ == "__main__":
    while True:
        print("\n🕒 Starting new 24-hour cycle run...\n")
        try:
            run_task()
        except Exception as e:
            print(f"🚨 Unexpected error during run: {e}")
        finally:
            print("\n🛌 Sleeping for 24 hours...\n")
            time.sleep(24 * 60 * 60)
