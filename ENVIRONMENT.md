# Vercel environment variables

Add these variables in **Vercel → Project Settings → Environment Variables** for Production, Preview, and Development:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code. The serverless routes under `/api` use it only on the server.

After adding variables, redeploy the project and test:

- `/api/health`
- `/api/menu`
- `/api/settings`

Razorpay keys, Google Maps keys, OTP provider credentials, and WhatsApp/SMS credentials should be added later as server-side variables before production payments or notifications are enabled.
