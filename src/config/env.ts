interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  groq: {
    apiKey: string;
  };
}

// Validate required environment variables
const validateEnvVars = (): Config => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

  const missing: string[] = [];

  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (!groqApiKey) missing.push('VITE_GROQ_API_KEY');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate formats
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!groqApiKey.startsWith('gsk_')) {
    throw new Error('VITE_GROQ_API_KEY must be a valid Groq API key (starts with gsk_)');
  }

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
    groq: {
      apiKey: groqApiKey,
    },
  };
};

export const config = validateEnvVars();