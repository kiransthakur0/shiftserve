# Fixing Vercel Deployment - Authentication Issues

## Issue
Login/signup works on localhost but fails on Vercel production with refresh token errors or loading issues.

## Root Causes
1. Environment variables not set in Vercel
2. Supabase redirect URLs not configured for production
3. Site URL mismatch

---

## Step-by-Step Fix

### 1. Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add these variables (copy from your `.env.local` file):

```
NEXT_PUBLIC_SUPABASE_URL=https://djrmbhkhkekokrumlwia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcm1iaGtoa2Vrb2tydW1sd2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDg5MjYsImV4cCI6MjA3NTU4NDkyNn0.Veg__W36eQBjLk65rQksw_6sjCXp0SYK5ehEZoEABKc
```

**Important:** Set these for **Production**, **Preview**, and **Development** environments

### 2. Configure Supabase Auth URLs

Go to your Supabase Dashboard → **Authentication** → **URL Configuration**

#### A. Site URL
Set to your Vercel production URL:
```
https://your-app-name.vercel.app
```

#### B. Redirect URLs
Add these URLs (replace with your actual Vercel URL):
```
https://your-app-name.vercel.app/auth/callback
https://your-app-name.vercel.app/auth/login
https://your-app-name.vercel.app/auth/signup
https://your-app-name.vercel.app/**
http://localhost:3000/**
```

The `/**` wildcard allows all paths under your domain.

### 3. Disable Email Confirmation (if not needed)

Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**

- Uncheck **"Confirm email"** (unless you want email verification)
- Save changes

### 4. Clear Browser Cache and Redeploy

#### In Vercel:
1. Go to **Deployments**
2. Click on the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Check "Clear Build Cache"
5. Click **Redeploy**

#### In Your Browser:
1. Go to your production URL
2. Open DevTools (F12)
3. Go to **Application** tab → **Storage** → **Clear site data**
4. Or use **Incognito/Private mode**

### 5. Test Production Login

1. Go to your production URL: `https://your-app-name.vercel.app`
2. Click "Sign Up" or "Login"
3. Create/login with test account
4. Check browser console for errors

---

## Common Issues & Solutions

### Issue: "Invalid Refresh Token"
**Cause:** Old auth sessions from before environment variables were set
**Solution:**
- Clear browser cache/cookies
- Use incognito mode
- Wait 24 hours for session to expire

### Issue: "CORS Error" or "Failed to fetch"
**Cause:** Supabase redirect URLs not configured
**Solution:**
- Add your Vercel URL to Supabase redirect URLs
- Include the `/**` wildcard

### Issue: "Profile not found"
**Cause:** Database trigger not set up
**Solution:**
- Run `supabase-schema.sql` in Supabase SQL Editor
- Verify trigger exists with `verify-setup.sql`

### Issue: Button stays in "Loading..." state
**Cause:** AuthContext redirect loop or missing environment variables
**Solution:**
- Verify environment variables are set in Vercel
- Redeploy with cleared cache
- Check Vercel deployment logs for errors

---

## Verification Checklist

- [ ] Environment variables added to Vercel (all environments)
- [ ] Supabase Site URL set to Vercel production URL
- [ ] Supabase Redirect URLs include Vercel domains
- [ ] Email confirmation disabled (if not needed)
- [ ] Browser cache cleared or using incognito
- [ ] Vercel redeployed with cleared build cache
- [ ] Database schema and trigger set up in Supabase
- [ ] Can successfully signup on production
- [ ] Can successfully login on production
- [ ] Redirects work properly after login

---

## Still Having Issues?

### Check Vercel Logs
1. Go to Vercel Dashboard → your project
2. Click **Logs** tab
3. Look for errors during login/signup attempts

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** → **API Logs**
3. Filter by your user email
4. Look for failed requests

### Common Error Messages

**"Failed to load resource: the server responded with a status of 406"**
- This is normal if you haven't completed onboarding yet
- It's trying to load a profile that doesn't exist yet

**"User already registered"**
- Email already has an account
- Try logging in instead of signing up
- Or use a different email

**Page redirects in a loop**
- AuthContext is detecting you're already logged in
- Clear cookies/cache and try again
