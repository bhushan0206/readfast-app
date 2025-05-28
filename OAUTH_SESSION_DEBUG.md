## 🔍 OAuth Session Debug Test

If you're still getting "No session found during init", try this manual test:

### **1. Open Browser Console**
When you reach the OAuth callback URL, paste this code in the console:

```javascript
// Manual OAuth session test
async function testOAuthSession() {
  console.log('🧪 Testing OAuth session setup...');
  console.log('📍 Current URL:', window.location.href);
  
  // Extract tokens from URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  
  console.log('🔑 Tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
  
  if (!accessToken) {
    console.error('❌ No access token found');
    return;
  }
  
  try {
    // Import Supabase (adjust path if needed)
    const { supabase } = await import('./src/services/supabase.js');
    
    // Manually set the session
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });
    
    console.log('📋 Set session result:', { data, error });
    
    if (data.session) {
      console.log('✅ Session set successfully!');
      console.log('👤 User:', data.session.user.email);
      
      // Test getting the session
      const { data: getSessionData } = await supabase.auth.getSession();
      console.log('📋 Get session result:', getSessionData);
      
      return data.session;
    } else {
      console.error('❌ Failed to set session:', error);
    }
  } catch (err) {
    console.error('💥 Test error:', err);
  }
}

// Run the test
testOAuthSession();
```

### **2. Expected Output**
```
🧪 Testing OAuth session setup...
📍 Current URL: http://localhost:5173/auth/callback#access_token=...
🔑 Tokens: { accessToken: true, refreshToken: true }
📋 Set session result: { data: { session: {...} }, error: null }
✅ Session set successfully!
👤 User: your-email@gmail.com
📋 Get session result: { session: {...} }
```

### **3. If This Works**
The issue is in the callback component timing. If the manual test works, the tokens are valid.

### **4. If This Fails**
The OAuth flow itself has an issue. Check:
- Supabase project settings
- Google OAuth configuration
- URL redirect settings

**Run this test and let me know the results! 🧪**