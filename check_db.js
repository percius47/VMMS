const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDocumentsTable() {
  try {
    console.log('Checking if documents table exists...');
    
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

async function checkStorageBucket() {
  try {
    console.log('Checking if vendor-documents bucket exists...');
    
    // Try to list buckets
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('Error listing buckets:', error.message);
      return false;
    }
    
    const bucketExists = data.some(bucket => bucket.name === 'vendor-documents');
    console.log(bucketExists ? 'vendor-documents bucket exists' : 'vendor-documents bucket does not exist');
    return bucketExists;
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  console.log('Checking database setup...');
  
  const tableExists = await checkDocumentsTable();
  const bucketExists = await checkStorageBucket();
  
  console.log('\nSummary:');
  console.log('- Documents table:', tableExists ? 'Exists' : 'Missing');
  console.log('- vendor-documents bucket:', bucketExists ? 'Exists' : 'Missing');
  
  if (!tableExists || !bucketExists) {
    console.log('\nPlease follow the setup instructions in SUPABASE_STORAGE_SETUP.md');
  }
}

main();