import React from "react";
import { useWallet } from "../context/WalletContext";  // Adjust the path as necessary
import { Button } from "@/components/ui/button";  // Assuming you're using this Button component

const MetamaskConnect: React.FC = () => {
  const { account, balance, connectWallet } = useWallet();  // Get wallet state from context

  return (
    <div>
      {!account ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <p>Balance: {balance} ETH</p>
        </div>
      )}
    </div>
  );
};

export default MetamaskConnect;
