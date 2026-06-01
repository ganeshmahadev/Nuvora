import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const LANGGRAPH_URL = process.env.LANGGRAPH_SERVICE_URL || 'http://localhost:8000'
const LANGGRAPH_TOKEN = process.env.LANGGRAPH_SERVICE_TOKEN || ''

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { category?: string; reference_date?: string; force_regenerate?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.category) return NextResponse.json({ error: 'category is required' }, { status: 400 })

  try {
    const res = await fetch(`${LANGGRAPH_URL}/insights/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LANGGRAPH_TOKEN}`,
        'X-User-Id': user.id,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: body.category,
        reference_date: body.reference_date,
        force_regenerate: body.force_regenerate ?? false,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Insight generation failed' }))
      return NextResponse.json(err, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'insufficient_data', category: body.category, hint: 'Insight service is currently unavailable.' },
      { status: 200 },
    )
  }
}