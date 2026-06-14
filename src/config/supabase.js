import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlkcqjddcgrrfwzkewpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsa2NxamRkY2dycmZ3emtld3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDIxNDIsImV4cCI6MjA5Njk3ODE0Mn0.aw0maahoJz-bfR5yUgzjiQr2ifXLkoOCHqRcJPTmbNQ'; 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase