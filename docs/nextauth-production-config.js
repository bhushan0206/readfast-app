// Example NextAuth.js configuration for production
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // ...existing code...
      return token
    },
    async session({ session, token }) {
      // ...existing code...
      return session
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirect works in production
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  // Critical for production
  secret: process.env.NEXTAUTH_SECRET,
  
  // Production URL
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  // Debug in production (remove after fixing)
  debug: process.env.NODE_ENV === 'development',
  
  // Session configuration
  session: {
    strategy: 'jwt',
  },
  
  // Cookie configuration for production
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Must be true in production HTTPS
      },
    },
  },
})