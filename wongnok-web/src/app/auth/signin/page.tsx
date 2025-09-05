'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignIn() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        // หากมี session แล้ว redirect กลับไปหน้าเดิม
        router.push('/my-recipe')
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = () => {
    signIn('keycloak', { 
      callbackUrl: '/my-recipe',
      redirect: true 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            กรุณาเข้าสู่ระบบเพื่อใช้งาน
          </p>
        </div>
        <div>
          <button
            onClick={handleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Keycloak
          </button>
        </div>
      </div>
    </div>
  )
}
