// Router Guard
// ปกป้องเส้นทางบางหน้า (create/edit/my-*) ให้เข้าถึงได้เฉพาะผู้ที่ล็อกอินเท่านั้น
// ถ้าไม่พบ token จะ redirect ไปหน้า /auth/signin โดยแนบ callbackUrl ไว้กลับมาหน้าเดิม
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  // รายการ path ที่ต้องล็อกอินก่อน
  const protectedMatchers = [
    /^\/create-recipe(\/.*)?$/,
    /^\/edit-recipe(\/.*)?$/,
    /^\/my-recipe$/,
    /^\/my-profile$/,
    /^\/my-favorite$/,
  ]

  const path = req.nextUrl.pathname
  if (protectedMatchers.some((re) => re.test(path))) {
    const token = await getToken({ req })
    if (!token) {
      const url = new URL('/auth/signin', req.url)
      // จำตำแหน่งหน้าปัจจุบันไว้เพื่อกลับมาหลังจาก Sign-in
      url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// ให้ middleware ทำงานเฉพาะ path เหล่านี้ (ช่วยลดโอเวอร์เฮด)
export const config = {
  matcher: [
    '/create-recipe/:path*',
    '/edit-recipe/:path*',
    '/my-recipe',
    '/my-profile',
    '/my-favorite',
  ],
}