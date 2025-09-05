'use client'

import CardRecipe from '@/components/CardRecipe'
import SkeletonCardLoading from '@/components/SkeletonCardLoading'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { fetchRecipes, Recipe } from '@/services/recipe.service'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

type User = {
  id: string
  firstName: string
  lastName: string
  imageUrl: string
  nickName: string
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
  favorite:{
    foodRecipeID : number
    id : number  
    UserID :string
  }  
  rating:{
    foodRecipeID : number
    score:number
    id : number  
    UserID :string
  }  
  user: User
  averageRating?: number
}

export default function Home() {
  const [recipesData, setRecipesData] = useState<{
    results: Recipe[]
    total: number
  }>({
    results: [],
    total: 0,
  })
  const {
    mutateAsync: getRecipe,
    isPending: isRecipeLoading,
    isError: isRecipeError,
  } = useMutation({
    mutationFn: fetchRecipes,
    onError: () => {
  console.error('home: fetch recipes failed')
    },
    onSuccess: (data) => {      
       if (
        Number(searchParams.get('page')) >
        Math.ceil(data.total / Number(searchParams.get('limit')))
      ) {
        params.set('search', searchParams.get('search') ?? '')
        params.set('page', '1')
        router.replace(`${pathname}?${params.toString()}`)
        setCurrentPage(1)
        
      }
      setRecipesData(data)
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

  useEffect(() => {
    params.set('page', String(currentPage))
    router.replace(`${pathname}?${params.toString()}`)
    getRecipe({
      page: Number(currentPage),
      limit: limitDataPerPage,
      search: searchInput,
    })
  }, [currentPage])

  // Keep favorite icons in sync when changed from other pages
  useEffect(() => {
    const handler = () => {
      getRecipe({
        page: Number(currentPage),
        limit: limitDataPerPage,
        search: searchInput,
      })
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('favorite:changed', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('favorite:changed', handler as EventListener)
      }
    }
  }, [currentPage, searchInput])

  const handleSearch = useDebouncedCallback((data: string) => {
    params.set('page', '1')
    if (searchInput === '') {
      params.delete('search')
    } else {
      params.set('search', searchInput)
    }
    router.replace(`${pathname}?${params.toString()}`)
    getRecipe({
      page: Number(currentPage),
      limit: limitDataPerPage,
      search: data,
    })
  }, 1000)

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
                  const v = (e as any).target?.value ?? ''
                  setSearchInput(v)
                  handleSearch(v)
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchInput(e.target.value)
              handleSearch(e.target.value)
            }}
          />
        </div>
      </div>
      <h1 className='pt-6 pb-8 text-4xl font-bold'>สูตรอาหารทั้งหมด</h1>
      {isRecipeLoading ? (
        <div>
          <div className='flex flex-wrap gap-8 '>
            {[1, 2, 3, 4].map((i) => {
              return <SkeletonCardLoading key={i} />
            })}
          </div>
        </div>
      ) : (
        <div className='flex flex-wrap gap-8 '>
          {recipesData &&
            recipesData.results &&
            recipesData.results.length > 0 &&
            recipesData.results.map((recipe) => {
              return (
                <Link key={recipe.id} href={`recipe-details/${recipe.id}`}>
                  <CardRecipe key={recipe?.id} {...recipe} />
                </Link>
              )
            })}
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
