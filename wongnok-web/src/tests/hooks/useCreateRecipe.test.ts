import { RecipeForm } from '@/app/create-recipe/page'
import useCreateRecipe from '@/hooks/useCreateRecipe'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const mockCreateRecipeFormValues: RecipeForm = {
  name: 'Pose Egg',
  description: 'Description of pose egg',
  ingredient: 'water eggs',
  instruction: 'this is a instruction',
  imageURL: 'https://assets.wongnok.com/image1.png',
  difficulty: '1',
  duration: '1',
}

describe('Validate function in create recipe custom hooks', () => {
  it('Should return create recipe payload', () => {
    // arrange
    const createRecipeHook = renderHook(() => useCreateRecipe())
    const { mapRecipePayload } = createRecipeHook.result.current

    // act
    const result = mapRecipePayload(mockCreateRecipeFormValues)

    // assert
    expect(result.difficultyID).toBeTypeOf('number')
    expect(result.cookingDurationID).toBeTypeOf('number')
  })

  it('Should return create recipe payload', () => {
    // arrange
    const recipeWithoutImage = {
      ...mockCreateRecipeFormValues,
      imageURL: undefined,
    }

    const createRecipeHook = renderHook(() => useCreateRecipe())
    const { mapRecipePayload } = createRecipeHook.result.current

    // act
    const result = mapRecipePayload(recipeWithoutImage)

    // assert
    expect(result.difficultyID).toBeTypeOf('number')
    expect(result.cookingDurationID).toBeTypeOf('number')
    expect(result.imageURL).toBe('')
  })
})
