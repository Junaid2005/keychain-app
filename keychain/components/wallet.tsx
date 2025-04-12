import React, { useState } from "react";
import { WalletIcon } from '@heroicons/react/24/outline';
import { Button } from "./ui/button";  
import { Label } from "./ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "./ui/tooltip"
import { toast } from "sonner";


const PhantomWalletIntegration = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Obfuscate wallet address for security (show only first 4 and last 4 characters)
  function obfuscateAddress(walletAddress: string) {
    const obfuscatedAddress = walletAddress.slice(0, 4) + '....' + walletAddress.slice(-4);
    return obfuscatedAddress;
  }

  // Handle connect and disconnect to Phantom wallet
  const handlePhantomWallet = async () => {
    if (connected) {
      // Disconnect logic
      if (window.solana && window.solana.isPhantom) {
        try {
          await window.solana.disconnect();
          setConnected(false);
          setWalletAddress("");
          toast.success("Disconnected from Phantom Wallet");
        } catch (error) {
          console.error("Failed to disconnect Phantom Wallet:", error);
        }
      }
    } else {
      // Connect logic
      if (window.solana && window.solana.isPhantom) {
        try {
          const response = await window.solana.connect();
          setConnected(true);
          setWalletAddress(response.publicKey.toString());
          toast.success("Connected to Phantom Wallet");
        } catch (error) {
          console.error("Failed to connect to Phantom Wallet:", error);
        }
      } else {
        toast.error("Phantom Wallet is not installed. Please install it first.");
      }
    }
  };

  return (
    <div className="absolute top-5 right-15 flex items-center space-x-4">
      {/* If connected, show the obfuscated address */}
      {connected && walletAddress && (
        <Label>
          {obfuscateAddress(walletAddress)}
        </Label>
      )}

        <TooltipProvider>
          <Tooltip>
              <TooltipTrigger>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePhantomWallet}
                    className="flex items-center"
                >
                    <WalletIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                  {connected ? 'Disconnect' : 'Connect'} Phantom Wallet
              </TooltipContent>
          </Tooltip>
        </TooltipProvider>
    </div>
  );
};

export default PhantomWalletIntegration;
