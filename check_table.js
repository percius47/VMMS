const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDocumentsTable() {
  try {
    // Try to query the documents table
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "documents" does not exist')) {
        console.log('Documents table does not exist');
        return false;
      } else {
        console.log('Error querying documents table:', error.message);
        return false;
      }
    }

    console.log('Documents table exists');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return false;
  }
}

checkDocumentsTable().then(exists => {
  process.exit(exists ? 0 : 1);
});