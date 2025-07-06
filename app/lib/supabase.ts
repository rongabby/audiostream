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

// Create a mock client if environment variables are missing (for development/demo)
let supabase: any;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. Using mock client.');
  console.warn('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  
  // Create a mock Supabase client that doesn't break the app
  const createMockQuery = () => ({
    select: (columns: string = '*') => createMockQuery(),
    eq: (column: string, value: any) => createMockQuery(),
    neq: (column: string, value: any) => createMockQuery(),
    gt: (column: string, value: any) => createMockQuery(),
    gte: (column: string, value: any) => createMockQuery(),
    lt: (column: string, value: any) => createMockQuery(),
    lte: (column: string, value: any) => createMockQuery(),
    like: (column: string, pattern: string) => createMockQuery(),
    ilike: (column: string, pattern: string) => createMockQuery(),
    in: (column: string, values: any[]) => createMockQuery(),
    is: (column: string, value: any) => createMockQuery(),
    single: () => Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any, reject: any) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
    insert: (values: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update: (values: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    upsert: (values: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
  });

  supabase = {
    auth: {
      signIn: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => createMockQuery(),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        remove: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}


export { supabase };