'use client'

import PopupFailCreateUpdate from '@/components/PopupFailCreateUpdate'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { createRecipe } from '@/services/recipe.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

export type RecipeForm = {
  name: string
  description: string
  ingredient: string
  instruction: string
  imageURL?: string
  difficulty: string
  duration: string
}
export type UserForm = {
  imageUrl?: string
  nickName : string
}
export type FavoriteForm = {
  foodRecipeID: number
}



const RecipeSchema = z.object({
  name: z.string().min(2, { message: 'กรุณากรอกอย่างน้อย 2 ตัวอักษร' }),
  description: z.string().min(2, { message: 'กรุณากรอกอย่างน้อย 10 ตัวอักษร' }),
  ingredient: z.string().min(2, { message: 'กรุณาใส่วัตถุดิบที่ต้องการ' }),
  instruction: z.string().min(2, { message: 'กรุณาใส่วิธีการ' }),
  imageURL: z.string().url().optional().or(z.literal('')),
  difficulty: z.enum(['1', '2', '3']),
  duration: z.enum(['1', '2', '3', '4']),
})

type RecipeSchemaType = z.infer<typeof RecipeSchema>

const CreateRecipe = () => {
  const router = useRouter()
  const [Popup , setPopup] = useState(false)

  const { mutateAsync: postCreateRecipe } = useMutation({
    mutationFn: createRecipe,
    onError: () => {
      setPopup(true)
      
    },
    onSuccess: () => {
      router.replace('/')
    },
  })

  const form = useForm<RecipeSchemaType>({
    resolver: zodResolver(RecipeSchema),
    defaultValues: {
      name: '',
      description: '',
      ingredient: '',
      instruction: '',
      imageURL: '',
      difficulty: '1',
      duration: '1',
    },
  })

  const onSubmit: SubmitHandler<RecipeForm> = (data) => postCreateRecipe(data)

  return (
    <div>
      {Popup && <PopupFailCreateUpdate closePopup={setPopup}/>}
      <h1 className='text-4xl font-bold pb-8'>สร้างสูตรอาหารของฉัน</h1>
      <Form {...form}>
        <form
          className='flex flex-col gap-y-4'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อเมนู</FormLabel>
                <FormControl>
                  <Input
                    className='rounded-[20px]'
                    placeholder='กรอกชื่อเมนูอาหารของฉัน'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            rules={{
              minLength: 2,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>คำอธิบายเกียวกับอาหาร</FormLabel>
                <Textarea
                  className='rounded-[20px]'
                  placeholder='กรอกคำอธิบายเกี่ยวกับอาหาร'
                  {...field}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='ingredient'
            rules={{
              minLength: 2,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>วัตถุดิบ</FormLabel>
                <Textarea
                  className='rounded-[20px]'
                  placeholder='กรอกวัตถุดิบที่ใช้ในการทำอาหาร'
                  {...field}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='instruction'
            rules={{
              minLength: 2,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>วิธีการทำอาหาร</FormLabel>
                <Textarea
                  className='rounded-[20px]'
                  placeholder='กรอกวิธีการทำอาหาร'
                  {...field}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='imageURL'
            rules={{
              minLength: 2,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL ของรูปภาพ</FormLabel>
                <Input
                  className='rounded-[20px]'
                  placeholder='กรอกลิ้งค์ของรูป'
                  {...field}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='difficulty'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ระดับความยาก</FormLabel>
                <RadioGroup
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  className='flex'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='1' id='easy' />
                    <Label htmlFor='easy'>ง่าย</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='2' id='medium' />
                    <Label htmlFor='medium'>ปรานกลาง</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='3' id='hard' />
                    <Label htmlFor='hard'>ยาก</Label>
                  </div>
                </RadioGroup>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='duration'
            render={({ field }) => (
              <FormItem>
                <FormLabel>ระยะเวลาทำอาหาร</FormLabel>
                <RadioGroup
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  className='flex'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='1' id='1' />
                    <Label htmlFor='1'>5-10 นาที</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='2' id='2' />
                    <Label htmlFor='2'>11-30 นาที</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='3' id='3' />
                    <Label htmlFor='3'>31-60 นาที</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='4' id='4' />
                    <Label htmlFor='4'>มากกว่า 60 นาที</Label>
                  </div>
                </RadioGroup>
              </FormItem>
            )}
          />
          <Button className='bg-primary-500 cursor-pointer' type='submit'>
            สร้างสูตรอาหาร
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default CreateRecipe
