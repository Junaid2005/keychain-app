"use client"
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label';

import React, { useState, useEffect, useRef } from 'react';

// Define a type for the message structure
interface Message {
  sender: string;
  text: string;
}

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Initialize with empty messages
  const [input, setInput] = useState<string>(''); // User input state
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling to the bottom

  // Random response generator
  const randomResponses = [
    "I'm here to help!",
    "Interesting question!",
    "Can you tell me more?",
    "That's a good point!",
    "Let me check that for you.",
    "I'm not sure about that, but I'll try my best!",
    "Could you clarify that a bit?",
    "Sounds good, let's dive into that!",
    "I don't have the answer, but maybe I can assist you further!",
    "Let's explore this together!"
  ];

  // Handle sending the message
  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add user's message to chat history
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: 'User', text: input }
    ]);

    // Generate a random response
    const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];

    setMessages(prevMessages => [
      ...prevMessages,
      { sender: 'Bot', text: '' } // Empty message for bot, we'll fill it gradually
    ]);

    // Simulate the typing animation for the bot response
    simulateTyping(randomResponse);

    // Clear the input field
    setInput('');
  };

  // Function to simulate typing animation for bot's message
  const simulateTyping = (response: string) => {
    let index = 0;
    const interval = setInterval(() => {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = {
          sender: 'Bot',
          text: response.slice(0, index + 1)
        };
        return newMessages;
      });

      index++;
      if (index === response.length) {
        clearInterval(interval); // Stop typing animation when it's done
      }
    }, 20); // Adjust delay here (100ms between each character)
  };

  // Auto-scroll to the latest message whenever the messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Runs when messages change

  // Trigger typing effect for the initial message when the component mounts
  useEffect(() => {
    const initialMessage = 'Welcome to Keychain! How can I help you today?';
    setMessages([{ sender: 'Bot', text: '' }]); // Start with an empty message

    // Simulate typing for the first bot message
    simulateTyping(initialMessage);
  }, []); // This will only run once when the component mounts

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-192 h-168 mx-auto flex flex-col justify-between">
        <div className="messages px-8 space-y-4 max-h-120 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className="message p-2">
                <Label>{msg.text}</Label>
              </Card>
            </div>
          ))}
          {/* Scroll to the last message */}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2 px-8 mb-8">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(); // Call your send message handler
                setInput(''); // Optional: clear input after sending
              }
            }}
            placeholder="Talk to keychain..."
            className="w-full p-2"
          />
          <Button onClick={handleSendMessage} className="px-4 py-2">
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatApp;
