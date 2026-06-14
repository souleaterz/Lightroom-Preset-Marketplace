# PresetMarket — Deployment Guide

## 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Create Storage buckets in **Storage**:
   - `preset-demos` — Public
   - `preset-files` — Private
   - `avatars` — Public
4. Copy your project URL and keys to `.env.local`

## 2. Stripe Setup

1. Create a Stripe account and enable **Connect** in the dashboard
2. Copy your Secret Key and Publishable Key to `.env.local`
3. Set up a webhook endpoint (Stripe Dashboard → Webhooks):
   - URL: `https://yourdomain.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `account.updated`, `charge.dispute.created`
4. Copy the Webhook Signing Secret to `STRIPE_WEBHOOK_SECRET`

## 3. Vercel Deployment

1. Push code to GitHub
2. Import to Vercel — it auto-detects Next.js
3. Add all environment variables from `.env.local` in Vercel project settings
4. Add your Vercel domain to Supabase Auth → URL Configuration → Site URL and Redirect URLs

## 4. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=15
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
RESEND_API_KEY=re_...
```

## 5. Auth Configuration

In Supabase Dashboard → Authentication → Providers:
- Enable Email (magic links)
- Enable Google OAuth (add Client ID + Secret)

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://yourdomain.vercel.app`
- Redirect URLs: `https://yourdomain.vercel.app/auth/callback`
