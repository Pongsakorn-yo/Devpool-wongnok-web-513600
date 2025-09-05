import { CardRecipeProps } from '@/app/page'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent, CardFooter } from './ui/card'
import Image from 'next/image'


const CardRecipe = ({
  name,
  imageUrl,
  description,
  difficulty,
  cookingDuration,
  user,
  favorite,
  averageRating,
}: CardRecipeProps) => (  
  <Card className='w-[276px] h-[390px]'>
    <div>
      <div className='h-[158px] relative rounded-t-lg pb-4'>
        <Image
          src={imageUrl}
          alt={`${name} image`}
          fill
          className='object-cover'
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 276px'
        />
      </div>
      <div>
        <CardContent>
          <div className='flex justify-between'>
            <h1 className='font-bold'>{name}</h1>
            {Number(favorite?.id) == 0 && (
              <Image
                src='icons/notfav.svg'
                width={20}
                height={20}
                alt='not fav'
              />
            )}
            {favorite.id != 0 && (
              <Image src='icons/fav.svg' width={20} height={20} alt='not fav' />
            )}
          </div>
          <p className='text-secondary line-clamp-3'>{description}</p>
        </CardContent>
      </div>
    </div>

    <div>
      <CardFooter>
        <div className='flex w-full item-center'>
          <div className='flex p-1 grow'>
            <Image
              src='/icons/level.svg'
              alt='av timer'
              width={14}
              height={14}
            />
            <p>{difficulty.name}</p>
          </div>
          <div className='flex p-1 grow'>
            <Image
              src='/icons/av_timer.svg'
              alt='level'
              width={14}
              height={14}
            />
            <p>{cookingDuration.name}</p>
          </div>
        </div>
        <div className='w-full relative'>
          <div className='flex justify-start items-center'>
            <Avatar>
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback>{user.nickName}</AvatarFallback>
            </Avatar>
            <div className='mx-2'>{user.nickName}</div>
          </div>
          {/* มุมขวาล่างของการ์ด แสดงคะแนนเฉลี่ยรวม (ถ้ามี) */}
          {typeof averageRating === 'number' && (
            <div className='absolute bottom-1 right-1 text-xs text-gray-600'>
              {averageRating.toFixed(1)}
            </div>
          )}
        </div>
      </CardFooter>
    </div>
  </Card>
)

export default CardRecipe
