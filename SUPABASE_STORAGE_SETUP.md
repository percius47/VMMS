# Supabase Storage Setup for Vendor Documents

This document explains how to set up Supabase Storage for the vendor document upload feature.

## 1. Create Storage Bucket

1. Log in to your Supabase dashboard
2. Navigate to Storage → Buckets
3. Click "New Bucket"
4. Create a bucket with the following settings:
   - Name: `vendor-documents`
   - Public access: `false` (recommended for security)
   - File size limit: `10MB` (or as needed)

## 2. Set Up Storage Policies

After creating the bucket, you need to set up policies to allow vendors to upload and access their documents:

1. Go to Storage → Buckets → `vendor-documents` → Settings
2. In the Policies section, add the following policies:

### Allow users to upload documents

```sql
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vendor-documents');
```

### Allow users to select their own documents

```sql
CREATE POLICY "Users can select their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-documents'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM vendors WHERE user_id = auth.uid())
);
```

### Allow users to update their own documents

```sql
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vendor-documents'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM vendors WHERE user_id = auth.uid())
);
```

### Allow users to delete their own documents

```sql
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vendor-documents'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM vendors WHERE user_id = auth.uid())
);
```

## 3. Database Schema

Make sure the documents table is created in your database:

```sql
-- Create documents table for storing document metadata
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX idx_documents_vendor_id ON documents(vendor_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_file_type ON documents(file_type);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE documents TO authenticated;
```

## 4. Testing the Setup

1. Make sure your environment variables are set correctly:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Navigate to the vendor dashboard and try uploading a document:
   - Go to `/vendor-dashboard`
   - Click "Manage Documents"
   - Upload a document using the form
   - Verify the document appears in the list with preview options

## 5. Supported File Types

The document upload feature supports the following file types:

- Images: JPG, JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Other files up to 10MB in size

## 6. Security Considerations

- All documents are stored in a private bucket
- Users can only access their own documents
- Signed URLs are generated for temporary access (1 hour by default)
- File names are randomized to prevent conflicts and enhance security
