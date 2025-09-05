// Popup สำหรับให้คะแนนสูตรอาหาร
// - ผู้ใช้คลิกดาว 1–5 แล้วกดยืนยันเพื่อส่งคะแนน
// - มุมขวาล่างจะแสดง "คะแนนเฉลี่ยรวม" ของสูตรนี้ (อ่านอย่างเดียว)
import Image from 'next/image'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { createRating } from '@/services/recipe.service'
import Star from '@/components/Rating'
import React, { useEffect, useState } from 'react'

type propsRecieve = {
  recipeId: number
  // ค่าเฉลี่ยคะแนนจากผู้ใช้งานคนอื่น ๆ ของสูตรนี้ (0-5)
  averageRating?: number
  closePopup: (value: boolean) => void
}

const PopupRating = ({ recipeId, averageRating, closePopup }: propsRecieve) => {
  // คะแนนที่ผู้ใช้เลือก (ยังไม่ส่งจนกดปุ่มยืนยัน)
  const [selected, setSelected] = useState(0)
  // จัดการแอนิเมชันเข้า/ออกของโมดอล
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
  const router = useRouter()
  const { mutateAsync: giveRating } = useMutation({
    mutationFn: createRating,
    onError: () => {
  console.error('rating request failed')
    },
    onSuccess: () => {
      router.replace('/')
    },
  })

  // เรียก API เพื่อบันทึกคะแนนเมื่อกดยืนยัน
  const handlerRating = (rating: number) => {
    giveRating({
      id: 0, // หรือ undefined ถ้า backend ไม่ใช้
      UserID: '', // หรือส่ง user id จริง ถ้ามี
      foodRecipeID: recipeId,
      score: rating,
    })
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
          {/* ส่วนหัว */}
          <div className='text-2xl my-4'>ให้คะแนนสูตรอาหารนี้</div>
          <div className='flex flex-col justify-center items-center '>
            {/* ดาว 5 ดวงให้คลิกเลือก */}
            <div className='flex gap-1'>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  onClick={() => setSelected(i + 1)}
                  className='cursor-pointer'
                >
                  <Star fillPercent={i < selected ? 100 : 0} />
                </span>
              ))}
            </div>
            <Button
              className='mx-2 w-[152px] h-[40px] bg-secondary-500 text-white text-base cursor-pointer'
              variant='outline'
              onClick={() => {
                handlerRating(selected)
              }}
              disabled={selected === 0}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
        {/* แสดงคะแนนเฉลี่ยรวม (อ่านอย่างเดียว) มุมขวาล่างของ popup */}
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
export default PopupRating
