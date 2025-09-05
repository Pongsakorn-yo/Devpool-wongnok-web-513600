import { RecipeForm } from '@/app/create-recipe/page'

const useCreateRecipe = () => {
  const mapRecipePayload = (data: RecipeForm) => {
    return {
      name: data.name,
      description: data.description,
      ingredient: data.ingredient,
      instruction: data.instruction,
      imageURL: data.imageURL ?? '',
      difficultyID: Number(data.difficulty),
      cookingDurationID: Number(data.duration),
    }
  }

  return { mapRecipePayload }
}

export default useCreateRecipe
