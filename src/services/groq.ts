import { toast } from 'sonner';
import { config } from '../config/env';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Validate API key format
const validateApiKey = (key: string): boolean => {
  return key.startsWith('gsk_') && key.length > 20;
};

export async function generateText(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast and supported Groq model
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate text using Groq API');
  }
}

export async function generateComprehensionQuestions(text: string) {
  try {
    const apiKey = config.groq.apiKey;
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }
    
    if (!validateApiKey(apiKey)) {
      throw new Error('Invalid Groq API key format');
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "Generate 3 multiple-choice comprehension questions based on the provided text. Format the response as a JSON array with questions, options, and correct answers."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate questions');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating questions:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to generate questions');
    return null;
  }
}