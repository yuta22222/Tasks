import { createBrowserClient } from '@supabase/ssr'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = url &&
    url !== 'your-supabase-url' &&
    key &&
    key !== 'your-supabase-anon-key'

  return createBrowserClient(
    isConfigured ? url! : PLACEHOLDER_URL,
    isConfigured ? key! : PLACEHOLDER_KEY
  )
}
