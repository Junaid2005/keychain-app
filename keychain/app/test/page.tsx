"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { callBackend } from '../../services/backend';
import { Card } from '@/components/ui/card';

const ApiCallerComponent = () => {
  const [input, setInput] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle the API call
  const handleFetch = async () => {
    if (!input.trim()) {
      setError('Please enter a valid path!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await callBackend(input);
      setResponse(data.message || data.status || 'No data');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data from the API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter API path (e.g., /message)"
      />

      <Button
        onClick={handleFetch}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Fetch Data'}
      </Button>

      {error && <div className="text-red-500">{error}</div>}

        {response && !error && !loading && (
            <Card>
                <div className="mt-4">
                    <strong></strong> {response}
                </div>
            </Card>
        )}
    </div>
  );
};

export default ApiCallerComponent;
