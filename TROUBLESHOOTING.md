# Troubleshooting Login Issues

## 422 Error on Login Page

If you're seeing a `422 Unprocessable Entity` error, here are the most common causes:

### 1. Email Confirmation Required
**Symptom**: Can't login even with correct credentials
**Cause**: Supabase requires email confirmation by default
**Solution**:
1. Go to your Supabase Dashboard → Authentication → Providers
2. Find "Email" provider settings
3. Disable "Confirm email" option
4. OR check your email inbox for the confirmation link

### 2. Profile Not Created
**Symptom**: Login succeeds but then fails when fetching profile
**Cause**: The `profiles` table trigger isn't working
**Solution**:
1. Run `verify-setup.sql` in Supabase SQL Editor
2. Check if profiles table exists and has your user
3. If missing, run `supabase-schema.sql`
4. Manually insert profile if needed:
```sql
INSERT INTO profiles (id, email, user_type)
SELECT id, email, 'restaurant'
FROM auth.users
WHERE email = 'your-email@example.com';
```

### 3. RLS Policies Blocking Access
**Symptom**: Profile exists but can't be queried
**Cause**: Row Level Security policies are too restrictive
**Solution**:
1. Check policies are created correctly
2. Verify user is authenticated before querying
3. Check policy in Supabase Dashboard → Database → Policies

### 4. Invalid Supabase Credentials
**Symptom**: All API calls fail with 422
**Cause**: Environment variables are incorrect or expired
**Solution**:
1. Check `.env.local` has correct values
2. Verify in Supabase Dashboard → Settings → API
3. Restart dev server after changing env vars

## Debugging Steps

1. **Check browser console** for detailed error messages
2. **Check Network tab** in DevTools to see the failing request
3. **Run verify-setup.sql** to check database setup
4. **Check Supabase logs** in Dashboard → Logs → API Logs

## Common Console Messages

- "Starting login process..." - Login handler triggered ✓
- "User authenticated: [uuid]" - Authentication successful ✓
- "Profile not found" - Trigger not set up or user has no profile ✗
- "Unable to fetch user profile" - RLS policy or other DB error ✗
