// Environment Variables Debug Helper
export const DEBUG_CONFIG = {
  // Log current environment configuration
  logEnvironment: () => {
    console.log('🔍 Environment Debug Info:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VITE_APP_URL:', process.env.VITE_APP_URL);
    console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
    console.log('Current Origin:', window.location.origin);
    console.log('Current Host:', window.location.host);
    console.log('Protocol:', window.location.protocol);
  },
  
  // Validate production configuration
  validateProductionConfig: () => {
    const issues: string[] = [];
    
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.VITE_APP_URL) {
        issues.push('VITE_APP_URL is not set in production');
      }
      
      if (process.env.VITE_APP_URL?.includes('localhost')) {
        issues.push('VITE_APP_URL contains localhost in production');
      }
      
      if (!window.location.protocol.includes('https')) {
        issues.push('Production app is not served over HTTPS');
      }
    }
    
    if (issues.length > 0) {
      console.error('🚨 Production Configuration Issues:');
      issues.forEach(issue => console.error(`- ${issue}`));
    } else {
      console.log('✅ Production configuration looks good');
    }
    
    return issues;
  },
  
  // Get correct redirect URL for current environment
  getRedirectURL: (path: string = '/auth/callback') => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VITE_APP_URL || window.location.origin
      : 'http://localhost:5173';
    
    return `${baseUrl}${path}`;
  },
};