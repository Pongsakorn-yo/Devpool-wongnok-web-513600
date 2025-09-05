import { NextRequest, NextResponse } from 'next/server'

// Proxy GET /api/v1/users/:id/food-recipes to Go backend
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const userId = params.id

    const resp = await fetch(`${base}/api/v1/users/${encodeURIComponent(userId)}/food-recipes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })

    const text = await resp.text()
    return new NextResponse(text, {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
      },
    })
  } catch (err) {
  console.error('proxy users/:id/food-recipes GET failed:', err)
    return NextResponse.json({ error: 'Failed to fetch user recipes' }, { status: 500 })
  }
}
