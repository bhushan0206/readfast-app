import { toast } from 'sonner';

// AI text generation service using Groq
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Validate API key format
const validateApiKey = (apiKey: string): boolean => {
  return typeof apiKey === 'string' && apiKey.startsWith('gsk_') && apiKey.length > 20;
};

export const generateText = async (prompt: string): Promise<string> => {
  if (!GROQ_API_KEY) {
    // Fallback responses when API key is not available
    const fallbackResponses = {
      'reading speed': 'Try focusing on reducing subvocalization and using your peripheral vision to read word groups instead of individual words.',
      'comprehension': 'Take notes while reading and pause every few paragraphs to summarize what you\'ve learned in your own words.',
      'focus': 'Try the Pomodoro technique: read for 25 minutes, then take a 5-minute break. Eliminate distractions and find a quiet space.',
      'default': 'Practice regularly, set reading goals, and gradually increase your reading speed while maintaining comprehension.'
    };
    
    const lowerPrompt = prompt.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerPrompt.includes(key)) {
        return response;
      }
    }
    return fallbackResponses.default;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate text');
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error generating text:', error);
    // Return a helpful fallback
    return 'I\'m having trouble connecting right now. Try practicing with shorter texts and gradually increasing difficulty to improve your reading speed and comprehension.';
  }
};

export async function generateComprehensionQuestions(text: string) {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }
    
    if (!validateApiKey(GROQ_API_KEY)) {
      throw new Error('Invalid Groq API key format');
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
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

export async function generatePersonalizedRecommendations(
  userLevel: string,
  interests: string[],
  recentTopics: string[]
): Promise<string[]> {
  const prompt = `Generate 6 personalized reading topic recommendations for a ${userLevel} level reader.

User interests: ${interests.join(', ')}
Recent topics read: ${recentTopics.join(', ')}

Provide topics that:
- Match their interests and reading level
- Introduce new but related subjects
- Gradually increase complexity
- Are engaging and educational

Return as a simple list, one topic per line.`;

  try {
    const response = await generateText(prompt);
    return response
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
      .slice(0, 6);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      'Science and Technology',
      'World History',
      'Nature and Environment',
      'Health and Wellness',
      'Space Exploration',
      'Cultural Traditions'
    ];
  }
}

export const generateReadingText = async (topic: string, difficulty: 'easy' | 'medium' | 'hard', wordCount: number): Promise<{ title: string; content: string }> => {
  const prompt = `Generate a ${difficulty} difficulty reading text about ${topic} that is approximately ${wordCount} words long. 
  
  Requirements:
  - Engaging and educational content
  - Appropriate vocabulary for ${difficulty} level
  - Clear structure with introduction, body, and conclusion
  - Interesting facts or insights about the topic
  
  Return as JSON with "title" and "content" fields. The title should be catchy and descriptive.`;

  try {
    const response = await generateText(prompt);
    const parsed = JSON.parse(response);
    return {
      title: parsed.title || `Reading Practice: ${topic}`,
      content: parsed.content || `This is a ${difficulty} level text about ${topic}. Practice reading this text to improve your reading speed and comprehension skills.`
    };
  } catch (error) {
    console.error('Error generating reading text:', error);
    return {
      title: `Reading Practice: ${topic}`,
      content: `This is a practice text about ${topic}. Reading regularly helps improve both speed and comprehension. Try to read this text at a comfortable pace while maintaining good understanding of the content. Focus on key concepts and main ideas as you progress through the material.`
    };
  }
};

export async function generateReadingSummary(content: string): Promise<string> {
  const prompt = `Create a concise summary of the following text. Focus on the main points and key takeaways in 2-3 sentences:

"${content}"`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Summary unavailable. Please try again later.';
  }
}

export async function generateVocabularyWords(
  content: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Array<{ word: string; definition: string; example: string }>> {
  const prompt = `Extract 5-8 important vocabulary words from this text that match ${difficulty} difficulty level. For each word, provide a definition and example sentence.

Text: "${content}"

Format as JSON array:
[
  {
    "word": "vocabulary word",
    "definition": "clear definition",
    "example": "example sentence using the word"
  }
]`;

  try {
    const response = await generateText(prompt);
    const jsonMatch = response.match(/\[(.*)\]/s);
    if (jsonMatch) {
      return JSON.parse(`[${jsonMatch[1]}]`);
    }
    return [];
  } catch (error) {
    console.error('Error generating vocabulary:', error);
    return [];
  }
}