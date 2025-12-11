# Documentation Uploader

A CRUD system for managing documentation with Supabase integration and email notifications.

## Features

- 🔐 Authentication with specific emails and passwords
- 📝 Create, Read, Update, Delete documentation
- 📄 File upload support (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX)
- 📧 Email notifications when new documents are uploaded (includes file info)
- 🎨 Modern, responsive UI
- 🚪 Sign out functionality
- 💾 Files stored in Supabase Storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file in the root directory with the following:

```
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

3. Set up Supabase database:
   - Go to your Supabase dashboard
   - Run the SQL from `supabase-migration.sql` in the SQL Editor
   - This creates the `documents` table with file support fields

4. Set up Supabase Storage:
   - Go to Storage in your Supabase dashboard
   - Create a bucket named `documents` (must be public or configure policies)
   - See `storage-setup.md` for detailed instructions

5. Configure email settings:
   - For Gmail, you'll need to create an App Password:
     1. Go to your Google Account settings
     2. Enable 2-Step Verification
     3. Generate an App Password
     4. Use that password in `SMTP_PASS`

6. Configure allowed users:
   - Edit `lib/auth.ts` to add/modify allowed emails and passwords

## Default Credentials

The default allowed users are defined in `lib/auth.ts`. You can modify them there:
- Email: `admin@example.com`, Password: `admin123`
- Email: `user@example.com`, Password: `user123`

## Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Sign in with one of the allowed email/password combinations
2. Click "Add New Document" to create documentation
3. Fill in the title and content
4. (Optional) Upload a document file (PDF, Word, Excel, PowerPoint, etc.)
5. Click "Create" to save
6. When you upload a new document, an email will be sent to M7mdrf3t0@gmail.com with file information
7. Edit or delete existing documents using the action buttons
8. Download uploaded files using the "Download" link
9. Click "Sign Out" to log out

## File Upload

The application supports uploading various document types:
- PDF files (.pdf)
- Word documents (.doc, .docx)
- Text files (.txt)
- Excel spreadsheets (.xls, .xlsx)
- PowerPoint presentations (.ppt, .pptx)

Files are stored in Supabase Storage and can be downloaded directly from the interface.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts      # Email notification API
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page with CRUD interface
├── lib/
│   ├── auth.ts               # Authentication logic
│   ├── email.ts              # Email sending functionality
│   └── supabase.ts           # Supabase client configuration
├── supabase-migration.sql    # Database schema (with file support)
├── supabase-migration-add-files.sql  # Migration for existing tables
├── storage-setup.md          # Storage bucket setup instructions
└── package.json
```

## Updating Existing Database

If you already have the `documents` table without file fields, run `supabase-migration-add-files.sql` to add the file columns.

