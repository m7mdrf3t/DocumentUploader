-- Create documents table for the documentation CRUD system
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- Note: Since we're using custom auth, you may want to adjust this policy
-- For now, this allows all operations (you can restrict it later)
CREATE POLICY "Allow all operations for authenticated users" ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: You also need to create a Storage bucket named 'documents' in Supabase
-- Go to Storage > Create Bucket
-- Bucket name: documents
-- Public: Yes (or configure policies as needed)
-- File size limit: Set according to your needs
-- Allowed MIME types: Leave empty or specify: application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation

