# Fix Navigation Issue for Restaurant Users

## Problem Identified

The hamburger menu (Navigation component) is not showing for restaurant users because:

1. **No profiles exist in the database** - The script check confirmed 0 profiles in the `profiles` table
2. **Missing auth trigger** - The database trigger that creates profile entries on user signup hasn't been run
3. **Navigation component logic** - The Navigation component checks for `userType` and returns `null` if it's missing

## Solution

Follow these steps to fix the issue:

### Step 1: Run the Database Migration

1. Open your **Supabase Dashboard**: https://djrmbhkhkekokrumlwia.supabase.co
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Copy the contents of `supabase-migrations/fix-profiles-auth.sql` and paste it into the editor
5. Click **"Run"** or press `Ctrl+Enter`

This will:
- Create/update the `profiles` table
- Set up Row Level Security (RLS) policies
- Create a trigger that automatically creates profile entries when users sign up
- Backfill profiles for any existing users

### Step 2: Verify the Fix

After running the migration, run this command to verify:

```bash
npx tsx scripts/check-current-user.ts
```

You should now see profiles in the database.

### Step 3: Test with Restaurant User

1. **Clear browser data**:
   - Open Developer Tools (F12)
   - Go to Application tab (Chrome) or Storage tab (Firefox)
   - Clear all Cookies and Local Storage for localhost:3000

2. **Sign up/login fresh**:
   - Go to http://localhost:3000
   - Sign up as a new restaurant user OR log in with existing credentials
   - Complete the onboarding flow

3. **Verify navigation works**:
   - You should see the hamburger menu in the top-left
   - Click it to open the navigation sidebar
   - Test the Home, Profile, and Sign Out links

### Step 4: For Existing Users

If you have existing users that were created before running the migration:

1. The migration includes a backfill step (Step 7) that should automatically create profiles
2. However, existing users should:
   - Sign out completely
   - Clear cookies and local storage
   - Sign back in

### Troubleshooting

If navigation still doesn't show:

1. **Check browser console** for the warning message:
   ```
   Navigation hidden: user exists but userType is missing
   ```

2. **Verify in Supabase**:
   - Go to Table Editor > profiles
   - Check that your user has a record with `user_type` set to either 'worker' or 'restaurant'

3. **Check the auth metadata**:
   - Go to Authentication > Users in Supabase
   - Click on a user
   - Check the "User Metadata" section
   - Ensure `user_type` is set in the metadata

4. **Re-run the verification script**:
   ```bash
   npx tsx scripts/check-current-user.ts
   ```

## Technical Details

### Why This Happened

The application's Navigation component at `src/components/Navigation.tsx:14-20` has this logic:

```typescript
if (loading || !user || !userType) {
  return null;
}
```

The `userType` comes from the `AuthContext` which fetches it from the `profiles` table:

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('user_type')
  .eq('id', userId)
  .single();
```

Without the database trigger in place, no profile entries were being created, so `userType` was always `null`, causing the Navigation to never render.

### Files Modified

- Created: `scripts/check-user-profiles.ts` - Admin script to check all users
- Created: `scripts/check-current-user.ts` - Script to check profiles in database
- Modified: `src/components/Navigation.tsx` - Added warning log for debugging
- Existing: `supabase-migrations/fix-profiles-auth.sql` - Database migration (already existed, just needs to be run)

## Next Steps

After fixing this issue, you may want to:

1. Set up proper database migrations workflow
2. Add error handling for missing profiles in the UI
3. Create an admin panel to manage user profiles
4. Add tests to ensure profiles are created on signup
