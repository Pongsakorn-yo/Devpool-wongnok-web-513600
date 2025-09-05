'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignedOut() {
  const router = useRouter()
  useEffect(() => {
    // Ensure NextAuth session is cleared on return from Keycloak
    signOut({ redirect: false })
      .catch(() => {})
      .finally(() => {
        // Navigate back to home shortly after
        setTimeout(() => router.replace('/'), 600)
      })
  }, [router])
  return (
    <div className='flex items-center justify-center py-16'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold mb-2'>กำลังออกจากระบบ…</h1>
        <p className='text-gray-500'>โปรดรอสักครู่ แล้วกลับไปหน้าแรก</p>
      </div>
    </div>
  )
}
