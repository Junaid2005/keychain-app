// file-upload-mint.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Props passed into this component
interface FileUploadMintProps {
  json: MetadataInput; // Strictly typed metadata from parent
}

// The metadata shape expected from parent
interface MetadataInput {
  [key: string]: string | number | boolean | string[] | number[] | null;
}

// Server response when uploading a file
interface UploadResponse {
  jobId: string;
}

// Server response when polling for analysis results
interface PollResponse {
  geminiResult?: GeminiResult;
  [key: string]: unknown; // Optional, for any additional fields returned
}

// Gemini AI result structure
interface GeminiResult {
  tags: string[];
  mood: string;
  genre: string;
  bpm: number;
  [key: string]: string | number | string[];
}

// Server response when minting the NFT
interface MintResponse {
  success: boolean;
  nftId?: string;
  transactionHash?: string;
  [key: string]: unknown;
}

const UPLOAD_SERVER_URL = "http://20.117.181.22:4050";
const MINT_SERVER_URL = "http://20.117.181.22:8050";

export function FileUpload({ json }: FileUploadMintProps) {
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<PollResponse | null>(null);
  const [mintStatus, setMintStatus] = useState<string>("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [, setJobId] = useState<string | null>(null);

  // Handle audio file input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    setStatus("Uploading file...");

    const formData = new FormData();
    formData.append("music", file);
    formData.append("filetype", JSON.stringify({ fileType: "audio" }));

    try {
      const response = await fetch(`${UPLOAD_SERVER_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload file");

      const data: UploadResponse = await response.json();
      setJobId(data.jobId);
      setStatus("File uploaded. Waiting for Gemini analysis...");
      pollGeminiResult(data.jobId);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Error uploading file");
    }
  };

  // Poll for Gemini AI result
  const pollGeminiResult = (jobId: string): void => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${UPLOAD_SERVER_URL}/upload/status/${jobId}`);
        if (!response.ok) throw new Error("Error fetching status");

        const data: PollResponse = await response.json();
        if (data.geminiResult) {
          setResult(data);
          setStatus("Gemini analysis complete.");
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);
  };

  // Mint the NFT
  const handleMintNFT = async (): Promise<void> => {
    if (!result || !originalFile) return;

    setMintStatus("Minting NFT...");

    try {
      const formData = new FormData();
      formData.append("music", originalFile);

      const combinedMetadata = {
        ...result,
        fileType: "audio",
        ...json,
      };

      formData.append("metadata", JSON.stringify(combinedMetadata));

      const mintResponse = await fetch(`${MINT_SERVER_URL}/mintNFT`, {
        method: "POST",
        body: formData,
      });

      if (!mintResponse.ok) throw new Error("Failed to mint NFT");

      const mintData: MintResponse = await mintResponse.json();
      console.log("Mint response:", mintData);
      setMintStatus("NFT minted successfully!");
    } catch (error) {
      console.error("Mint error:", error);
      setMintStatus("Error minting NFT");
    }
  };

  return (
    <div className="file-upload-mint-container" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Upload Audio File</h2>
      <Label htmlFor="file-upload"></Label>
      <Input
        id="file-upload"
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="cursor-pointer mt-2"
      />

      {status && <p className="pt-4">Status: Successfully minted file! Is there anything else I can help with?</p>}

      {result && (
        <div>
          <h3>Analysis Result</h3>
          <pre style={{ backgroundColor: "#f4f4f4", padding: "1rem", borderRadius: "5px" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          <button onClick={handleMintNFT} style={{ marginTop: "1rem" }}>
            Mint NFT
          </button>
          {mintStatus && <p>Status: {mintStatus}</p>}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
