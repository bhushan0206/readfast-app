import { toast } from 'sonner';
import { config } from '../config/env';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Validate API key format
const validateApiKey = (key: string): boolean => {
  return key.startsWith('gsk_') && key.length > 20;
};

export async function generateText(prompt: string) {
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
            content: "You are a helpful assistant that generates reading content for a speed reading application. Generate content that is educational, engaging, and suitable for practice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate text');
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating text:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to generate text');
    return null;
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