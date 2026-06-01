import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const LANGGRAPH_URL = process.env.LANGGRAPH_SERVICE_URL || 'http://localhost:8000'
const LANGGRAPH_TOKEN = process.env.LANGGRAPH_SERVICE_TOKEN || ''

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const category = request.nextUrl.searchParams.get('category')
  if (!category) return NextResponse.json({ error: 'category parameter required' }, { status: 400 })

  try {
    const res = await fetch(
      `${LANGGRAPH_URL}/insights/latest?category=${encodeURIComponent(category)}`,
      {
        headers: {
          'Authorization': `Bearer ${LANGGRAPH_TOKEN}`,
          'X-User-Id': user.id,
        },
      },
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Insight service unavailable' }))
      return NextResponse.json(err, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'insufficient_data', category, hint: 'Insight service is currently unavailable. Your insights will appear once the service reconnects.' },
      { status: 200 },
    )
  }
}