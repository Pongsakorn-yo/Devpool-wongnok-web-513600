import { NextRequest, NextResponse } from 'next/server'

// Proxy POST/DELETE /api/v1/food-recipes/:id/favorites to Go backend
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const id = params.id
    const resp = await fetch(`${base}/api/v1/food-recipes/${encodeURIComponent(id)}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })
    const text = await resp.text()
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
  console.error('proxy favorites POST failed:', err)
    return NextResponse.json({ error: 'Failed to create favorite' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const id = params.id
    const resp = await fetch(`${base}/api/v1/food-recipes/${encodeURIComponent(id)}/favorites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })
    const text = await resp.text()
    return new NextResponse(text, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
  console.error('proxy favorites DELETE failed:', err)
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 })
  }
}
