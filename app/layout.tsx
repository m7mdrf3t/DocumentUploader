import './globals.css'
import type { Metadata } from 'next'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Documentation Uploader',
  description: 'CRUD system for documentation management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Inject environment variables for client-side access
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''
  
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__NEXT_PUBLIC_SUPABASE_URL__ = ${JSON.stringify(supabaseUrl)};
              window.__NEXT_PUBLIC_SUPABASE_KEY__ = ${JSON.stringify(supabaseKey)};
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
