import { toast } from 'sonner';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function generateText(prompt: string) {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
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
      throw new Error('Invalid response from OpenAI');
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
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
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