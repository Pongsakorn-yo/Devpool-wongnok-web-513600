import axios from 'axios'
import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'

// อธิบายสั้น ๆ: 
// - ใช้ Keycloak เป็น OIDC Provider
// - ฝั่ง discovery (issuer/authorization) ใช้ localhost:8080 ให้เบราว์เซอร์เข้าถึงได้
//   แต่ endpoint server-to-server (token/userinfo) ชี้ไปที่ชื่อบริการใน Docker (keycloak:8080)
// - เก็บ accessToken + idToken ไว้ใน JWT เพื่อนำไปยิง Backend ได้สะดวก
const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? '',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
  // Use localhost:8080 for discovery so the browser gets host-reachable endpoints,
  // but override server-to-server endpoints to Docker-internal service names.
  issuer: `http://localhost:8080/realms/Devpool_project`,
      authorization: {
        url: `http://localhost:8080/realms/Devpool_project/protocol/openid-connect/auth`,
      },
      token: `http://keycloak:8080/realms/Devpool_project/protocol/openid-connect/token`,
      userinfo: `http://keycloak:8080/realms/Devpool_project/protocol/openid-connect/userinfo`,
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    // for keep jwt token
  // เมื่อ login สำเร็จ จะถูกเรียกเพื่อนำ token ต่าง ๆ ใส่ลงใน JWT
  async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        // Prefer ID token for backend verification (OIDC ID token expected by Go verifier)
        // Not all providers always return id_token; Keycloak does by default in OIDC flows.
        // Keep both for flexibility.
        token.idToken = (account as any).id_token
        token.refreshToken = (account as any).refresh_token
        token.userId = account.providerAccountId

  // เรียก API เพิ่ม/อัปเดต user หลัง login สำเร็จ (idempotent)
  try {
          await axios.post(
            `${process.env.INTERNAL_API_BASE}/api/v1/users/`, {},
            {
              headers: {
                // Use ID token for backend which verifies ID tokens (fallback to access token)
                Authorization: `Bearer ${(((account as any).id_token) || account.access_token)}`,
                'Content-Type': 'application/json',
              },
            }
          )
        } catch (err) {
          console.error('Create user error:', err)
        }
      }
      return token
    },

    // ดึงข้อมูล session จาก JWT เพื่อให้ฝั่ง client ใช้งานได้ (accessToken/idToken/userId)
  async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.accessToken = token.accessToken
    session.idToken = (token as any).idToken
        session.userId = token.userId

  // เติมข้อมูลโปรไฟล์ผู้ใช้ (เช่น nickname, imageUrl) ให้ session เพื่อแสดงผล UI
        try {
          const base = process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'
          const resp = await axios.get(`${base}/api/v1/users/`, {
            headers: {
              Authorization: `Bearer ${((token as any).idToken) || token.accessToken}`,
            },
          })
          const me = resp.data as { nickName?: string; imageUrl?: string }
          session.user = session.user || {}
          if (me?.nickName) (session.user as any).nickName = me.nickName
          if (me?.imageUrl) (session.user as any).imageUrl = me.imageUrl
        } catch (e) {
          console.warn('Unable to enrich session with user profile:', e)
        }
      }
      return session
    },

  // กำหนด redirect URL หลังจาก login สำเร็จ (กัน loop ชั่วคราวด้วยการส่งกลับ home)
  async redirect({ baseUrl }: { url: string; baseUrl: string }) {
      // Temporary: Always redirect to home to avoid loops
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
})

export { handler as GET, handler as POST }
