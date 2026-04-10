const SUPABASE_URL = 'https://pikshmosfhdwqvcomwrr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3NobW9zZmhkd3F2Y29td3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzkwMTQsImV4cCI6MjA5MTQxNTAxNH0.1nWhAuRdkPESkKMXxl3tA7zLy4FrQ0bmwfhTNxAg2Y0'

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

export interface StokeEntry {
  id: string
  avatar: string
  name: string
  city: string
  note: string
  created_at: string
}

export interface ClassSignup {
  id: string
  name: string
  email: string
  phone?: string
  age?: number
  class_type: string
  skill_level?: string
  message?: string
  created_at: string
}

export async function insertClassSignup(data: Omit<ClassSignup, 'id' | 'created_at'>): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/class_signups`,
    {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify(data),
    }
  )
  if (!res.ok) throw new Error('Failed to save signup')
}

export async function fetchClassSignups(): Promise<ClassSignup[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/class_signups?select=*&order=created_at.desc`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error('Failed to fetch signups')
  return res.json()
}

export async function fetchStokeEntries(): Promise<StokeEntry[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stoke_entries?select=*&order=created_at.desc`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error('Failed to fetch entries')
  return res.json()
}

export async function insertStokeEntry(entry: Omit<StokeEntry, 'id' | 'created_at'>): Promise<StokeEntry> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stoke_entries`,
    {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(entry),
    }
  )
  if (!res.ok) throw new Error('Failed to insert entry')
  const rows = await res.json()
  return rows[0]
}
