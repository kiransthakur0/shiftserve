# Manual Fix for Navigation Issue

The hamburger menu is not showing because the profiles table is either:
1. Not being read correctly due to RLS policies
2. Not being created by the trigger

## Quick Fix: Manually Insert Your Profile

Since you're currently logged in, let's manually create your profile entry:

### Step 1: Get Your User ID

1. Open your browser's **Developer Console** (F12)
2. Go to the **Console** tab
3. Paste this code and press Enter:

```javascript
// Get Supabase client
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  'https://djrmbhkhkekokrumlwia.supabase.co',
  'YOUR_ANON_KEY_HERE'  // Replace with your actual anon key from .env.local
);

// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('Email:', user?.email);
console.log('User Type from metadata:', user?.user_metadata?.user_type);
```

4. Copy your **User ID** from the console output

### Step 2: Insert Profile Directly in Supabase

1. Go to your **Supabase Dashboard**: https://djrmbhkhkekokrumlwia.supabase.co
2. Click **"Table Editor"** → **"profiles"** table
3. Click **"Insert"** → **"Insert row"**
4. Fill in:
   - **id**: Paste your User ID from Step 1
   - **email**: Your email address
   - **user_type**: Type either `worker` or `restaurant` (depending on which type you are)
   - **created_at**: Leave as default (or set to current time)
   - **updated_at**: Leave as default (or set to current time)
5. Click **"Save"**

### Step 3: Clear Cache and Reload

1. Clear your browser's cookies and local storage
2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. The hamburger menu should now appear!

## Alternative: Use SQL to Insert Profile

If the Table Editor doesn't work, go to **SQL Editor** and run:

```sql
-- Replace with your actual user ID and email
INSERT INTO public.profiles (id, email, user_type, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your user ID
  'your@email.com',      -- Replace with your email
  'restaurant',          -- Or 'worker'
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET user_type = EXCLUDED.user_type,
    updated_at = NOW();
```

## If You Have Multiple Users

Run this SQL to create profiles for ALL existing users:

```sql
-- This will create profiles for all auth users that don't have one
INSERT INTO public.profiles (id, email, user_type, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'user_type', 'worker') as user_type,
  NOW(),
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;
```

## Check the RLS Policies

The issue might also be RLS policies preventing reads. Check these policies exist:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- If they don't exist, create them:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Verify It Worked

After inserting the profile, run the verification script:

```bash
npx tsx scripts/check-current-user.ts
```

You should now see your profile listed!

## Still Not Working?

If the hamburger menu still doesn't show:

1. **Check the browser console** for this warning:
   ```
   Navigation hidden: user exists but userType is missing
   ```

2. **Check what AuthContext is receiving**:
   - Open browser console
   - Look for logs from the Navigation component
   - It should show: `Navigation - loading: false, user: true, userType: worker` (or restaurant)

3. **Sign out and sign back in**:
   - This will refresh all auth state
   - Should pick up the newly created profile

4. **Check for auth token issues**:
   - Clear ALL cookies for localhost:3000
   - Clear local storage
   - Sign up as a completely new user
