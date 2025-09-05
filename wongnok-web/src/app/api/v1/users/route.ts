import { NextRequest, NextResponse } from 'next/server'

// Proxy GET/PUT/POST for current user to Go backend
export async function GET(request: NextRequest) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const resp = await fetch(`${base}/api/v1/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })

    const data = await resp.text()
    return new NextResponse(data, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
  console.error('proxy users GET failed:', err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const resp = await fetch(`${base}/api/v1/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: await request.text(),
    })
    const data = await resp.text()
    return new NextResponse(data, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
  console.error('proxy users POST failed:', err)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
    const resp = await fetch(`${base}/api/v1/users/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: await request.text(),
    })
    const data = await resp.text()
    return new NextResponse(data, { status: resp.status, headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' } })
  } catch (err) {
  console.error('proxy users PUT failed:', err)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
