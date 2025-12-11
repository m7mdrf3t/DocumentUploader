import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Function to get Supabase URL - reads from env at runtime
function getSupabaseUrl(): string {
  // In browser, try to get from window (injected by server)
  if (typeof window !== 'undefined') {
    const windowUrl = (window as any).__NEXT_PUBLIC_SUPABASE_URL__
    if (windowUrl) return windowUrl
  }
  // Server-side: read from environment
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jruczwxggaetjmawzdte.supabase.co'
}

// Function to get Supabase key - reads from env at runtime
function getSupabaseKey(): string {
  // In browser, try to get from window (injected by server)
  if (typeof window !== 'undefined') {
    const windowKey = (window as any).__NEXT_PUBLIC_SUPABASE_KEY__
    if (windowKey) return windowKey
  }
  // Server-side: read from environment
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_cHmPilbJcymG4D03QpYyZA_Ktu6xZU9'
}

// Lazy initialization - create client when first accessed
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = getSupabaseUrl()
    const key = getSupabaseKey()
    
    // Validate that we have real values, not placeholders
    if (url.includes('placeholder') || key.includes('placeholder')) {
      console.error('⚠️ Supabase configuration missing or using placeholders. Check environment variables.')
    }
    
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

// Export singleton instance
export const supabase = getSupabaseClient()

// Service role client for admin operations (server-side only)
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!serviceRoleKey || !url) {
    throw new Error('Missing Supabase service role key or URL')
  }
  
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

