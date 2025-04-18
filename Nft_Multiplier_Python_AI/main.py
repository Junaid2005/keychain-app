import os
import json
import requests
from google import genai
from datetime import datetime
from supabase import create_client, Client

# Constants
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Supabase client
url = SUPABASE_URL
key = SUPABASE_SERVICE_ROLE_KEY
supabase = create_client(url, key)

# NFT Collections with their contract addresses and specific token IDs
COLLECTIONS = {
    "Pudgy Penguin": ("0xbd3531da5cf5857e7cfaa92426877b022e612cf8", 8333),
    "CryptoPunks": ("0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb", 5813),
    "Mutant Ape Yacht Club": ("0x60e4d786628fea6478f785a6d7e704777c86a7c6", 5498),
    "Doodles": ("0x8a90cab2b38dba80c64b7734e58ee1db38b8992e", 9753),
    "Creepz by OVERLORD": ("0x5946aeaab44e65eb370ffaa6a7ef2218cff9b47d", 2387),
    "Milady Maker": ("0x5af0d9827e0c53e4799bb226655a1de152a425a5", 3471),
    "Bored Ape Yacht Club": ("0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", 9874),
    "Otherside Koda": ("0xe012baf811cf9c05c408e879c399960d1f305903", 548),
    "Grifters": ("0xc143bbfcdbdbed6d454803804752a064a622c1f3", 332),
    "Lil Pudgys": ("0x524cab2ec69124574082676e6f654a18df49a048", 2669)
}

def fetch_nft(contract_address: str, token_id: int) -> dict | None:
    """
    Fetches NFT metadata from OpenSea for a given contract address and token ID.
    """
    url = (
        f"https://api.opensea.io/api/v2/chain/ethereum/"
        f"contract/{contract_address}/nfts/{token_id}"
    )
    headers = {
        "accept": "application/json",
        "x-api-key": OPENSEA_API_KEY
    }

    try:
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        print(f"✅ Fetched token #{token_id} for contract {contract_address}")
        return resp.json()
    except requests.exceptions.HTTPError as e:
        print(f"❌ Error fetching token #{token_id}: {e}")
        return None

def send_to_gemini(nft_data_list: list) -> float:
    """
    Sends NFT metadata to Gemini API to obtain a multiplier.
    """
    # Initialize the Gemini API client
    client = genai.Client(api_key=GEMINI_API_KEY)

    # Create the content to send (this can be customized as needed)
    contents = f"Analyze these NFTs data and return only a numeric multiplier: {json.dumps(nft_data_list)}"
    
    # Generate content using the Gemini API
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents
        )
        # Extract the numeric multiplier from the response
        multiplier = float(response.text.strip())
        print(f"🔢 Received multiplier: {multiplier}")
        return multiplier
    except Exception as e:
        print(f"❌ Error fetching multiplier from Gemini API: {e}")
        return 1.0

def delete_and_insert_to_supabase(multiplier: float) -> None:
    """
    Deletes existing data with id=1 and inserts new data with the current time and multiplier.
    """
    # Ensure the table exists before proceeding
    try:
        table_exists = supabase.table("multiplier").select("*").execute()
    except Exception as e:
        table_exists = None
        print(f"❌ Error checking table existence: {e}")
    
    if not table_exists or "error" in table_exists.data:
        print(f"❌ Table nft_data does not exist, creating it...")
        # Create the table if it does not exist
        try:
            response_create_table = supabase.query(
                """
                CREATE TABLE IF NOT EXISTS nft_data (
                    id SERIAL PRIMARY KEY,
                    latest text,
                    multiplier text
                );
                """
            ).execute()
            if response_create_table.status_code == 200:
                print("✅ Table created successfully.")
            else:
                print(f"❌ Error creating table: {response_create_table.status_code}")
                return
        except Exception as e:
            print(f"❌ Error creating table: {e}")
            return

    # Delete existing row with id=1
    try:
        response_delete = (
            supabase.table("nft_data")
            .delete()
            .eq("id", 1)
            .execute()
        )
        if response_delete.status_code == 200:
            print(f"💾 Deleted existing data with id=1 successfully.")
        else:
            print(f"❌ Error deleting data: {response_delete.status_code}, {response_delete.data}")
            return
    except Exception as e:
        print(f"❌ Error during delete operation: {e}")
        return

    # Insert new data with current time and multiplier
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        response_insert = (
            supabase.table("nft_data")
            .insert([{
                "latest": current_time,
                "multiplier": str(multiplier)  # Ensure multiplier is inserted as a string
            }])
            .execute()
        )
        if response_insert.status_code == 200:
            print(f"💾 Data inserted successfully with latest time {current_time} and multiplier {multiplier}.")
        else:
            print(f"❌ Error inserting data: {response_insert.status_code}, {response_insert.data}")
    except Exception as e:
        print(f"❌ Error inserting data: {e}")

def main():
    # Collect all NFTs' data from OpenSea
    nft_data_list = []
    for name, (contract, token_id) in COLLECTIONS.items():
        print(f"\n🔄 Gathering NFT data from OpenSea…")
        print(f"  • Fetching {name} (contract {contract}) token #{token_id}…")
        nft_data = fetch_nft(contract, token_id)
        if nft_data:
            nft_data_list.append(nft_data)
        else:
            print(f"⚠️ Skipping {name} due to missing NFT data.")

    # Send all NFT data to Gemini to calculate multiplier
    overall_multiplier = send_to_gemini(nft_data_list)

    # Update Supabase with the overall multiplier
    delete_and_insert_to_supabase(overall_multiplier)

if __name__ == "__main__":
    main()
