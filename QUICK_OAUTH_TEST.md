## 🔧 Quick OAuth Test

Try this in the browser console when you're on the callback page:

```javascript
// Quick test to see auth state
console.log('Current auth state:', window.__STORE_STATE__ = {
  initialized: window.useAuthStore?.getState().initialized,
  loading: window.useAuthStore?.getState().loading,
  user: !!window.useAuthStore?.getState().user,
  url: window.location.href
});

// Check if tokens are in URL
const hash = window.location.hash;
console.log('Hash:', hash);
const params = new URLSearchParams(hash.substring(1));
console.log('Access token present:', !!params.get('access_token'));

// Manual session test
if (params.get('access_token')) {
  console.log('🧪 Running manual session test...');
  
  // Import supabase
  import('./src/services/supabase.js').then(async ({ supabase }) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token') || ''
      });
      
      console.log('Session result:', { data, error });
      
      if (data.session) {
        // Manually update store
        const { useAuthStore } = await import('./src/store/authStore.js');
        useAuthStore.setState({
          user: data.session.user,
          profile: null,
          initialized: true,
          loading: false
        });
        
        console.log('✅ Manual auth success! Redirecting...');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Manual test error:', err);
    }
  });
}
```

Run this when you're stuck on the callback page and let me know what it outputs!