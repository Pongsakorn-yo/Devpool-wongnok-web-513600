'use client'
// หน้า "สูตรอาหารสุดโปรด" (Favorite Recipe)
// - ต้องล็อกอินก่อน (อ่านสถานะจาก useSession)
// - ดึงรายการโปรดแบบแบ่งหน้า + ค้นหา
// - ลบออกจากรายการโปรดแบบ optimistic (ลบจาก UI ก่อน แล้วค่อย sync)
// - มี pagination และ debounce ค้นหาเพื่อลดจำนวนเรียก API
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Recipe } from '@/services/recipe.service'
import CardRecipe from '@/components/CardRecipe'
import { Button } from '@/components/ui/button'
import { DeleteFavorite, getFavorite } from '@/services/recipe.service'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'
import SkeletonCardLoading from '@/components/SkeletonCardLoading'

type User = {
  id: string
  firstName: string
  lastName: string
}

export type CardRecipeProps = {
  id: string
  name: string
  imageUrl: string
  description: string
  cookingDuration: {
    id: number
    name: string
  }
  difficulty: {
    id: number
    name: string
  }
  user: User
}

const Myfavorite = () => {
  // ตรวจสอบสถานะผู้ใช้ (ใช้กำหนดว่าจะยิง API ได้เมื่อ authenticated เท่านั้น)
  const { status } = useSession()

  const [recipesData, setRecipesData] = useState<{
    results: Recipe[]
    total: number
  }>({
    results: [],
    total: 0,
  })
  // โหลดรายการโปรดด้วย react-query (ใช้แบบ mutate เพื่อส่งพารามิเตอร์)
  const {
    mutateAsync: getRecipe,
    isPending: isRecipeLoading,
    isError: isRecipeError,
  } = useMutation({
    mutationFn: getFavorite,
    onError: () => {
  console.error('favorites: fetch failed')
    },
    onSuccess: (data: { results?: Recipe[]; total?: number }) => {
      // ปรับเลขหน้าปัจจุบันหากเลยหน้าสุดท้าย (เช่น ค้นหาแล้วผลน้อยลง)
      const total = Number(data?.total ?? 0)
      if (
        Number(searchParams.get('page')) >
        Math.ceil(total / Number(searchParams.get('limit')))
      ) {
        params.set('search', searchParams.get('search') ?? '')
        params.set('page', '1')
        router.replace(`${pathname}?${params.toString()}`)
        setCurrentPage(1)
      }
      setRecipesData({ results: data?.results ?? [], total })
    },
  })
  const limitDataPerPage = 5
  const pathname = usePathname()

  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  params.set('limit', String(limitDataPerPage))

  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get('page') ?? 1)
  )
  const [searchInput, setSearchInput] = useState<string>(
    searchParams.get('search') ?? ''
  )
  //
  
  // ลบออกจากรายการโปรด: อัปเดตแบบ optimistic และจัดการกรณีหน้าโล่งแล้วถอยกลับหน้าก่อน
  const { mutateAsync: removeFavorite, isPending: isRemoving } = useMutation({
    mutationFn: (foodRecipeID: number) => DeleteFavorite(foodRecipeID),
    onSuccess: (_res: any, foodRecipeID: number) => {
      // ตรวจว่าก่อนลบ นี่คือชิ้นสุดท้ายของหน้านี้หรือไม่
      const wasLastOnPage = recipesData.results.length === 1 && currentPage > 1

      // ลบจาก UI ไปก่อน (optimistic update)
      setRecipesData((prev: { results: Recipe[]; total: number }) => {
        const newResults = prev.results.filter((r: Recipe) => Number(r.id) !== Number(foodRecipeID))
        const newTotal = Math.max(0, (prev.total || 0) - 1)
        return { results: newResults, total: newTotal }
      })

      // แจ้งหน้าอื่น ๆ (เช่น หน้า Home) ให้รีเฟรชสถานะ favorite ของการ์ด
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favorite:changed', { detail: { id: foodRecipeID, action: 'deleted' } }))
      }

      // ถ้าหน้าปัจจุบันไม่มีรายการเหลือและไม่ใช่หน้าแรก ให้ถอยกลับไปหน้าก่อน
      if (wasLastOnPage) {
        const newPage = currentPage - 1
        params.set('page', String(newPage))
        router.replace(`${pathname}?${params.toString()}`)
        setCurrentPage(newPage)
        return
      }

      // กรณีทั่วไป: ยิงโหลดหน้าเดิมเพื่อ sync กับเซิร์ฟเวอร์
      if (status === 'authenticated') {
        getRecipe({
          page: Number(currentPage),
          limit: limitDataPerPage,
          search: searchInput,
        })
      }
    },
  })
  // โหลดข้อมูลทุกครั้งที่เปลี่ยนหน้า หรือเมื่อเข้ามาแล้ว authenticated
  useEffect(() => {
    if (status !== 'authenticated') return
    params.set('page', String(currentPage))
    router.replace(`${pathname}?${params.toString()}`)
    getRecipe({
      page: Number(currentPage),
      limit: limitDataPerPage,
      search: searchInput,
    })
  }, [currentPage, status])

  // ค้นหาแบบ debounce 1 วินาที เพื่อลดการเรียก API ถี่เกินไป
  const handleSearch = useDebouncedCallback((data: string) => {
    params.set('page', '1')
    if (searchInput === '') {
      params.delete('search')
    } else {
      params.set('search', searchInput)
    }
    router.replace(`${pathname}?${params.toString()}`)
    if (status === 'authenticated') {
      getRecipe({
        page: Number(currentPage),
        limit: limitDataPerPage,
        search: data,
      })
    }
  }, 1000)

  // สถานะ Error (ดึงรายการโปรดไม่สำเร็จ)
  if (isRecipeError)
    return (
      <>
        <div>
          <div className='w-full flex justify-center items-center my-8'>
            <div className='flex w-[584px] h-[40px] relative'>
              <div className='absolute mx-4 h-full flex justify-center items-center'>
                <Image
                  color='#E030F6'
                  src='/icons/search.svg'
                  alt='icon search'
                  width={18}
                  height={18}
                />
              </div>

              <Input
                className='rounded-3xl text-center'
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  handleSearch(e.target.value)
                }}
              />
            </div>
          </div>

          <h1 className='pt-6 pb-8 text-4xl font-bold '>สูตรอาหารทั้งหมด</h1>
          <div className='py-2 px-3 bg-pinklittle rounded-lg flex items-center'>
            <div className='mx-2'>
              <Image
                src='/icons/errorclound.svg'
                alt='error search'
                width={18}
                height={18}
              />
            </div>

            <div>
              ไม่สามารถดึงข้อมูลสูตรอาหารได้ กรุณา “รีเฟรช”
              หน้าจอเพื่อลองใหม่อีกครั้ง
            </div>
          </div>
        </div>
      </>
    )
  // สถานะ Loading (กำลังดึงข้อมูลรายการโปรด)
  if (isRecipeLoading )
    return (
      <div>
        <div className='w-full flex justify-center items-center my-8'>
          <div className='flex w-[584px] h-[40px] relative'>
            <div className='absolute mx-4 h-full flex justify-center items-center'>
              <Image
                color='#E030F6'
                src='/icons/search.svg'
                alt='icon search'
                width={18}
                height={18}
              />
            </div>

            <Input
              className='rounded-3xl text-center'
              value={searchInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchInput(e.target.value)
                handleSearch(e.target.value)
              }}
            />
          </div>
        </div>
        <div className='flex justify-between items-center py-8 '>
          <h1 className='font-bold text-4xl'>สูตรอาหารสุดโปรด</h1>
        </div>

        <div>
          <div className='flex flex-wrap gap-8 '>
            {[1, 2, 3, 4].map((i) => {
              return <SkeletonCardLoading key={i} />
            })}
          </div>
        </div>
      </div>
    )

  return (
    <div>
      <div className='w-full flex justify-center items-center my-8'>
        <div className='flex w-[584px] h-[40px] relative'>
          <div className='absolute mx-4 h-full flex justify-center items-center'>
            <Image
              color='#E030F6'
              src='/icons/search.svg'
              alt='icon search'
              width={18}
              height={18}
            />
          </div>
          <Input
            className='rounded-3xl text-center'
            value={searchInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchInput(e.target.value)
              handleSearch(e.target.value)
            }}
          />
        </div>
      </div>
      <div className='flex justify-between items-center py-8 '>
        <h1 className='font-bold text-4xl'>สูตรอาหารสุดโปรด</h1>
      </div>
      {!isRecipeLoading && !isRecipeError && recipesData.results.length > 0 ? (
        <div className='flex flex-wrap gap-8'>
          {recipesData.results.map((recipe) => {
            return (
              <div key={recipe.id} className='flex flex-col items-start gap-2'>
                <Link href={`recipe-details/${recipe.id}`}>
                  <CardRecipe {...recipe} />
                </Link>
                <Button
                  variant='outline'
                  className='cursor-pointer'
                  disabled={isRemoving}
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    await removeFavorite(Number(recipe.id))
                  }}
                >
                  ลบออกจากรายการโปรด
                </Button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className='flex flex-col'>
          <div className='flex-1 flex justify-center items-center'>
            <div className='flex-1 flex flex-col justify-center items-center '>
              <Image
                src='/Food_butcher.png'
                alt='food butcher'
                width={290}
                height={282}
              />
              <div className='text-lg my-6'>ยังไม่มีรายการสูตรอาหารสุดโปรด</div>
              <Link href={'/'}>
                <Button className='bg-primary-500 cursor-pointer'>
                  กลับหน้าสูตรอาหาร
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className='cursor-pointer'
              onClick={() => {
                setCurrentPage((prev) => {
                  return prev <= 1 ? prev : prev - 1
                })
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>{currentPage}</PaginationLink>
          </PaginationItem>
          {/* <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem> */}
          <PaginationItem>
            <PaginationNext className='cursor-pointer'
              onClick={() => {
                setCurrentPage((prev) => {
                  return prev >= Math.ceil(recipesData.total / limitDataPerPage)
                    ? prev
                    : prev + 1
                })
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default Myfavorite
