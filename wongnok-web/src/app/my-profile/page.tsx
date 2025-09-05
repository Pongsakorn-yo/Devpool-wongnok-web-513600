'use client'
// หน้าโปรไฟล์: แสดง/แก้ไขข้อมูลผู้ใช้
// - Avatar: รับเป็น URL พร้อม fallback หากโหลดรูปไม่สำเร็จ
// - Name: อ่านจากข้อมูลจริง (read-only)
// - Nickname: ให้ผู้ใช้แก้ไขและบันทึกผ่าน API

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import type React from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UpdateUser, getUser } from '@/services/recipe.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function MyProfile() {
  const { status } = useSession()
  const [nickName, setNickName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
  // บังคับให้ล็อกอินก่อนใช้งานหน้าโปรไฟล์
  if (status === 'unauthenticated') signIn()
  }, [status])

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getUser()
        setNickName(me.nickName || '')
        setImageUrl(me.imageUrl || '')
        setName(`${me.firstName ?? ''} ${me.lastName ?? ''}`.trim())
      } catch {}
    }
    load()
  }, [])

  // ตรวจสอบว่าเป็น URL รูปภาพที่ถูกต้องหรือไม่
  const isValidUrl = (url: string) => {
    if (!url) return true // allow blank (use default icon)
    try {
      const u = new URL(url)
      return u.protocol === 'https:' || u.protocol === 'http:'
    } catch {
      return false
    }
  }

  // บันทึกข้อมูล Nickname/Avatar URL ไปยังเซิร์ฟเวอร์
  const onSave = async () => {
    setSaved(null)
    setErrorMsg(null)
    if (!nickName.trim()) {
      setErrorMsg('กรุณากรอก Nickname')
      return
    }
    if (!isValidUrl(imageUrl)) {
      setErrorMsg('ลิงก์รูปภาพไม่ถูกต้อง โปรดใส่ URL ที่ขึ้นต้นด้วย http(s)://')
      return
    }
    try {
      setSaving(true)
      await UpdateUser({ nickName: nickName.trim(), imageUrl: imageUrl.trim() })
      setSaved('บันทึกข้อมูลเรียบร้อย')
    } catch (e) {
      setErrorMsg('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  // ปุ่ม Save จะกดได้เมื่อกรอกถูกต้องและไม่อยู่ระหว่างบันทึก
  const disabled = saving || !nickName.trim() || !isValidUrl(imageUrl)

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="flex items-center gap-4">
        <Image
          src={imageUrl || '/icons/person.svg'}
          alt="avatar"
          width={64}
          height={64}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            // กรณีโหลดรูปจาก URL ไม่ได้ ให้ fallback เป็นไอคอนเริ่มต้น
            const target = e.target as HTMLImageElement
            if (target && target.src !== location.origin + '/icons/person.svg') {
              target.src = '/icons/person.svg'
            }
          }}
        />
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div>{name || '-'}</div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Avatar URL</label>
        <Input value={imageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Nickname</label>
        <Input value={nickName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickName(e.target.value)} placeholder="Your nickname" />
      </div>
      {errorMsg && (
        <Alert variant="destructive"><AlertDescription>{errorMsg}</AlertDescription></Alert>
      )}
      {saved && (
        <Alert variant="default"><AlertDescription>{saved}</AlertDescription></Alert>
      )}
      <Button onClick={onSave} disabled={disabled}>{saving ? 'Saving...' : 'Save'}</Button>
    </div>
  )
}
 
