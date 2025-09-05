'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const RecipeDetailsLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  return (
    <div>
      <Button
        variant='outline'
        className='text-primary-500 my-8 border-primary-500 cursor-pointer'
        onClick={() => router.back()}
      >
        กลับ
      </Button>
      {children}
    </div>
  )
}

export default RecipeDetailsLayout
