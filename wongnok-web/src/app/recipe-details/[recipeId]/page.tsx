'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import Star from '@/components/Rating'
import DeleteRecipe from '@/components/DeleteRecipe'
import { CreateFavorite, DeleteFavorite, fetchRecipeDetails } from '@/services/recipe.service'
import { useMutation, useQuery } from '@tanstack/react-query'
import PopupRating from '@/components/Popuprating'
import PopupPermitRating from '@/components/PopupPermitRating'
import { useRouter } from 'next/navigation'


type RecipeDetailsIdProps = {
  params: Promise<{ recipeId: string }>
}

export default function RecipeDetailsId({ params }: RecipeDetailsIdProps) {
  const [closePopup, setClosePopup] = useState<boolean>(false)
  const [PermitRating, SetPermitRating] = useState<boolean>(false)
  const [closePopupRating, setClosePopupRating] = useState<boolean>(false)
  const { recipeId } = React.use(params)
  const { data: session, status } = useSession()

  const router = useRouter()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipeDetail', recipeId],
    queryFn: () => fetchRecipeDetails(Number(recipeId)),
  })

  const { mutateAsync: AddFavorite } = useMutation({
    mutationFn: (foodRecipeID: number) => CreateFavorite(foodRecipeID),
    onError: () => {
  console.error('recipe-details: add favorite failed')
    },
    onSuccess: () => {
      router.replace('/')
    },
  })
  
  const { mutateAsync: RemoveFavorite } = useMutation({
    mutationFn: (foodRecipeID: number) => DeleteFavorite(foodRecipeID),
    onError: () => {
  console.error('recipe-details: remove favorite failed')
    },
    onSuccess: () => {
      router.replace('/')
    },
  })
  if (isLoading || status === 'loading') return <div>Loading...</div>

  if (isError) return <div>Error</div>

  //

  // กำหนดจำนวนดาวสูงสุด และอ่านค่าคะแนนเฉลี่ยจาก API (อ่านอย่างเดียว)
  const maxStars = 5
  const rawAvgRating = data?.data?.averageRating ?? 0
  const avgRating = Math.min(rawAvgRating, maxStars)

  return (
    <div className='flex flex-col gap-y-5'>
      {closePopup && (
        <DeleteRecipe recipeId={Number(recipeId)} closePopup={setClosePopup} />
      )}
      {closePopupRating && (
        <PopupRating
          recipeId={Number(recipeId)}
          averageRating={Number(data?.data?.averageRating ?? 0)}
          closePopup={setClosePopupRating}
        />
      )}
      {PermitRating && (
        <PopupPermitRating
          rating={Number(data?.data.rating.score)}
          userID={data?.data.user.id}
          averageRating={Number(data?.data?.averageRating ?? 0)}
          closePopup={SetPermitRating}
        />
      )}

      <div className='flex flex-col gap-y-5'>
        {session?.userId &&
          data?.data?.user?.id &&
          data?.data?.user?.id === session.userId && (
            <div className='flex justify-between items-center'>
              <div>
                <h1 className='font-bold text-4xl'>{data?.data.name}</h1>
              </div>

              <div className='flex justify-center '>
        <Link href={`/edit-recipe/${recipeId}`}>
                  <Button
                    className='text-primary-500 mx-2 cursor-pointer bg-white'
                    variant='secondary'
                  >
          <img src='/icons/Edit.svg' width={12} height={12} alt='edit logo' />
                    แก้ไขสูตรอาหาร
                  </Button>
                </Link>

                <Button
                  className='bg-Accent-Error-500 mx-2 cursor-pointer text-white'
                  variant='secondary'
                  onClick={() => setClosePopup(true)}
                >
                  <img src='/icons/trash.svg' width={12} height={12} alt='delete logo' />
                  <div className='ms-2'>ลบสูตรอาหาร</div>
                </Button>
              </div>
            </div>
          )}
        <div>
          <p>{data?.data.description}</p>
          <p className='text-secondary text-xs'>{data?.data.updatedAt}</p>
        </div>
        <div className='flex items-center'>
          <Avatar>
            <AvatarImage src={data?.data.user.imageUrl} />
            <AvatarFallback>Oatter</AvatarFallback>
          </Avatar>
          <div className='mx-3'>
            {data?.data.user.nickName}
            
            {session?.userId && data?.data.favorite.id == 0 &&<Button
              className='text-primary-500 mx-2 cursor-pointer bg-white border'
              variant='secondary' onClick={()=>AddFavorite(Number(data?.data.id))}
            >
              <img src='/icons/fav.svg' width={12} height={12} alt='fav logo' />
              เพิ่มรายการโปรด
            </Button>}
            {session?.userId && data?.data.favorite.id != 0 &&<Button
              className='text-primary-500 mx-2 cursor-pointer bg-white border'
              variant='secondary' onClick={()=>RemoveFavorite(Number(data?.data.id))}
            >
              <img src='/icons/notfav.svg' width={12} height={12} alt='unfav logo' />
              ลบออกจากรายการโปรด
            </Button>}
          </div>
        </div>
      </div>
      <div className='flex gap-x-8 '>
        <div className='flex flex-col gap-6'>
          <div className='relative w-[584px] h-[334px]'>
            <Image
              src={data?.data.imageUrl || '/beef_wellington.png'}
              alt='beef wellington'
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 584px'
            />
          </div>
          <div className='rounded-sm px-2 bg-secondary-100 text-secondary-900 flex'>
            <img src='/icons/av_timer.svg' alt='level' width={18} height={18} />
            <p className='mx-3'>{data?.data.cookingDuration.name} นาที</p>
          </div>
        </div>
        <div>
          <h1 className='text-3xl font-bold'>วัตถุดิบ</h1>
          <p>
            {(data?.data.ingredient || '').split(',').map((item, idx) => (
              <li key={idx}>{item.trim()}</li>
            ))}
          </p>
        </div>
      </div>
      <div className='flex flex-col mt-2 mb-3'>
        <h1 className='text-3xl font-bold'>วิธีการทำ</h1>
        <p>
          {(data?.data.instruction || '').split(',').map((item, idx) => (
            <li className='my-1' key={idx}>
              {item.trim()}
            </li>
          ))}
        </p>
        <div className='mt-12 flex'>
          <div>
            {/* ส่วนแสดงคะแนนเฉลี่ยรวมของสูตรอาหารนี้ */}
            <div className='text-lg font-bold'>คะแนนสูตรอาหารนี้</div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center'>
                {Array.from({ length: maxStars }, (_, i) => {
                  let fillPercent = 0
                  if (i < Math.floor(avgRating)) {
                    fillPercent = 100
                  } else if (i === Math.floor(avgRating)) {
                    fillPercent = Math.floor((avgRating % 1) * 100)
                  }
                  return <Star key={i} fillPercent={fillPercent} />
                })}
              </div>
              <div className='text-base text-secondary-700'>
                <div>
                  (
                  {rawAvgRating
                    ? Math.min(rawAvgRating, maxStars).toFixed(1)
                    : 'ยังไม่มีคะแนน'}
                  )
                </div>
              </div>
            </div>
          </div>

          <div
            className='flex jusfify-center items-center mx-8'
            onClick={() => {
              // เงื่อนไขเปิด popup ให้คะแนน:
              // - ผู้ใช้ต้องล็อกอิน
              // - ยังไม่เคยให้คะแนนสูตรนี้
              // - และไม่ใช่เจ้าของสูตร
              if (
                data?.data?.rating?.score == 0 &&
                session?.userId &&
                session?.accessToken &&
                data?.data?.user.id != session?.userId
              ) {
                setClosePopupRating(true)
              } else {
                SetPermitRating(true)
              }
            }}
          >
            {/* ปุ่มเปิด popup ให้คะแนน (กรณีผู้ใช้มีสิทธิ์) */}
            <Button variant='outline' className='text-2xl p-2 cursor-pointer'>
              <img src='/icons/ratingforgive.svg' alt='ratingforgive logo' width={24} height={24} />
              ให้คะแนน
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
