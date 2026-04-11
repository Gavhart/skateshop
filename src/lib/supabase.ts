const SUPABASE_URL = 'https://pikshmosfhdwqvcomwrr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3NobW9zZmhkd3F2Y29td3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzkwMTQsImV4cCI6MjA5MTQxNTAxNH0.1nWhAuRdkPESkKMXxl3tA7zLy4FrQ0bmwfhTNxAg2Y0'

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface StokeEntry {
  id: string
  avatar: string
  name: string
  city: string
  note: string
  approved: boolean
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
  confirmed: boolean
  created_at: string
}

// ── Class Signups ──────────────────────────────────────────────────────────

export async function insertClassSignup(data: Omit<ClassSignup, 'id' | 'created_at' | 'confirmed'>): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_signups`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('Supabase insert error:', res.status, errText)
    throw new Error(`Failed to save signup (${res.status}): ${errText}`)
  }
}

export async function fetchClassSignups(): Promise<ClassSignup[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/class_signups?select=*&order=created_at.desc`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error('Failed to fetch signups')
  return res.json()
}

export async function confirmSignup(id: string, confirmed: boolean): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_signups?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ confirmed }),
  })
  if (!res.ok) throw new Error('Failed to update signup')
}

export async function deleteSignup(id: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_signups?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  })
  if (!res.ok) throw new Error('Failed to delete signup')
}

// ── Wall of Stoke ──────────────────────────────────────────────────────────

export async function fetchStokeEntries(approvedOnly = false): Promise<StokeEntry[]> {
  const filter = approvedOnly ? '&approved=eq.true' : ''
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/stoke_entries?select=*&order=created_at.desc${filter}`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error('Failed to fetch entries')
  return res.json()
}

export async function insertStokeEntry(entry: Omit<StokeEntry, 'id' | 'created_at' | 'approved'>): Promise<StokeEntry> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stoke_entries`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify({ ...entry, approved: false }),
  })
  if (!res.ok) throw new Error('Failed to insert entry')
  const rows = await res.json()
  return rows[0]
}

export async function approveWallEntry(id: string, approved: boolean): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stoke_entries?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ approved }),
  })
  if (!res.ok) throw new Error('Failed to update entry')
}

export async function deleteWallEntry(id: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stoke_entries?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  })
  if (!res.ok) throw new Error('Failed to delete entry')
}
