# 🔧 OAuth Redirect Port Fix

## Problem
Your Google OAuth is redirecting to `localhost:3000/auth/callback` instead of `localhost:5173/auth/callback`.

## ✅ Quick Fixes

### **1. Update Supabase Redirect URLs**
In your Supabase Dashboard:
1. Go to **Authentication** → **Settings** 
2. Update **Site URL** to: `http://localhost:5173`
3. Update **Redirect URLs** to: `http://localhost:5173/auth/callback`

### **2. Update Google Cloud Console**
In Google Cloud Console:
1. Go to **APIs & Credentials** → **OAuth 2.0 Client IDs**
2. Update **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   ```
3. Update **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://[your-project].supabase.co/auth/v1/callback
   ```

### **3. Test the Fixed Flow**
1. Clear browser cookies and localStorage
2. Try Google sign-in again
3. It should now redirect to the correct port

## 🎯 Expected Flow After Fix
1. Click "Continue with Google" 
2. Redirect to Google OAuth (correct)
3. Authorize and redirect to `http://localhost:5173/auth/callback` (fixed)
4. Process token and redirect to dashboard (working)

The AuthCallback component has been updated with enhanced debugging and proper token handling!