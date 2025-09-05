import Image from 'next/image'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type propsRecieve = {
  
  closePopup: (value: boolean) => void
  
}

const PopupFailCreateUpdate = ({ closePopup  }: propsRecieve) => {
 
  const [showModal, setShowModal] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setExiting(true)
    closePopup(false)
  }
  const router = useRouter() 

  const handlerError = () => {
    router.refresh()
    closePopup(false)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center mx-30'>
      <div className='absolute inset-0 bg-Grayscale-50 opacity-75 pointer-events-none'></div>
      <div
        className={`w-[495px]  relative border bg-white z-10 py-6 rounded-xl transition-all duration-500 ease-out transform ${
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
          <Image
            src='/icons/errorclound.svg'
            alt='error popup'
            width={58}
            height={42}
          />
          <div className='text-2xl my-4'>เกิดข้อผิดพลาด</div>
          <div className='text-sm my-1 text-secondary'>ไม่สามารถทำการบันทึกข้อมูล</div>
          <div className='text-sm my-1 text-secondary'>กรุณาลองใหม่อีกครั้ง</div>
          <div className='flex flex-col justify-center items-center '>
            <Button
              className='mx-2 my-3 w-[152px] h-[40px] bg-secondary-500 text-white text-base cursor-pointer'
              variant='outline'
              onClick={() => {
                handlerError()
              }}              
            >
              ตกลง
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default PopupFailCreateUpdate
