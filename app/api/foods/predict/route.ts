import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local to enable macro predictions.' },
      { status: 501 },
    )
  }

  const { name, brand } = await request.json()
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const prompt = `You are a nutrition database. Given a food name${brand ? ` and brand "${brand}"` : ''}, estimate the macronutrient values per 100g. Be realistic based on common nutritional databases. Respond ONLY with valid JSON (no markdown fences, no explanation):

{
  "calories_per_100g": <number>,
  "protein_g": <number>,
  "carb_g": <number>,
  "fat_g": <number>,
  "fiber_g": <number|null>,
  "sodium_mg": <number|null>
}

Food: ${name}${brand ? ` (${brand})` : ''}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 200,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'OpenAI request failed' }))
      return NextResponse.json({ error: err.error ?? 'OpenAI request failed' }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 })
    }

    const parsed = JSON.parse(content)

    return NextResponse.json({
      calories_per_100g: Number(parsed.calories_per_100g) || 0,
      protein_g: Number(parsed.protein_g) || 0,
      carb_g: Number(parsed.carb_g) || 0,
      fat_g: Number(parsed.fat_g) || 0,
      fiber_g: parsed.fiber_g != null ? Number(parsed.fiber_g) : null,
      sodium_mg: parsed.sodium_mg != null ? Number(parsed.sodium_mg) : null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Prediction failed' }, { status: 500 })
  }
}