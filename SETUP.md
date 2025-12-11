# Setup Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Environment File

Create a file named `.env.local` in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jruczwxggaetjmawzdte.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydWN6d3hnZ2FldGptYXd6ZHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ0MzU4NywiZXhwIjoyMDgxMDE5NTg3fQ.mI-kFxPMsFvAkfPzNwTVLU1J8d1dp42LwmePCuVMWx0

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_EMAIL=M7mdrf3t0@gmail.com
```

**Important:** 
- Replace `your-email@gmail.com` and `your-app-password` with your actual Gmail credentials.
- `NOTIFICATION_EMAIL` can be a single email or multiple emails separated by commas (e.g., `email1@gmail.com,email2@gmail.com`)

### Getting Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Step Verification if not already enabled
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Use that 16-character password in `SMTP_PASS` **without spaces**

**Example:** If Google shows `wfck tyvn qiry ddcf`, write it as `wfcktyvnqiryddcf` in your `.env.local` file.

## Step 3: Set Up Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Run the SQL from `supabase-migration.sql`:

```sql
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy (allows all operations - adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Step 4: Configure Authentication

Edit `lib/auth.ts` to set your allowed emails and passwords:

```typescript
const ALLOWED_USERS = [
  { email: 'your-email@example.com', password: 'your-password' },
  // Add more users as needed
]
```

## Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Test Credentials

The default credentials in `lib/auth.ts` are:
- Email: `admin@example.com`, Password: `admin123`
- Email: `user@example.com`, Password: `user123`

**Remember to change these before deploying to production!**

