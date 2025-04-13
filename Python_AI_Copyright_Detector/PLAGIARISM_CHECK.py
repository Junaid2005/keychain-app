import requests
import time
from datetime import datetime
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from google import genai
import json
import os
import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()
possible_plagirised_nfts = []

def update_data(wallet_address, new_link, link_type):
    url = os.getenv("DATABASE_URL")
    key = os.getenv("SUPABASS")
    supabase: Client = create_client(url, key)

    data_field = 'data'  # specify the correct field name in your table for storing the URLs
    result = supabase.table("ai_copyright").select("wallet_address", data_field).eq("wallet_address", wallet_address).execute()

    if result.data:
        existing_data = result.data[0].get(data_field, "")
        original_tag = "---original---"
        plagiarised_tag = "---plagiarised---"

        # Handling 'original' links
        if link_type == "original":
            # Check if original_tag exists, if not, add it
            if original_tag not in existing_data:
                existing_data += f"\n{original_tag}\n{new_link}"
            else:
                # If original_tag exists, check if the link is already present
                if new_link not in existing_data:
                    existing_data = existing_data.replace(original_tag, original_tag + f"\n{new_link}")

        # Handling 'plagiarised' links
        elif link_type == "plagiarised":
            # Check if plagiarised_tag exists, if not, add it
            if plagiarised_tag not in existing_data:
                existing_data += f"\n{plagiarised_tag}\n{new_link}"
            else:
                # If plagiarised_tag exists, check if the link is already present
                if new_link not in existing_data:
                    existing_data = existing_data.replace(plagiarised_tag, plagiarised_tag + f"\n{new_link}")

        # Now update the database with the new data
        supabase.table("ai_copyright").update({data_field: existing_data}).eq("wallet_address", wallet_address).execute()
        print(f"✅ Updated {wallet_address} with new {link_type} link")
    else:
        print(f"❌ No entry found for {wallet_address}")
def update_ai_copyright_users():
    url = os.getenv("DATABASE_URL")
    key = os.getenv("SUPABASS")
    supabase: Client = create_client(url, key)
    created_nfts = []
    try:
        response = supabase.table("audio_nft_tokens").select("*").order("token_id", desc=False).execute()
        if not response.data:
            print("❌ No data found.")
            return []
        for nft in response.data:
            nft_dict = dict(nft)
            contract_address = nft_dict.get("data", {}).get("contractAddress", None)
            owner_address = nft_dict.get("data", {}).get("ownerAddress", None)
            token_id = nft_dict.get("data", {}).get("tokenId", nft_dict.get("token_id", None))
            nft_name = nft_dict.get("data", {}).get("name", "Unnamed NFT")
            if contract_address and owner_address and token_id:
                created_nfts.append([nft_name, owner_address, contract_address, str(token_id)])
                wallet_address_normalized = owner_address.lower()
                existing = supabase.table("ai_copyright").select("wallet_address").execute()
                existing_owners = {entry['wallet_address'].lower() for entry in existing.data}
                if wallet_address_normalized not in existing_owners:
                    try:
                        supabase.table("ai_copyright").insert({
                            "wallet_address": wallet_address_normalized,
                            "data": "---original---\n---plagiarised---",
                        }).execute()
                        print(f"✅ Added {owner_address} to ai_copyright")
                        existing_owners.add(wallet_address_normalized)
                    except Exception as inner_e:
                        if "duplicate key" in str(inner_e):
                            print(f"⚠️ Skipping duplicate: {owner_address}")
                        else:
                            print(f"❌ Error inserting {owner_address}: {inner_e}")
        if not created_nfts:
            print("❌ No new NFTs found to process.")
    except Exception as e:
        print(f"❌ Error occurred: {e}")
    return created_nfts
def compare_attributes_with_gemini(original_attr, new_attr):
    try:
        # Construct the prompt to compare the original attributes with the new one
        prompt = f"""
        You are an AI that compares NFT attributes.

        Original NFT Attributes:
        {json.dumps(original_attr, indent=4)}

        New NFT Attributes:
        {json.dumps(new_attr, indent=4)}

        Compare the two attributes and respond with only "True" if they are the same or very similar, otherwise respond with "False". No other text or explanation is required.
        """
        
        client = genai.Client(api_key=os.getenv("GEMINI"))
        response = client.models.generate_content(
            model="gemini-2.0-flash",  # Specify the correct Gemini model
            contents=prompt
        )

        result_text = response.text.strip().lower()
        
        # Check if the response is "true" or "false"
        if result_text == "true":
            return True
        else:
            return False

    except Exception as e:
        print(f"⚠️ Error during Gemini comparison: {e}")
        return False
def get_nft_date(contract_address: str,chain: str, token_id: str):
    # Normalize 'ethereum' to 'eth' for Moralis
    if chain.lower() == "ethereum":
        chain = "eth"

    url = f"https://deep-index.moralis.io/api/v2.2/nft/{contract_address}/{token_id}/transfers"
    headers = {
        "accept": "application/json",
        "x-api-key": os.getenv("MORALIS")
    }

    params = {
        "chain": chain
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        print(f"❌ Failed to fetch transfers. Status Code: {response.status_code}")
        return None

    transfer_data = response.json().get("result", [])
    
    if not transfer_data:
        print("⚠️ No transfers found for this token.")
        return None

    # Sort by the earliest timestamp
    transfer_data.sort(key=lambda x: x.get("block_timestamp", ""))

    first_transfer = transfer_data[0]
    block_date = first_transfer.get("block_timestamp", "Unknown")
    return block_date
def get_nft_attributes(nft_type, address, identifier):
    headers = {
        "accept": "application/json",
        "x-api-key": os.getenv("OPENSEA")
    }

    url = f"https://api.opensea.io/api/v2/chain/{nft_type}/contract/{address}/nfts/{identifier}"
    response = requests.get(url, headers=headers)
    return response.text
def search_opensea(search_term):
    options = uc.ChromeOptions()
    # options.add_argument("--headless")  # Enable this for headless mode
    driver = uc.Chrome(options=options)
    driver.get("https://opensea.io/os2")

    try:
        # Close popups if any
        close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//*[contains(text(),'X') or @aria-label='Close']"))
        )
        close_button.click()
        time.sleep(0.1)

        # Trigger search
        body_elem = driver.find_element(By.TAG_NAME, "body")
        body_elem.send_keys("/")
        time.sleep(0.1)

        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'Search')]"))
        )
        search_box.clear()
        search_box.send_keys(search_term + Keys.RETURN)
        time.sleep(0.5)

        container = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="ExpandedSearchMenuItems"]'))
        )

        items = container.find_elements(By.TAG_NAME, "a")
        if items:
            for idx, item in enumerate(items, start=1):
                href = item.get_attribute("href").split("/")
                nft_type, address, token_id = href[4], href[5], href[6]
                attributes = get_nft_attributes(nft_type, address, token_id)
                transaction_date = get_nft_date(address, nft_type, token_id)
                
                possible_plagirised_nfts.append([address,token_id,transaction_date,nft_type, attributes])
                
        else:
            print("No items were found within the container.")
    except Exception as e:
        print("An error occurred:")
    finally:
        driver.quit()

    return possible_plagirised_nfts
def save_attributes_to_file(original_attrs, plagiarised_attrs, base_folder="plagarised_nfts", base_filename="plagiarism_comparison"):
    # Create folder if it doesn't exist
    os.makedirs(base_folder, exist_ok=True)
    # Find next available file index
    i = 1
    while os.path.exists(os.path.join(base_folder, f"{base_filename}_{i}.txt")):
        i += 1
    filename = os.path.join(base_folder, f"{base_filename}_{i}.txt")
    # Write attributes to the file
    with open(filename, "w", encoding="utf-8") as f:
        f.write("---------------------original---------------------\n")
        f.write(f"{original_attrs}\n\n")
        f.write("---------------------plagiarised---------------------\n")
        f.write(f"{plagiarised_attrs}\n\n")

if __name__ == '__main__':
    created_nfts = update_ai_copyright_users()
    for original_nft_name, original_owner_address, original_contract_address, original_token_id in created_nfts[::-1]:
        
        user_type = "matic" ## will always be matic
        original_attributes = get_nft_attributes(user_type, original_contract_address, original_token_id)
        original_date_and_index = get_nft_date(original_contract_address, user_type,original_token_id)
        original_date = datetime.strptime(original_date_and_index, "%Y-%m-%dT%H:%M:%S.%fZ")

        print("------------------------ NFT TO COMPARE: "+original_nft_name+"-----------------------")
        print("https://opensea.io/item/"+user_type+"/"+original_contract_address+"/"+original_token_id)
        print(original_date)
        print("------------------------------------------------------------------------------------\n\n")
        update_data(original_owner_address.lower(), "https://opensea.io/item/"+user_type+"/"+original_contract_address+"/"+original_token_id, "original")


        possible_plagirised_nfts = search_opensea(original_nft_name)
        for entries in possible_plagirised_nfts:
            address, token_id, date, nft_type, attributes = entries[0], entries[1], entries[2], entries[3], entries[4]
            if date == None:
                continue
            date = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")  # Convert date string to datetime object
            if date > original_date:
                
                if (compare_attributes_with_gemini(original_attributes,attributes)):
                    print("Newer:","https://opensea.io/item/"+nft_type+"/"+address+"/"+token_id,"PLAGARISED!")
                    update_data(original_owner_address.lower(), "https://opensea.io/item/"+nft_type+"/"+address+"/"+token_id, "plagiarised")
                    save_attributes_to_file(original_attributes, attributes)
                else:
                    print("Newer:", "https://opensea.io/item/"+nft_type+"/"+address+"/"+token_id, date)
            elif date == original_date: #itself
                print("Same date:", "https://opensea.io/item/"+nft_type+"/"+address+"/"+token_id, date)
            else:
                print("Older:","https://opensea.io/item/"+nft_type+"/"+address+"/"+token_id, date)
        
        print("\n\n------Next entry------\n\n")
