'use client'
import CardRecipe from '@/components/CardRecipe'
import { Button } from '@/components/ui/button'
import { fetchRecipesByUser } from '@/services/recipe.service'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

const MyRecipe = () => {
  const { status } = useSession()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['recipesByUser'],
    queryFn: () => fetchRecipesByUser(),
    enabled: status === 'authenticated',
  })

  if (status === 'loading') {
    return (
      <div className='flex flex-col py-8'>
        <h1 className='font-bold text-4xl'>สูตรอาหารของฉัน</h1>
        <div className='my-4'>Loading.....</div>
      </div>
    )
  }

  if (isLoading || isFetching || !data)
    return (
      <div>
        <div className='flex flex-col py-8'>
          <h1 className='font-bold text-4xl'>สูตรอาหารของฉัน</h1>
          <div className='my-4'>Loading.....</div>
        </div>
      </div>
    )

  return (
    <div>
      <div className='flex justify-between items-center py-8'>
        <h1 className='font-bold text-4xl'>สูตรอาหารของฉัน</h1>
        {data && data.length > 0 && (
          <Link href={'/create-recipe'}>
            <Button className='bg-primary-500 cursor-pointer'>+ สร้างสูตรอาหาร</Button>
          </Link>
        )}
      </div>
      {data && data.length > 0 ? (
        <div className='flex flex-wrap gap-8'>
          {data.map((recipe: any) => {
            return (
              <Link key={recipe.id} href={`recipe-details/${recipe.id}`}>
                <CardRecipe key={recipe.id} {...recipe} />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className='flex-1 flex flex-col justify-center items-center '>
          <Image
            src='/Food_butcher.png'
            alt='food butcher2'
            width={290}
            height={282}
          />
          <div className='text-lg my-6'>ยังไม่มีสูตรอาหารของตัวเอง</div>
          <Link href={'/create-recipe'}>
            <Button className='bg-primary-500 cursor-pointer'>+ สร้างสูตรอาหาร</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyRecipe
