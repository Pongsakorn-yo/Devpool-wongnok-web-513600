// Popup แจ้งสิทธิ์การให้คะแนน
// ใช้เมื่อ: ผู้ใช้ให้คะแนนแล้ว, เป็นเจ้าของสูตร, หรือยังไม่ล็อกอิน
import Image from 'next/image'
import { Button } from './ui/button'
import React, { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'

type propsRecieve = {
  userID?:string
  rating: number
  // ค่าเฉลี่ยคะแนนของสูตรนี้ (0-5)
  averageRating?: number
  closePopup: (value: boolean) => void
}

const PopupPermitRating = ({ userID, rating, averageRating, closePopup }: propsRecieve) => {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // ปิด popup พร้อม delay เพื่อให้ transition เล่นครบ
  const handleClose = () => {
    setExiting(true)
    setTimeout(() => closePopup(false), 400)
  }
  
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center mx-30'>
      <div className='absolute inset-0 bg-Grayscale-50 opacity-75 pointer-events-none'></div>
      <div
        className={`w-[495px] h-[215px] relative border bg-white z-10 py-6 rounded-xl transition-all duration-500 ease-out transform ${
          showModal && !exiting
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-8'
        }`}
      >
        <div
          className='w-6 h-6 cursor-pointer absolute top-4 right-4'
          onClick={handleClose}
        >
          <Image
            src='/icons/exit.svg'
            alt='exit popup'
            width={14}
            height={14}
          />
        </div>
        <div className='flex flex-col jusitfy-center items-center mx-6'>
          <div className='text-2xl my-4'>ให้คะแนนสูตรอาหารนี้</div>
          <div className='flex flex-col justify-center items-center '>
            {/* กรณีต่าง ๆ ของสิทธิ์การให้คะแนน */}
            {session?.userId && session?.accessToken && rating != 0 && userID != session?.userId && (
              <div className='flex gap-1'>
                คุณให้คะแนนสูตรนี้เเล้ว : {rating}
              </div>
            )}
            {userID == session?.userId && (
              <div className='flex gap-1'>
                คุณไม่สามารถให้คะแนนสูตรตัวเองได้
              </div>
            )}
            {!session?.userId && !session?.accessToken && rating == 0 && (
              <div className='flex gap-1'>โปรดลงทะเบียนเพื่อให้คะเเนน</div>
            )}
            <Button
              className='mx-2 my-3 w-[152px] h-[40px] bg-secondary-500 text-white text-base cursor-pointer'
              variant='outline'
              onClick={() => {
                // เงื่อนไข: (ล็อกอินแล้วและเคยให้คะแนน) หรือ เป็นเจ้าของสูตร -> ปิดอย่างเดียว
                const alreadyRated = !!session?.userId && !!session?.accessToken && rating != 0
                const isOwner = userID == session?.userId
                if (alreadyRated || isOwner) {
                  closePopup(false)
                } else {
                  closePopup(false)
                  signIn('keycloak')
                }
              }}
            >
              ปิด
            </Button>
          </div>
        </div>
        {/* คะแนนเฉลี่ยจากผู้ใช้ทั้งหมด มุมขวาล่างของ popup */}
        <div className='absolute bottom-3 right-4'>
          {typeof averageRating === 'number' && averageRating > 0 ? (
            <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 shadow'>
              ★ {Math.min(averageRating, 5).toFixed(1)}
            </span>
          ) : (
            <span className='text-xs text-gray-400'>ยังไม่มีคะแนนเฉลี่ย</span>
          )}
        </div>
      </div>
    </div>
  )
}
export default PopupPermitRating
