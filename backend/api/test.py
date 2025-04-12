"""template for FastAPI app"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum  # This is necessary to make FastAPI work with AWS Lambda


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://keychain-xyz.vercel.app",
]

app = FastAPI()

# Add CORS middleware to allow these origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.get("/hello")
def read_root():
    """Return a simple message"""
    return {"message": "Junaid from Keychain says hi"}


@app.get("/ping")
def ping():
    """Return a simple message"""
    return {"message": "Pong"}


handler = Mangum(app)
