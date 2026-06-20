import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tdsezizwiaghqbheqqwp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkc2V6aXp3aWFnaHFiaGVxcXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTEzNjEsImV4cCI6MjA5NzI2NzM2MX0.VzSTBHYPbXUB2hTOjZ7SxH6HmFEGeUX7iJjnG4FkyyY';

export const supabase = createClient(supabaseUrl, supabaseA