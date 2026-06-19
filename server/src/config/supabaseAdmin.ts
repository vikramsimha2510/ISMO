import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Supabase client initialized with the **service-role key**.
 * This bypasses RLS and has full admin access — use ONLY on the server.
 * Never import this in frontend code or expose the key.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
