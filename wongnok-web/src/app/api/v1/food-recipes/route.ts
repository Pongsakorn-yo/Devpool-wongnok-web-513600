import { NextRequest, NextResponse } from 'next/server'

// Proxy API requests to Go backend
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const queryString = searchParams.toString()
  
  try {
  const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
  const backendUrl = `${base}/api/v1/food-recipes${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
  console.error('proxy food-recipes GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
  const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
  const response = await fetch(`${base}/api/v1/food-recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorData = await response.text()
  console.error('proxy food-recipes backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create recipe', details: errorData },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
    
  } catch (error) {
  console.error('proxy food-recipes POST failed:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
