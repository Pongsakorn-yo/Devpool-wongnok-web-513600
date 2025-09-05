import { Card, CardContent, CardFooter } from './ui/card'
import { Skeleton } from './ui/skeleton'

const SkeletonCardLoading = () => {
  return (
    <Card className='w-[276px] h-[390px]'>
      <div>
        <div className='h-[158px] relative rounded-t-lg pb-4'>
          <Skeleton className='w-[276px] h-[158px]' />
        </div>
        <div>
          <CardContent>
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='text-secondary line-clamp-3 h-4 w-full' />
          </CardContent>
        </div>
      </div>

      <div>
        <CardFooter>
          <div className='flex w-full item-center'>
            <div className='flex p-1 grow'>
              <Skeleton className='h-4 w-1/4' />
            </div>
            <div className='flex p-1 grow'>
              <Skeleton className='h-4 w-1/4' />
            </div>
          </div>
          <div>
            <Skeleton className='h-12 w-12 rounded-full' />
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}

export default SkeletonCardLoading