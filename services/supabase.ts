import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuyhqfoteehnexvndbvj.supabase.co';
const supabaseAnonKey = 'sb_publishable_X3WUNo4mgksqWwh77k77Sw_Q9pqMM9e';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
