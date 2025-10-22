/**
 * Script to check and verify user profiles in the database
 * Run this with: npx tsx scripts/check-user-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserProfiles() {
  console.log('🔍 Checking user profiles...\n');

  try {
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`📊 Found ${authUsers.users.length} users in auth\n`);

    // Check each user's profile
    for (const authUser of authUsers.users) {
      console.log(`\n👤 User: ${authUser.email}`);
      console.log(`   ID: ${authUser.id}`);
      console.log(`   Created: ${new Date(authUser.created_at).toLocaleString()}`);

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('   ❌ Profile: MISSING in profiles table');
          console.log('   ⚠️  This will cause navigation issues!');
        } else {
          console.log('   ❌ Profile Error:', profileError.message);
        }
      } else {
        console.log(`   ✅ Profile: EXISTS`);
        console.log(`   📋 User Type: ${profile.user_type || '⚠️  MISSING'}`);

        if (!profile.user_type) {
          console.log('   ⚠️  WARNING: user_type is null - navigation will not work!');
        }

        // Check for worker or restaurant specific profile
        if (profile.user_type === 'worker') {
          const { data: workerProfile } = await supabase
            .from('worker_profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

          console.log(`   🔹 Worker Profile: ${workerProfile ? 'EXISTS' : 'NOT FOUND'}`);
        } else if (profile.user_type === 'restaurant') {
          const { data: restaurantProfile } = await supabase
            .from('restaurant_profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

          console.log(`   🔹 Restaurant Profile: ${restaurantProfile ? 'EXISTS' : 'NOT FOUND'}`);
        }
      }
    }

    console.log('\n\n📋 Summary:');
    console.log('==================================================');

    // Get counts
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, user_type');

    const workersCount = profiles?.filter(p => p.user_type === 'worker').length || 0;
    const restaurantsCount = profiles?.filter(p => p.user_type === 'restaurant').length || 0;
    const missingTypeCount = profiles?.filter(p => !p.user_type).length || 0;
    const missingProfileCount = authUsers.users.length - (profiles?.length || 0);

    console.log(`Total Auth Users: ${authUsers.users.length}`);
    console.log(`Total Profiles: ${profiles?.length || 0}`);
    console.log(`Workers: ${workersCount}`);
    console.log(`Restaurants: ${restaurantsCount}`);
    console.log(`Missing user_type: ${missingTypeCount} ${missingTypeCount > 0 ? '⚠️' : ''}`);
    console.log(`Missing profile: ${missingProfileCount} ${missingProfileCount > 0 ? '⚠️' : ''}`);

    if (missingTypeCount > 0 || missingProfileCount > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('Some users have missing profiles or user_types.');
      console.log('This will prevent the Navigation component from rendering.');
      console.log('\nTo fix this, you can:');
      console.log('1. Have users complete the onboarding process');
      console.log('2. Manually update the profiles table in Supabase');
      console.log('3. Run a migration script to populate missing data');
    } else {
      console.log('\n✅ All users have valid profiles with user_types set!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkUserProfiles().then(() => {
  console.log('\n✅ Check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
