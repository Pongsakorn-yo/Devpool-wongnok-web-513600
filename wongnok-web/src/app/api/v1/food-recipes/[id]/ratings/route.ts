import { NextRequest, NextResponse } from 'next/server'

// Proxy GET/POST /api/v1/food-recipes/:id/ratings to Go backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const id = params.id
    const resp = await fetch(`${base}/api/v1/food-recipes/${encodeURIComponent(id)}/ratings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })
    const text = await resp.text()
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
    console.error('proxy ratings GET failed:', err)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const id = params.id
    const body = await request.json().catch(() => ({}))
    const resp = await fetch(`${base}/api/v1/food-recipes/${encodeURIComponent(id)}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    })
    const text = await resp.text()
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
    console.error('proxy ratings POST failed:', err)
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
  }
}
