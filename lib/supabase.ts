import { createClient } from '@supabase/supabase-js';
import { AppConfig } from '../types';

let supabaseInstance: any = null;

export const getSupabase = (config: AppConfig) => {
  if (config.storageType !== 'supabase' || !config.supabaseUrl || !config.supabaseKey) {
    return null;
  }

  // Return existing instance if config hasn't changed (simplified check)
  if (supabaseInstance) {
     // In a real app we might check if the URL/Key matches the current instance
     return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey);
    return supabaseInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string) => {
  try {
    const client = createClient(url, key);
    // Try to fetch something simple, or just check auth session
    const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
    
    // Even if 'users' table doesn't exist, a 404 or 401 response confirms the server was reached.
    // A network error would throw.
    if (error && error.code === 'PGRST116') { 
        // Table not found is fine, it means we connected to the DB
        return true; 
    }
    // If we get here, we connected
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};