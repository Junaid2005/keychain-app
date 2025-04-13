"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { toast } from "sonner";

// Define types for the context and wallet state
interface WalletContextType {
  account: string;
  balance: string;
  connectWallet: () => Promise<void>;
}

// Create the context with default values
const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");

  // Function to connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        const bal = await provider.getBalance(address);
        setBalance(formatEther(bal));
      } catch (error) {
        console.error("Wallet connection failed:", error);
        toast.error("Wallet connection failed.")
      }
    } else {
      console.error("MetaMask is not installed.");
      toast.error("MetaMask is not installed.")
    }
  };

  return (
    <WalletContext.Provider value={{ account, balance, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use the Wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
