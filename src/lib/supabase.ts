import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (for file uploads)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const BUCKET_NAME = 'pakji-kambing-photo';
