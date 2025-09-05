import { Recipe, fetchRecipes } from '@/services/recipe.service'
import { useState, useEffect } from 'react'

export const useFetch = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    ; (async () => {
      const recipesFetch = await fetchRecipes({
        page: 1,
        limit: 5,
        search: ""
      })
      setRecipes(recipesFetch.results)
    })()
  }, [])

  return recipes
}
