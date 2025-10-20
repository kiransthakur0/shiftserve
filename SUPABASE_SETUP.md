# Supabase Setup Instructions

This guide will help you set up the Supabase database for ShiftServe.

## Prerequisites

1. A Supabase account at [supabase.com](https://supabase.com)
2. A project created in Supabase

## Setup Steps

### Step 1: Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.

### Step 2: Choose Your Setup Method

#### Option A: Fresh Installation (Recommended for new projects)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open the `supabase-schema.sql` file from this repository
4. **Uncomment lines 15-22** to drop existing tables
5. Copy the entire file contents
6. Paste into Supabase SQL Editor
7. Click **Run**

#### Option B: Update Existing Database (If you have data)

If you already have a database with data and just need to add missing fields:

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open the `supabase-migrations/add-missing-fields.sql` file
4. Copy the entire file contents
5. Paste into Supabase SQL Editor
6. Click **Run**

This will add missing fields without dropping any existing data.

### Step 3: Verify Setup

After running the SQL, verify the following tables exist:

1. **profiles** - User profile base table
2. **worker_profiles** - Worker-specific data
3. **restaurant_profiles** - Restaurant-specific data
4. **shifts** - Shift listings
5. **shift_applications** - Worker applications to shifts

### Step 4: Enable Required Extensions

The schema automatically enables these extensions:
- `uuid-ossp` - For UUID generation
- `postgis` - For location-based queries

If you see errors about extensions, manually enable them:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### Step 5: Verify Row Level Security (RLS)

All tables should have RLS enabled. Verify in **Database** > **Tables** that each table shows "RLS enabled" status.

## Database Schema Overview

### Tables

#### profiles
Base profile for all users, created automatically on signup.
- Links to `auth.users`
- Contains `user_type` ('worker' or 'restaurant')

#### worker_profiles
Extended profile for workers:
- name, email, phone
- certifications, skills, roles (arrays)
- service_radius, experience level
- availability (JSONB)
- location (geography point)

#### restaurant_profiles
Extended profile for restaurants:
- restaurant_name, email, phone
- description, cuisine_type, restaurant_type
- address, location (geography point)
- operating_hours (JSONB), pay_range (JSONB)
- common_roles, benefits (arrays)
- manager details

#### shifts
Shift postings by restaurants:
- restaurant_id (FK to restaurant_profiles)
- role, hourly_rate, duration
- start_time, shift_date
- urgency_level, bonus_percentage
- status ('draft', 'published', 'filled', 'cancelled')
- requirements (array)

#### shift_applications
Worker applications to shifts:
- shift_id (FK to shifts)
- worker_id (FK to worker_profiles)
- status ('pending', 'accepted', 'rejected', 'withdrawn')
- message (optional cover letter)

## Security Policies

The schema includes comprehensive RLS policies:

### Workers can:
- View and edit their own profile
- View restaurant profiles
- View published shifts
- Apply to shifts
- View and update their own applications

### Restaurants can:
- View and edit their own profile
- View worker profiles
- Create, view, update, and delete their own shifts
- View and update applications for their shifts

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** Run the full schema file again, ensuring all tables are created.

### Issue: "permission denied for table"
**Solution:** Check that RLS policies are properly set up. Re-run the policy section of the schema.

### Issue: "column does not exist"
**Solution:** Run the migration file `supabase-migrations/add-missing-fields.sql` to add missing columns.

### Issue: Auth trigger not working
**Solution:** Verify the `handle_new_user()` function and trigger exist:

```sql
-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If missing, re-run lines 322-340 from the schema file.

## Testing Your Setup

After setup, test by:

1. Signing up as a worker
2. Completing worker onboarding
3. Verifying profile is created in `worker_profiles` table
4. Signing up as a restaurant
5. Completing restaurant onboarding
6. Creating a test shift
7. Verifying shift appears in `shifts` table

## Need Help?

If you encounter issues:
1. Check Supabase logs in **Database** > **Logs**
2. Verify all extensions are enabled
3. Ensure environment variables are correct
4. Check that RLS policies are active

## Updates and Migrations

When updating the schema:
1. Always backup your data first
2. Use the migration files in `supabase-migrations/`
3. Test on a development project before production
4. Document any custom changes
