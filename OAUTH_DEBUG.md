# Google OAuth Production Debug Checklist

## Environment Variables Check
- [ ] `GOOGLE_CLIENT_ID` set in production
- [ ] `GOOGLE_CLIENT_SECRET` set in production  
- [ ] `NEXTAUTH_SECRET` set (if using NextAuth)
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `REDIRECT_URI` matches Google Console settings

## Google Cloud Console Settings
- [ ] Production domain added to "Authorized JavaScript origins"
- [ ] Production callback URL added to "Authorized redirect URIs"
- [ ] OAuth consent screen configured for production
- [ ] App status is "Published" (not "Testing")

## Common Production Issues

### 1. NEXTAUTH_URL Mismatch
```bash
# Local
NEXTAUTH_URL=http://localhost:3000

# Production (must match exactly)
NEXTAUTH_URL=https://yourdomain.com
```

### 2. Missing HTTPS
- Google OAuth requires HTTPS in production
- Check if your app is properly served over HTTPS

### 3. Cookie/Session Issues
- Check if cookies are being set with correct domain
- Verify secure cookie settings for HTTPS

### 4. CORS Issues
- Ensure production domain is in allowed origins
- Check if API routes are accessible

## Debug Steps

1. Check browser network tab for failed requests
2. Look for 401/403 errors in OAuth flow
3. Verify callback URL in browser address bar
4. Check production logs for OAuth errors
5. Test OAuth flow step by step