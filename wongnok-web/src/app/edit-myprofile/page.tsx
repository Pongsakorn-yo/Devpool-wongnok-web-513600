'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getUser, UpdateUser, User } from '@/services/recipe.service'
import { UserForm } from '../create-recipe/page'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const EditMyProfile = () => {
  const router = useRouter()
  const { data, isLoading, isError } = useQuery<User>({
    queryKey: ['recipeDetail'],
    queryFn: () => getUser(),
  })
  const form = useForm<UserForm>({
    defaultValues: {
      nickName: '',
      imageUrl: '',
    },
  })

  const { mutateAsync: UpdateProfile } = useMutation({
    mutationFn: UpdateUser,
    onError: () => {
  console.error('edit-profile: update failed')
    },
    onSuccess: () => {
      router.replace('/')
    },
  })
  useEffect(() => {
    if (data) {
      form.reset({
        nickName: data.nickName ?? '',
        imageUrl: data.imageUrl ?? '',
      })
    }
  }, [data, form])
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>

  const onSubmit: SubmitHandler<UserForm> = (data) => {
UpdateProfile(data)
  }
  return (
    <div className=' flex flex-col'>
      <div className='flex justify-between items-center py-8'>
        <h1 className='font-bold text-4xl'>แก้ไขโปรไฟล์ของฉัน</h1>
      </div>
      <div className='flex-1 flex justify-center my-10'>
        <div className='flex flex-col justify-center items-center'>
          <div className='bg-slate-200 w-[152px] h-[152px] rounded-full'>
            <Image
              src={`${data?.imageUrl}`}
              alt='logo profile'
              width={152}
              height={152}
            />
          </div>
          <div className='my-5'>
            {data?.firstName} {data?.lastName}
          </div>
          <Form {...form}>
            <form
              className='flex flex-col gap-y-4 w-[584px]'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                name='nickName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อเล่น</FormLabel>
                    <FormControl>
                      <Input
                        className='rounded-[20px]'
                        placeholder='ชื่อเล่นของฉัน'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='imageUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ImageUrl</FormLabel>
                    <FormControl>
                      <Input
                        className='rounded-[20px]'
                        placeholder='ImageUrl'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='bg-primary-500 cursor-pointer' type='submit'>
                อัพเดทโปรไฟล์
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default EditMyProfile
