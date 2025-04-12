import { GEMINI_PROMPT } from "@/constants";
import { GoogleGenAI } from "@google/genai";
import { Message } from "@/app/chat/page";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY });

export async function getAIResponse(conversationHistory: Message[]): Promise<string | undefined> {
  const conversation = conversationHistory
    .map((msg) => `${msg.sender}: ${msg.text}`)
    .join("\n");

  const prompt = GEMINI_PROMPT + `\nHere is the conversation history:\n${conversation}\nPlease respond to the latest message.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return response.text;
}
