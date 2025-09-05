import { NextRequest, NextResponse } from 'next/server'

// Proxy GET /api/v1/food-recipes/favorites to Go backend
export async function GET(request: NextRequest) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const url = new URL(request.url)
    const qs = url.searchParams.toString()
    const resp = await fetch(`${base}/api/v1/food-recipes/favorites${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })
    const text = await resp.text()
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
  console.error('proxy favorites GET failed:', err)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}
