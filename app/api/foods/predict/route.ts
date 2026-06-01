import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const LANGGRAPH_URL = process.env.LANGGRAPH_SERVICE_URL || 'http://localhost:8000'
const LANGGRAPH_TOKEN = process.env.LANGGRAPH_SERVICE_TOKEN || ''

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, brand } = await request.json()
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${LANGGRAPH_URL}/foods/predict`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LANGGRAPH_TOKEN}`,
        'X-User-Id': user.id,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, brand }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Prediction service unavailable' }))
      return NextResponse.json({ error: err.detail ?? 'Prediction failed' }, { status: res.status })
    }

    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Prediction service unavailable' }, { status: 502 })
  }
}
