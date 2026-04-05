import { createClient } from '@supabase/supabase-js'

// Create a single instance of the Supabase client to avoid multiple GoTrueClient warnings
// This uses the anon key and is safe to use in the browser
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
