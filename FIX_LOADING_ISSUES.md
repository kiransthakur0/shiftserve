# Fix for Loading Issues and Blocked Pages

## The Real Problem

Your app has been stuck on loading screens because of a **Supabase database configuration issue**, not a code issue. Here's what's happening:

### The Issue Chain:
1. When users sign up, their `user_type` (worker/restaurant) is saved in Supabase Auth metadata
2. The app's `AuthContext` tries to fetch `user_type` from a `profiles` table
3. **If the `profiles` table doesn't have the data or trigger isn't working**, `userType` stays `null`
4. When `userType` is `null`, the app blocks access to ALL pages (home, profile, discover, etc.)
5. This causes infinite loading or redirects

## The Solution

You need to run a SQL migration in your Supabase database to fix the profiles table and auth trigger.

## Steps to Fix (5 minutes)

### 1. Open Supabase SQL Editor
1. Go to [your Supabase project](https://supabase.com/dashboard/projects)
2. Select your ShiftServe project
3. Click **"SQL Editor"** in the left sidebar (database icon)

### 2. Run the Fix SQL
1. Open the file `supabase-migrations/fix-profiles-auth.sql` from this repository
2. Copy the **entire contents** of that file
3. Paste into the Supabase SQL Editor
4. Click **"Run"** button (bottom right)

### 3. Verify It Worked
After running the SQL, you should see:
```
profile_count
-------------
1 (or more, depending on how many test accounts you've created)
```

### 4. Test Your App
1. Sign out of your app (if logged in)
2. Sign up as a new worker or restaurant
3. Complete the onboarding
4. You should now be able to access:
   - Home page (via hamburger menu ☰)
   - Profile page (via hamburger menu ☰)
   - Discover/Dashboard pages

## What the Fix Does

The SQL migration:
1. ✅ Creates the `profiles` table if it doesn't exist
2. ✅ Sets up the trigger to automatically create profile entries when users sign up
3. ✅ Backfills profiles for any existing users
4. ✅ Adds proper security policies (RLS)

## If You Still Have Issues

### Issue: Still seeing loading screens
**Solution:** Check browser console for errors:
1. Press F12 in your browser
2. Go to Console tab
3. Look for errors mentioning "profiles" or "user_type"
4. Share those errors

### Issue: "relation 'public.profiles' does not exist"
**Solution:** The profiles table wasn't created. Make sure you:
1. Ran the ENTIRE `fix-profiles-auth.sql` file
2. Clicked "Run" in Supabase SQL Editor
3. Didn't get any errors during execution

### Issue: "permission denied for table profiles"
**Solution:** RLS policies might not be set correctly. Re-run the migration SQL.

## Technical Details (for developers)

### The Auth Flow:
```
1. User signs up → Supabase Auth creates user with user_type in metadata
2. Trigger fires → Creates entry in profiles table with user_type
3. AuthContext fetches → Gets user_type from profiles table
4. App routes → Allows access to appropriate pages based on user_type
```

### Why This Was Confusing:
- The frontend code was correct
- The signup process worked
- But the database trigger wasn't set up, so step 2 failed silently
- This caused `userType` to be `null`, blocking everything

## Code Changes Made (No Action Needed)

The following code fixes were also made to improve UX:

1. **Onboarding pages**: Removed unnecessary auth polling, added loading spinners
2. **Discover page**: Fixed "Loading shifts..." issue - now loads immediately
3. **Profile pages**: Already functional, just needed database fix to access them

## Need More Help?

If you're still stuck after running the SQL migration:
1. Check Supabase logs: **Database** → **Logs** in Supabase dashboard
2. Verify the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Check if your user has a profile:
   ```sql
   SELECT * FROM public.profiles WHERE id = auth.uid();
   ```
