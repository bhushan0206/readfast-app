import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/auth';

const AuthDebug: React.FC = () => {
  const { user, profile, initialized, loading } = useAuthStore();
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const runDiagnostics = async () => {
    console.log('🔍 Running auth diagnostics...');

    try {
      // Check environment variables
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Test Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      const diagnostics = {
        environment: {
          supabaseUrl: hasUrl ? '✅ Set' : '❌ Missing',
          supabaseKey: hasKey ? '✅ Set' : '❌ Missing',
          url: window.location.href,
        },
        connection: {
          status: connectionError ? '❌ Failed' : '✅ Connected',
          error: connectionError?.message,
        },
        session: {
          exists: !!session,
          user: session?.user?.email || 'None',
          error: sessionError?.message,
        },
        store: {
          user: !!user,
          profile: !!profile,
          initialized,
          loading,
        }
      };

      setDebugInfo(diagnostics);
      console.log('📊 Diagnostics:', diagnostics);
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 Testing Google Auth...');
      const { signInWithGoogle } = useAuthStore.getState();
      await signInWithGoogle();
    } catch (error) {
      console.error('❌ Google auth test failed:', error);
    }
  };

    return (
      <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
        <div className="text-yellow-400 font-bold mb-2">🐛 Auth Debug</div>
        
        <div className="space-y-2">
          <button 
            onClick={runDiagnostics}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Run Diagnostics
          </button>
          
          <button 
            onClick={testGoogleAuth}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs ml-2"
          >
            Test Google Auth
          </button>
        </div>
  
        {debugInfo && (
          <div className="mt-3 text-xs">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };
  
  export default AuthDebug;