# Vercel Deployment Setup

## Required Environment Variables

To deploy this application to Vercel, you need to configure the following environment variables in your Vercel project settings:

### Supabase Configuration

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api) → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api) → Settings → API → Project API keys → `anon` `public` |

### Steps to Configure

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar
   - Add each variable for all environments (Production, Preview, Development)

2. **Values from Supabase:**
   - Log in to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the **Project URL** and **anon/public key**

3. **Redeploy:**
   - After adding environment variables, trigger a new deployment
   - Vercel will automatically use these variables during build

## Local Development

For local development, create a `.env.local` file in the project root with the same variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

This file is already in `.gitignore` and will not be committed to version control.

## Database Schema

Make sure your Supabase database has the required tables. You can find the schema in:
- `supabase-schema.sql` - Full schema with comments
- `supabase-schema-clean.sql` - Clean schema for import

Run these SQL scripts in your Supabase SQL Editor to set up the database.
