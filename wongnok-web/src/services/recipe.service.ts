import {  RecipeForm, UserForm } from '@/app/create-recipe/page'
import { RecipeFormUpdate } from '@/app/edit-recipe/[recipeId]/page'
import { api } from '@/lib/axios'

export type User = {
  id: string
  firstName: string
  lastName: string
  imageUrl: string
  nickName: string
}

type CookingDuration = {
  id: number
  name: string
}

type Difficulty = {
  id: number
  name: string
}

// โครงสร้างข้อมูลเรซิพีที่หน้า List ใช้งาน
export type Recipe = {
  id: string
  name: string
  imageUrl: string
  description: string
  rating: Rating
  favorite: Favorite
  cookingDuration: CookingDuration
  difficulty: Difficulty
  user: User
  averageRating?: number
}

export type Rating = {
  foodRecipeID: number
  id: number
  score: number
  UserID: string
}

export type Favorite = {
  foodRecipeID: number
  id: number
  UserID: string
}

// โครงสร้างข้อมูลรายละเอียดเรซิพีที่หน้า Details ใช้งาน
type RecipeDetails = {
  id: number
  name: string
  description: string
  ingredient: string
  instruction: string
  imageUrl: string
  cookingDuration: CookingDuration
  difficulty: Difficulty
  rating: Rating
  favorite: Favorite
  createdAt: string
  updatedAt: string
  averageRating: number
  user: User
}

type fetchRecipeRequest = {
  page: number
  limit: number
  search: string
}

// ดึงรายการสูตรอาหารแบบแบ่งหน้า + ค้นหา
// - page/limit สำหรับ pagination
// - search สำหรับกรองด้วยชื่อ/คำอธิบาย
// เรียก API: GET /api/v1/food-recipes พร้อมแบ่งหน้าและค้นหาชื่อ/คำอธิบาย
export const fetchRecipes = async (data: fetchRecipeRequest) => {
  const recipesFetch = await api.get<{ results: Recipe[]; total: number }>(
    `/api/v1/food-recipes?page=${data.page}&limit=${data.limit}&search=${data.search}`
  )
  return recipesFetch.data
}

// ดึงรายละเอียดสูตรอาหารตาม id (ใช้ในหน้าแสดงรายละเอียด/แก้ไข)
// เรียก API: GET /api/v1/food-recipes/:id (มีค่าเฉลี่ย averageRating ตอบกลับ)
export const fetchRecipeDetails = async (id: number) => {
  const recipeDetails = await api.get<RecipeDetails>(
    `/api/v1/food-recipes/${id}`
  )
  return recipeDetails
}
// ลบสูตรอาหารของฉัน (เจ้าของเรคอร์ดเท่านั้น)
export const deleteMyRecipe = async (id: number) => {
  const recipeDetails = await api.delete<RecipeDetails>(
    `/api/v1/food-recipes/${id}`
  )
  return recipeDetails
}
// อัปเดตสูตรอาหารของฉัน — map ฟอร์มให้ตรงกับ API (difficultyID/cookingDurationID เป็นตัวเลข)
// เรียก API: PUT /api/v1/food-recipes/:id (Map ฟิลด์จากฟอร์มให้ตรง backend)
export const updateMyRecipe = async (data: RecipeFormUpdate) => {
  const recipeDetails = await api.put<RecipeFormUpdate>(
    `/api/v1/food-recipes/${data.id}`,
    {
      name: data.name,
      description: data.description,
      ingredient: data.ingredient,
      instruction: data.instruction,
      imageURL: data.imageURL ?? '',
      difficultyID: Number(data.difficulty),
      cookingDurationID: Number(data.duration),
    }
  )
  return recipeDetails
}

// สร้างสูตรอาหารใหม่ — โครงสร้างคล้าย update
// เรียก API: POST /api/v1/food-recipes
export const createRecipe = async (data: RecipeForm) => {
  const recipeDetails = await api.post<RecipeForm>(`/api/v1/food-recipes`, {
    name: data.name,
    description: data.description,
    ingredient: data.ingredient,
    instruction: data.instruction,
    imageURL: data.imageURL ?? '',
    difficultyID: Number(data.difficulty),
    cookingDurationID: Number(data.duration),
  })
  return recipeDetails
}

// ดึงสูตรอาหารของผู้ใช้
// - ถ้าไม่ระบุ userId จะใช้ 'self' (อ้างอิงจาก token ผู้ใช้ปัจจุบัน)
// - ถ้า user ใหม่และยังไม่มีข้อมูล จะเรียก POST /users เพื่อ upsert แล้วค่อย retry 1 ครั้ง
// เรียก API: GET /api/v1/users/:uid/food-recipes
export const fetchRecipesByUser = async (userId?: string) => {
  try {
    const uid = userId ?? 'self'
    const recipes = await api.get<{ results: Recipe[] }>(
      `/api/v1/users/${uid}/food-recipes`
    )
    return recipes.data.results || []
  } catch {
  // Fallback: สร้าง/อัปเดต user แล้วลองดึงใหม่อีกครั้ง
      try {
        await api.post(`/api/v1/users/`, {})
        const uid = userId ?? 'self'
        const recipes = await api.get<{ results: Recipe[] }>(
          `/api/v1/users/${uid}/food-recipes`
        )
        return recipes.data.results || []
      } catch {
        console.error('Error fetching recipes by user (after upsert):')
        return []
      }
  }
}

// ให้คะแนนสูตรอาหาร (POST /api/v1/food-recipes/:id/ratings)
export const createRating = async (data: Rating) => {
  const recipeRating = await api.post<Rating>(
    `/api/v1/food-recipes/${data.foodRecipeID}/ratings`,
    {
      score: data.score,
    }
  )
  return recipeRating
}

// ดึงรายการโปรดของฉันแบบแบ่งหน้า + ค้นหา (ผลรวมและรายการ)
export const getFavorite = async (data: fetchRecipeRequest) => {
  const recipeFavorite = await api.get<{ results: Recipe[]; total: number }>(
    `/api/v1/food-recipes/favorites?page=${data.page}&limit=${data.limit}&search=${data.search}`
  )
  return recipeFavorite.data
}
// ดึงข้อมูลผู้ใช้ปัจจุบัน (อิงจาก token)
// ข้อมูลผู้ใช้ปัจจุบันจาก token
export const getUser = async () => {
  const User = await api.get<User>(`/api/v1/users/`)
  return User.data
}
// อัปเดตข้อมูลผู้ใช้ (nickname, imageUrl)
// อัปเดตข้อมูลผู้ใช้
export const UpdateUser = async (data: UserForm) => {
  const User = await api.put<User>(`/api/v1/users/`, {
    nickName: data.nickName,
    imageUrl: data.imageUrl,
  })
  return User.data
}
// เพิ่มรายการโปรดให้สูตรอาหารตาม id
// เพิ่มรายการโปรดให้สูตรอาหาร
export const CreateFavorite = async (foodRecipeID: number) => {
  const favorite = await api.post(`/api/v1/food-recipes/${foodRecipeID}/favorites`)
  return favorite
}
// ลบรายการโปรดของสูตรอาหารตาม id
// ลบรายการโปรดของสูตรอาหาร
export const DeleteFavorite = async (foodRecipeID: number) => {
  const favorite = await api.delete(`/api/v1/food-recipes/${foodRecipeID}/favorites`)
  return favorite
}
