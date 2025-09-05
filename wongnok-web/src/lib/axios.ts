// จุดประสงค์: ไฟล์ตั้งค่า Axios ส่วนกลางของฝั่ง Next.js (ใช้ทั้งฝั่ง client และ server)
//
// พฤติกรรมสำคัญ (อธิบายกับอาจารย์ได้):
// - บนเบราว์เซอร์ เราเรียก Next.js API (โดเมนเดียวกัน) ซึ่งทำหน้าที่ proxy ไปยัง Go API อีกที
// - ใส่ Header Authorization: Bearer ... ให้อัตโนมัติผ่าน request interceptor
//   โดย “พยายามใช้ idToken (OIDC) ก่อน” เพราะ backend ตรวจสอบด้วยตัวตรวจ OIDC
//   ถ้าไม่มี idToken ค่อย fallback ไปใช้ accessToken
// - ข้ามการอ่าน session ในเส้นทางที่ขึ้นต้นด้วย /auth/ ของ NextAuth เพื่อลดโอกาส JSON parse error ระหว่าง redirect
// - กรณี 401 สามารถโยนไปหน้า sign-in ได้ (ทำเป็น guard ได้)
import axios from 'axios'
import { getSession, signIn } from 'next-auth/react'

// Use relative baseURL in the browser (goes through Nginx /api),
// and internal service name inside the container for server-side code.
const isBrowser = typeof window !== 'undefined'
const baseURL = isBrowser
  ? process.env.NEXT_PUBLIC_BASE_PATH || ''
  : process.env.INTERNAL_API_BASE || 'http://go-wongnok:8080'

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use(async (config) => {
  try {
    if (typeof window !== 'undefined') {
      // Skip token fetch on auth-related pages to avoid next-auth client fetch errors during redirects
      const path = window.location.pathname || ''
      if (path.startsWith('/auth') || path.startsWith('/api/auth')) {
        return config
      }
      // Wait briefly for NextAuth to hydrate on first load to reduce 401s
      let session = await getSession()
      if (!session) {
        await new Promise((r) => setTimeout(r, 150))
        session = await getSession()
      }

      const tokenToUse = (session as any)?.idToken || (session as any)?.accessToken
      if (tokenToUse) {
        config.headers = config.headers || {}
        ;(config.headers as any).Authorization = `Bearer ${tokenToUse}`
      }
    }
  } catch {
    // Swallow and proceed without token
  console.error('axios: access token fetch failed')
  }
  return config
})

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Avoid loops: only redirect if we're not already on auth pages
      const onAuth = window.location.pathname.startsWith('/auth')
      if (!onAuth) signIn('keycloak')
    }
    return Promise.reject(error)
  }
)
