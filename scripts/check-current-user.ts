/**
 * Script to check the current logged-in user's profile
 * This version doesn't require service role key
 *
 * NOTE: You need to be logged in for this to work.
 * The script will use the same cookies as your browser session.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔍 This script will check profiles in your database...\n');
console.log('📋 Checking profiles table for all users:\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  try {
    // Get all profiles (this should work with anon key if RLS allows)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_type, created_at');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message);
      console.error('\n💡 This might be due to RLS policies.');
      console.error('You can check profiles directly in Supabase dashboard:');
      console.error('   1. Go to your Supabase project');
      console.error('   2. Click on "Table Editor"');
      console.error('   3. Select the "profiles" table');
      console.error('   4. Check if all users have a "user_type" set\n');
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No profiles found in the database.');
      console.log('This means users have not completed onboarding.\n');
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles\n`);

    const workersCount = profiles.filter(p => p.user_type === 'worker').length;
    const restaurantsCount = profiles.filter(p => p.user_type === 'restaurant').length;
    const missingTypeCount = profiles.filter(p => !p.user_type).length;

    console.log('Profile Breakdown:');
    console.log('==================================================');
    console.log(`✅ Workers: ${workersCount}`);
    console.log(`✅ Restaurants: ${restaurantsCount}`);
    console.log(`${missingTypeCount > 0 ? '❌' : '✅'} Missing user_type: ${missingTypeCount}`);
    console.log('');

    if (missingTypeCount > 0) {
      console.log('⚠️  ISSUE FOUND:');
      console.log(`${missingTypeCount} user(s) have NULL user_type in profiles table.`);
      console.log('This will prevent the Navigation component from showing!\n');

      console.log('Profiles with missing user_type:');
      profiles.filter(p => !p.user_type).forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.id.substring(0, 8)}... (created: ${new Date(p.created_at).toLocaleString()})`);
      });

      console.log('\n🔧 TO FIX THIS:');
      console.log('Option 1: Update manually in Supabase dashboard');
      console.log('   1. Go to Supabase > Table Editor > profiles');
      console.log('   2. Find users with NULL user_type');
      console.log('   3. Set user_type to either "worker" or "restaurant"');
      console.log('');
      console.log('Option 2: Have users complete onboarding again');
      console.log('   - Users should sign up/login and complete the onboarding flow');
      console.log('');
    } else {
      console.log('✅ All profiles have valid user_type set!');
      console.log('If navigation still doesn\'t show, try:');
      console.log('   1. Clear browser cookies and local storage');
      console.log('   2. Sign out and sign back in');
      console.log('   3. Check browser console for errors');
    }

    // Check for worker_profiles
    const { data: workerProfiles, error: wpError } = await supabase
      .from('worker_profiles')
      .select('id, user_id');

    if (!wpError) {
      console.log(`\n📋 Worker Profiles: ${workerProfiles?.length || 0}`);
    }

    // Check for restaurant_profiles
    const { data: restaurantProfiles, error: rpError } = await supabase
      .from('restaurant_profiles')
      .select('id, user_id');

    if (!rpError) {
      console.log(`📋 Restaurant Profiles: ${restaurantProfiles?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProfiles().then(() => {
  console.log('\n✅ Check complete!\n');
  console.log('If you need more detailed information, check your Supabase dashboard:');
  console.log(`   ${supabaseUrl}/project/_/editor`);
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
