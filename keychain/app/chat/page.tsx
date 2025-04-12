"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import React, { useState, useEffect, useRef } from "react";

import { getAIResponse } from "@/services/gemini";
import { isJSON } from "@/helpers/helpers";
import { FileUpload } from "@/components/file-upload-mint";

export interface Message {
  sender: 'User' | 'Bot';
  text: string;
}

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>(''); 
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling to the bottom

  // Function to simulate typing animation for the bot's message
  const simulateTyping = (response: string) => {
    if (isJSON(response)) {return;}
    let index = 0;
    const interval = setInterval(() => {
      setMessages((messages) => {
        const newMessages = [...messages];
        // Update the last bot message with the progressively typed text
        newMessages[newMessages.length - 1] = {
          sender: "Bot",
          text: response.slice(0, index + 1), // Reveal one character at a time
        };
        return newMessages;
      });

      index++;
      if (index === response.length) {
        clearInterval(interval); // Stop typing animation when it's done
      }
    }, 10); // Adjust delay for typing speed (50ms between characters)
  };

  // Handle sending the message
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { sender: "User", text: input }];

    setMessages((messages) => [
      ...messages,
      { sender: "User", text: input },
    ]);
    
    const geminiResponse = await getAIResponse(newMessages as Message[]) || "Error fetching response";

    setMessages((messages) => [
      ...messages,
      { sender: "Bot", text: geminiResponse },
    ]);

    // Simulate typing animation for Gemini response
    simulateTyping(geminiResponse);

    // Clear the input field
    setInput("");
  };

  // Auto-scroll to the latest message whenever the messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Trigger typing effect for the initial message when the component mounts
  useEffect(() => {
    const initialMessage = "Welcome to Keychain! How can I help you today? You can either mint or sell your own music as an NFT!";
    setMessages([{ sender: "Bot", text: initialMessage }]); // Start with a welcome message
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
                {/* Check if it's JSON and the sender is "Bot" */}
                {isJSON(msg.text) && msg.sender === "Bot" ? (
                  index === messages.length - 1 ? (
                    <FileUpload json={isJSON(msg.text)}/>
                  ) : (
                    <span>File Uploaded</span>
                  )
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
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
              if (e.key === "Enter") {
                handleSendMessage(); // Call the send message handler
                setInput(""); // Clear input after sending
              }
            }}
            placeholder="Talk to Keychain..."
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
