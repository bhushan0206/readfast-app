# Production Deployment Configuration

## 🚀 **PRODUCTION SECURITY CHECKLIST**

### ✅ **Environment Configuration**

```bash
# Environment Variables (add to .env.production)
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=your_sentry_dsn_for_error_tracking
VITE_ANALYTICS_ID=your_analytics_id
```

### 🔒 **Security Headers Implementation**

#### **For Nginx (Recommended)**
```nginx
# /etc/nginx/sites-available/readfast
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;";
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/readfast;
        
        # Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    location /api/auth {
        limit_req zone=login burst=3 delay=2;
        # Proxy to your auth API if needed
    }
    
    location /api/ {
        limit_req zone=api burst=20;
        # Proxy to your API if needed
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

#### **For Vercel (vercel.json)**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 📊 **Error Monitoring Setup**

#### **Sentry Integration**
```bash
# Install Sentry
npm install @sentry/react @sentry/tracing
```

```typescript
// src/utils/sentry.ts
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Integrations.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.VITE_ENVIRONMENT,
});

export default Sentry;
```

#### **Log Aggregation (Recommended: Logtail)**
```bash
# Install logging service
npm install @logtail/js
```

### 🔐 **Database Security (Supabase)**

#### **Row Level Security Policies**
```sql
-- Enable RLS on all tables
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_stats ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own texts" ON texts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own texts" ON texts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own texts" ON texts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own texts" ON texts
    FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can view own sessions" ON reading_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON reading_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON reading_stats
    FOR SELECT USING (auth.uid() = user_id);
```

### 🛡️ **API Security**

#### **Supabase Security Configuration**
```sql
-- Create security functions
CREATE OR REPLACE FUNCTION public.is_owner(record_user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN auth.uid() = record_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    user_id uuid,
    action_type text,
    max_attempts integer DEFAULT 10,
    window_seconds integer DEFAULT 3600
)
RETURNS boolean AS $$
DECLARE
    attempt_count integer;
BEGIN
    SELECT COUNT(*)
    INTO attempt_count
    FROM rate_limits
    WHERE user_id = $1
    AND action_type = $2
    AND created_at > NOW() - INTERVAL '1 second' * window_seconds;
    
    IF attempt_count >= max_attempts THEN
        RETURN false;
    END IF;
    
    INSERT INTO rate_limits (user_id, action_type, created_at)
    VALUES ($1, $2, NOW());
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 📈 **Performance Monitoring**

#### **Build Optimization**
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### 🔍 **Security Audit Commands**

```bash
# NPM Audit
npm audit --audit-level moderate

# License Check
npm install -g license-checker
license-checker --summary

# Bundle Analysis
npm run build
npx vite-bundle-analyzer dist

# Security Headers Test
curl -I https://your-domain.com
```

### 📋 **Pre-Deployment Checklist**

- [ ] Environment variables configured
- [ ] Security headers implemented
- [ ] SSL certificate installed
- [ ] Database RLS policies enabled
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled
- [ ] Security audit passed
- [ ] Bundle size optimized
- [ ] API endpoints secured
- [ ] File upload validation implemented
- [ ] Input sanitization in place
- [ ] Session management secure
- [ ] GDPR compliance ready

### 🚨 **Emergency Response Plan**

#### **Security Incident Response**
1. **Immediate Actions**
   - Block malicious IPs at firewall level
   - Invalidate compromised sessions
   - Enable maintenance mode if necessary

2. **Investigation**
   - Review server logs
   - Check error monitoring dashboard
   - Analyze security event logs

3. **Recovery**
   - Patch security vulnerabilities
   - Update security policies
   - Communicate with affected users

#### **Contact Information**
- **Security Team**: security@yourcompany.com
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Hosting Provider**: support@hostingprovider.com

---

## 📞 **Support Contacts**

- **Supabase Support**: https://supabase.com/support
- **Sentry Support**: https://sentry.io/support/
- **SSL Provider**: https://letsencrypt.org/

---

*Last updated: ${new Date().toISOString()}*