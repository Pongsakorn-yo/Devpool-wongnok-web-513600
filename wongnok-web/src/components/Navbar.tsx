'use client'
// แถบนำทาง (Navbar)
// - แสดงโลโก้ และเมนูผู้ใช้เมื่อเข้าสู่ระบบ
// - เมนูผู้ใช้มี: รายการโปรด, สูตรของฉัน, โปรไฟล์, ออกจากระบบ
// - กด "เข้าสู่ระบบ" จะเรียก next-auth signIn()

import Image from 'next/image'
import type React from 'react'
import { Button } from './ui/button'
import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUser, type User } from '@/services/recipe.service'

const Navbar = () => {
  const { data: session } = useSession()
  const [me, setMe] = useState<User | null>(null)

  const [hidden, sethidden] = useState<boolean>(false)
  useEffect(() => {
    let ignore = false
  const load = async () => {
      try {
        if (!session) return
        const u = await getUser()
        if (!ignore) setMe(u)
      } catch {
        // ignore
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [session])

  const forSetHidden = () => {
    sethidden(!hidden)
  }

  return (
    <div className='flex justify-between' suppressHydrationWarning>
      <Link href={`/`}>
        <Image
          src='/wongnok-with-name-logo.png'
          width={182}
          height={49}
          alt='wongnok-logo'
          className='object-contain'
        />
      </Link>

  {session ? (
        <div
          className='flex flex-col relative cursor-pointer'
          onClick={forSetHidden}
        >
          <div className='flex h-[40px] items-center justify-center'>
            {/* Avatar: ใช้จาก session > โปรไฟล์ผู้ใช้ > ไอคอนเริ่มต้น ตามลำดับ พร้อม fallback เมื่อโหลดล้มเหลว */}
            <div className='w-[28px] h-[28px] rounded-full overflow-hidden mr-2 border border-gray-200 bg-white'>
              <img
                src={(session as any)?.user?.imageUrl || me?.imageUrl || '/icons/person.svg'}
                alt='avatar'
                width={28}
                height={28}
                referrerPolicy='no-referrer'
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const img = e.currentTarget
                  if (img.src !== location.origin + '/icons/person.svg') {
                    img.src = '/icons/person.svg'
                  }
                }}
              />
            </div>
            {/* Nickname: อ่านจาก session ถ้าไม่มีค่อย fallback เป็นข้อมูล user ที่ดึงจาก API */}
            <div className='text-primary-500 max-w-[220px] truncate'>{(session as any)?.user?.nickName || me?.nickName || 'Me'}</div>
            <div className='w-[24px] h-[24px] ms-1 flex justify-center items-center'>
              <span className='relative w-full h-full flex items-center justify-center'>
                <img
                  src='/icons/down.svg'
                  width={11}
                  height={7}
                  alt='down menu logout'
                  className={`absolute transition-all duration-300 ease-in-out ${
                    hidden
                      ? 'opacity-0 translate-y-2'
                      : 'opacity-100 translate-y-0'
                  }`}
                />
                <img
                  src='/icons/up.svg'
                  width={11}
                  height={7}
                  alt='up menu logout'
                  className={`absolute transition-all duration-300 ease-in-out ${
                    hidden
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-2'
                  }`}
                />
              </span>
            </div>
          </div>
          {/* เมนูดรอปดาวน์ของผู้ใช้ */}
          <div
            className={`bg-white w-[195px] h-auto border rounded-lg absolute mt-[64px] transition-all duration-300 ease-in-out
              ${
                hidden
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
          >
            <Link href={`/my-favorite?limit=5&page=1`}>
              <div className='w-[195px] h-[48px] flex items-center hover:bg-pinklittle rounded-lg'>
                <span className='text-end w-full px-4'>รายการโปรด</span>
              </div>
            </Link>
            <Link href={`/my-recipe`}>
              <div className='w-[195px] h-[48px] flex items-center hover:bg-pinklittle rounded-lg'>
                <span className='text-end w-full px-4'>สูตรอาหารของฉัน</span>
              </div>
            </Link>
            <Link href={`/my-profile`}>
              <div className='w-[195px] h-[48px] flex items-center hover:bg-pinklittle rounded-lg'>
                <span className='text-end w-full px-4'>ข้อมูลส่วนตัว</span>
              </div>
            </Link>
      {/* ออกจากระบบ: เรียก endpoint logout ฝั่งเซิร์ฟเวอร์เพื่อเคลียร์ Keycloak และ NextAuth */}
      <div
              className='w-[195px] h-[48px] flex items-center hover:bg-pinklittle rounded-lg '
              onClick={() => {
                // End Keycloak SSO first (with id_token_hint), then clear NextAuth on return page
                window.location.href = '/api/auth/keycloak/logout'
              }}
            >
              <span className='text-end w-full px-4'>ออกจากระบบ</span>
            </div>
          </div>
        </div>
      ) : (
    // ปุ่มเข้าสู่ระบบ
    <Button
          className='text-primary-a cursor-pointer text-primary-500'
          variant='ghost'
          onClick={() => {
      signIn()
          }}
        >
          <Image
            color='#E030F6'
            src='/icons/person.svg'
            alt='icon person'
            width={16}
            height={16}
          />
          เข้าระบบ
        </Button>
      )}
    </div>
  )
}

export default Navbar
