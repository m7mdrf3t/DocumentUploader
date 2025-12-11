# Supabase Storage Setup

To enable file uploads, you need to create a storage bucket in Supabase:

## Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"** or **"Create bucket"**
5. Configure the bucket:
   - **Name**: `documents` (must match exactly)
   - **Public bucket**: ✅ Yes (or configure policies if you want private)
   - **File size limit**: Set according to your needs (e.g., 50MB)
   - **Allowed MIME types**: Leave empty for all types, or specify:
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `text/plain`
     - `application/vnd.ms-excel`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `application/vnd.ms-powerpoint`
     - `application/vnd.openxmlformats-officedocument.presentationml.presentation`

6. Click **"Create bucket"**

## Storage Policies (Optional)

If you want to restrict access, you can create policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documents');
```

For now, making the bucket public is the simplest approach for this application.

