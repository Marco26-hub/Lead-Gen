import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './config';

let _admin: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service-role key. Singleton.
 * NEVER import this into client components — it carries the service-role key.
 */
export function getServiceClient(): SupabaseClient {
  if (_admin) return _admin;
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — set them in .env');
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
