"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export type AICopyrightType = {
    account?: string;
  };

// Initialize Supabase client
const supabaseUrl = "https://xfnlmjtqpuejpdxqwylp.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABAKSE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function AICopyright({ account }: AICopyrightType) {
  const [plagiarisedNfts, setPlagiarisedNfts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) {
      toast.error("No wallet connected");
      setLoading(false);
      return;
    }

    toast.success(`Connected wallet: ${account}`);

    async function fetchNFTs() {
      try {
        const { data, error } = await supabase
          .from("ai_copyright")
          .select("*")
          .eq("wallet_address", account);

        if (error) throw error;
        const plagiarised = JSON.parse(data?.[0]?.data || '{}')?.plagiarised || [];
        setPlagiarisedNfts(plagiarised);
      } catch (err) {
        console.log("Error fetching NFTs:", err);
        toast.error("Failed to fetch NFTs.");
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [account]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-12">
    <Label className="text-2xl font-bold text-primary mb-4 text-center sm:text-left">
      Copyright Breach Checker 🧠 
    </Label>

    <Card className="p-6 shadow-md">
      <CardContent className="space-y-4">
        {account ? (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
            Connected wallet: <span className="font-mono">{account}</span>
            </p>
        </div>
        ) : (
        <p className="text-center text-sm text-muted-foreground">Please connect a wallet to check to see if any of your NFTs have been plagiarised.</p>
        )}

        {account && loading ? (
        <div className="flex items-center space-x-3 p-4">
            <div className="w-5 h-5 border-2 border-t-transparent border-muted rounded-full animate-spin" />
            <Label className="text-muted-foreground">Fetching NFTs...</Label>
        </div>
        ) : account && plagiarisedNfts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No NFTs found for this account.</p>
        ) : account && plagiarisedNfts.length > 0 ? (
        <div>
            <h3 className="text-lg font-medium mb-2">Plagiarised NFTs</h3>
            <ScrollArea className="max-h-[400px] rounded-md border p-4 bg-muted space-y-3">
            {plagiarisedNfts.map((url: string, index: number) => (
                <Label key={index} className="block text-sm pt-2 hover:underline cursor-pointer">
                <a href={url} target="_blank" rel="noopener noreferrer" className="break-all">
                    {url}
                </a>
                </Label>
            ))}
            </ScrollArea>
        </div>
        ) : null}
      </CardContent>
    </Card>
  </div>
  );
}

export default AICopyright;
