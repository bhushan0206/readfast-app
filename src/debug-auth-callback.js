// Add this to your auth callback component to debug
useEffect(() => {
  console.log('🔍 Auth Callback Debug:');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('VITE_APP_URL:', import.meta.env.VITE_APP_URL);
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
}, []);