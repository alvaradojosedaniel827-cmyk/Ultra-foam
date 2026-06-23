// Public credentials — security lives in Supabase Row Level Security (RLS) policies.
// The anon key is safe to expose in frontend code. Never use service_role key here.

const SUPABASE_URL = 'https://ahfwoxvqiupdnuvzypog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BLO8tclv9YBhyYlyikei0g_0tiPIRWA';

// supabase SDK is loaded via CDN before this script (see admin.html <head>)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
