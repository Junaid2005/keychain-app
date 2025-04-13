import time
from supabase import create_client

# Supabase project credentials and table information
SUPABASE_URL = "https://xfnlmjtqpuejpdxqwylp.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmxtanRxcHVlanBkeHF3eWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzg3MTU2NCwiZXhwIjoyMDU5NDQ3NTY0fQ.SjY8G4o6PR0dK_pitgB48Eu7tvMGaKP_9Egzc4r_TQA"
)
TABLE_NAME = "multiplier"
PRIMARY_KEY = "lastest"  # Name of the primary key column
row_primary_key_value = 1  # The unique ID of the row to update

# Create the Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def update_multiplier():
    # Define your new multiplier value (replace with your actual logic to compute it)
    multiplier_value = 42

    # Perform the update
    response = supabase.table(TABLE_NAME) \
        .update({"multiplier": multiplier_value}) \
        .eq(PRIMARY_KEY, row_primary_key_value) \
        .execute()

    print("Updated row response:", response.data)

# Run every 24 hours (86,400 seconds)
while True:
    update_multiplier()
    print("Waiting 24 hours until next update...")
    time.sleep(86400)  # 24 hours in seconds
