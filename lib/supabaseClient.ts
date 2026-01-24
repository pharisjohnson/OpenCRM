import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Initializing Supabase with URL:', supabaseUrl ? 'Set' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your .env file and RESTART the dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
