import { createClient } from '@supabase/supabase-js';


/**
 * Initialize Supabase client using config from multiple sources:
 * - Expo environment variables (EXPO_PUBLIC_*)
 * - Next.js environment variables (NEXT_PUBLIC_*)
 * - window.SUPABASE_CONFIG (for static deployments)
 * - Fallback environment variables
 */
const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== 'undefined' && (window as any).SUPABASE_CONFIG?.url);

const supabaseKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    (typeof window !== 'undefined' && (window as any).SUPABASE_CONFIG?.key);

if (!supabaseUrl) {
  throw new Error('Supabase URL not found. Please set EXPO_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!supabaseKey) {
  throw new Error('Supabase key not found. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };