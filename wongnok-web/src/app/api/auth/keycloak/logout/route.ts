import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token: any = await getToken({ req: request })
  const origin = request.nextUrl.origin
  // Prefer explicit /auth/signed-out page to ensure NextAuth clears client session
  const envRedirect = process.env.KEYCLOAK_POST_LOGOUT_REDIRECT_URI
  let configuredRedirect = envRedirect || `${origin}/auth/signed-out`
  try {
    const u = new URL(configuredRedirect)
    // If env only provided origin or root path, normalize to signed-out page on current origin
    if (u.pathname === '' || u.pathname === '/') {
      configuredRedirect = `${origin}/auth/signed-out`
    }
  } catch {
    // Fallback to signed-out if env var is not a valid URL
    configuredRedirect = `${origin}/auth/signed-out`
  }
    const issuer = process.env.KEYCLOAK_ISSUER
    if (!issuer) {
      return NextResponse.json({ error: 'KEYCLOAK_ISSUER not configured' }, { status: 500 })
    }

  const params = new URLSearchParams()
  params.set('post_logout_redirect_uri', configuredRedirect)
    if (token?.idToken) params.set('id_token_hint', String(token.idToken))
    if (process.env.KEYCLOAK_CLIENT_ID) params.set('client_id', process.env.KEYCLOAK_CLIENT_ID)

    const logoutUrl = `${issuer}/protocol/openid-connect/logout?${params.toString()}`
    return NextResponse.redirect(logoutUrl, { status: 302 })
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
