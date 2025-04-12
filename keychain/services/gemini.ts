// utils/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Keep this safe!
  dangerouslyAllowBrowser: true, // Only if calling from client-side (see notes below)
});

export const callOpenAI = async (prompt: string): Promise<string> => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return chatCompletion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Oops, something went wrong with OpenAI.';
  }
};
