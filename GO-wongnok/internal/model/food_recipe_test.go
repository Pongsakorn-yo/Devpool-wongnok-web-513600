package model_test

import (
	"testing"
	"time"

	"wongnok/internal/model"
	"wongnok/internal/model/dto"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestFoodRecipeToResponse(t *testing.T) {
	t.Run("ShouldReturnFoodRecipeResponseWithAllFields", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2023, 1, 2, 10, 0, 0, 0, time.UTC)

		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: createdAt,
				UpdatedAt: updatedAt,
			},
			Name:              "Delicious Recipe",
			Description:       "A very tasty recipe",
			Ingredient:        "Flour, Sugar, Eggs",
			Instruction:       "Mix all ingredients",
			ImageURL:          nil,
			CookingDurationID: 1,
			CookingDuration: model.CookingDuration{
				Model: gorm.Model{
					ID: 1,
				},
				Name: "30 minutes",
			},
			DifficultyID: 2,
			Difficulty: model.Difficulty{
				Model: gorm.Model{
					ID: 2,
				},
				Name: "Medium",
			},
			AverageRating: 4.5,
			UserID:        "user123",
			User: model.User{
				ID:        "user123",
				FirstName: "John",
				LastName:  "Doe",
			},
		}

		result := FoodRecipe.ToResponse()

		// Test basic fields
		assert.Equal(t, uint(1), result.ID)
		assert.Equal(t, "Delicious Recipe", result.Name)
		assert.Equal(t, "A very tasty recipe", result.Description)
		assert.Equal(t, "Flour, Sugar, Eggs", result.Ingredient)
		assert.Equal(t, "Mix all ingredients", result.Instruction)
		assert.Nil(t, result.ImageURL)
		assert.Equal(t, 4.5, result.AverageRating)
		assert.Equal(t, createdAt, result.CreatedAt)
		assert.Equal(t, updatedAt, result.UpdatedAt)

		// Test CookingDuration mapping
		assert.Equal(t, uint(1), result.CookingDuration.ID)
		assert.Equal(t, "30 minutes", result.CookingDuration.Name)

		// Test Difficulty mapping
		assert.Equal(t, uint(2), result.Difficulty.ID)
		assert.Equal(t, "Medium", result.Difficulty.Name)

		// Test User mapping (assumes User.ToResponse() exists)
		assert.Equal(t, "user123", result.User.ID)
		assert.Equal(t, "John", result.User.FirstName)
		assert.Equal(t, "Doe", result.User.LastName)
	})

	t.Run("ShouldHandleNonNilImageURL", func(t *testing.T) {
		imageURL := "https://example.com/recipe-image.jpg"
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Name:        "Recipe with Image",
			Description: "Recipe that has an image",
			ImageURL:    &imageURL,
			CookingDuration: model.CookingDuration{
				Model: gorm.Model{ID: 1},
				Name:  "Quick",
			},
			Difficulty: model.Difficulty{
				Model: gorm.Model{ID: 1},
				Name:  "Easy",
			},
			User: model.User{
				ID:        "user1",
				FirstName: "Jane",
				LastName:  "Smith",
			},
		}

		result := FoodRecipe.ToResponse()

		assert.NotNil(t, result.ImageURL)
		assert.Equal(t, imageURL, *result.ImageURL)
	})

	t.Run("ShouldHandleZeroAverageRating", func(t *testing.T) {
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Name:          "New Recipe",
			Description:   "Recipe with no ratings yet",
			AverageRating: 0.0,
			CookingDuration: model.CookingDuration{
				Model: gorm.Model{ID: 1},
				Name:  "Quick",
			},
			Difficulty: model.Difficulty{
				Model: gorm.Model{ID: 1},
				Name:  "Easy",
			},
			User: model.User{
				ID:        "user1",
				FirstName: "Jane",
				LastName:  "Smith",
			},
		}

		result := FoodRecipe.ToResponse()

		assert.Equal(t, 0.0, result.AverageRating)
	})

	t.Run("ShouldHandleEmptyStrings", func(t *testing.T) {
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Name:        "",
			Description: "",
			Ingredient:  "",
			Instruction: "",
			CookingDuration: model.CookingDuration{
				Model: gorm.Model{ID: 1},
				Name:  "",
			},
			Difficulty: model.Difficulty{
				Model: gorm.Model{ID: 1},
				Name:  "",
			},
			User: model.User{
				ID:        "",
				FirstName: "",
				LastName:  "",
			},
		}

		result := FoodRecipe.ToResponse()

		assert.Equal(t, "", result.Name)
		assert.Equal(t, "", result.Description)
		assert.Equal(t, "", result.Ingredient)
		assert.Equal(t, "", result.Instruction)
		assert.Equal(t, "", result.CookingDuration.Name)
		assert.Equal(t, "", result.Difficulty.Name)
	})
}

func TestFromRequest(t *testing.T) {
	t.Run("ShouldCreateFoodRecipeFromRequestWithBasicFields", func(t *testing.T) {
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Name:              "Original Name",
			Description:       "Original Description",
			Ingredient:        "Original Ingredient",
			Instruction:       "Original Instruction",
			ImageURL:          nil,
			CookingDurationID: 2,
			DifficultyID:      2,
			UserID:            "original_user",
		}

		request := dto.FoodRecipeRequest{
			Name:              "Updated Name",
			Description:       "Updated Description",
			Ingredient:        "Updated Ingredient",
			Instruction:       "Updated Instruction",
			ImageURL:          nil,
			CookingDurationID: 1,
			DifficultyID:      1,
		}

		claims := model.Claims{
			ID:        "user_id",
			FirstName: "First",
			LastName:  "Last",
		}

		result := FoodRecipe.FromRequest(request, claims)

		// Test that request fields are properly mapped
		assert.Equal(t, request.Name, result.Name)
		assert.Equal(t, request.Description, result.Description)
		assert.Equal(t, request.Ingredient, result.Ingredient)
		assert.Equal(t, request.Instruction, result.Instruction)
		assert.Equal(t, request.ImageURL, result.ImageURL)
		assert.Equal(t, request.CookingDurationID, result.CookingDurationID)
		assert.Equal(t, request.DifficultyID, result.DifficultyID)

		// Test that claims are properly mapped
		assert.Equal(t, claims.ID, result.UserID)

		// Test that original Model is preserved
		assert.Equal(t, FoodRecipe.Model, result.Model)
	})

	t.Run("ShouldPreserveExistingRelatedEntities", func(t *testing.T) {
		originalTime := time.Now()
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: originalTime,
				UpdatedAt: originalTime,
			},
			Name:              "Original Name",
			Description:       "Original Description",
			Ingredient:        "Original Ingredient",
			Instruction:       "Original Instruction",
			ImageURL:          nil,
			CookingDurationID: 1,
			CookingDuration: model.CookingDuration{
				Model: gorm.Model{ID: 1},
				Name:  "Quick",
			},
			DifficultyID: 1,
			Difficulty: model.Difficulty{
				Model: gorm.Model{ID: 1},
				Name:  "Easy",
			},
			AverageRating: 4.5,
			UserID:        "original_user",
			User: model.User{
				ID:        "original_user",
				FirstName: "Original",
				LastName:  "User",
			},
		}

		request := dto.FoodRecipeRequest{
			Name:              "Updated Name",
			Description:       "Updated Description",
			Ingredient:        "Updated Ingredient",
			Instruction:       "Updated Instruction",
			ImageURL:          nil,
			CookingDurationID: 2, // Different from original
			DifficultyID:      2, // Different from original
		}

		claims := model.Claims{
			ID:        "new_user_id",
			FirstName: "New",
			LastName:  "User",
		}

		result := FoodRecipe.FromRequest(request, claims)

		// Test that request data is updated
		assert.Equal(t, request.Name, result.Name)
		assert.Equal(t, request.CookingDurationID, result.CookingDurationID)
		assert.Equal(t, request.DifficultyID, result.DifficultyID)

		// Test that user is updated from claims
		assert.Equal(t, claims.ID, result.UserID)

		// Test that Model is preserved from original
		assert.Equal(t, FoodRecipe.Model.ID, result.Model.ID)
		assert.Equal(t, originalTime, result.Model.CreatedAt)
		assert.Equal(t, originalTime, result.Model.UpdatedAt)
	})

	t.Run("ShouldHandleNilImageURL", func(t *testing.T) {
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{ID: 1},
		}

		request := dto.FoodRecipeRequest{
			Name:        "Test Recipe",
			Description: "Test Description",
			ImageURL:    nil,
		}

		claims := model.Claims{
			ID: "user_id",
		}

		result := FoodRecipe.FromRequest(request, claims)

		assert.Nil(t, result.ImageURL)
	})

	t.Run("ShouldHandleNonNilImageURL", func(t *testing.T) {
		FoodRecipe := model.FoodRecipe{
			Model: gorm.Model{ID: 1},
		}

		imageURL := "https://example.com/image.jpg"
		request := dto.FoodRecipeRequest{
			Name:        "Test Recipe",
			Description: "Test Description",
			ImageURL:    &imageURL,
		}

		claims := model.Claims{
			ID: "user_id",
		}

		result := FoodRecipe.FromRequest(request, claims)

		assert.NotNil(t, result.ImageURL)
		assert.Equal(t, imageURL, *result.ImageURL)
	})
}

func TestFoodRecipesToResponse(t *testing.T) {
	t.Run("ShouldConvertFoodRecipesToResponseWithTotal", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		recipes := model.FoodRecipes{
			{
				Model: gorm.Model{
					ID:        1,
					CreatedAt: createdAt,
					UpdatedAt: createdAt,
				},
				Name:        "Recipe 1",
				Description: "Description 1",
				CookingDuration: model.CookingDuration{
					Model: gorm.Model{ID: 1},
					Name:  "Quick",
				},
				Difficulty: model.Difficulty{
					Model: gorm.Model{ID: 1},
					Name:  "Easy",
				},
				User: model.User{
					ID:        "user1",
					FirstName: "John",
					LastName:  "Doe",
				},
			},
			{
				Model: gorm.Model{
					ID:        2,
					CreatedAt: createdAt,
					UpdatedAt: createdAt,
				},
				Name:        "Recipe 2",
				Description: "Description 2",
				CookingDuration: model.CookingDuration{
					Model: gorm.Model{ID: 2},
					Name:  "Medium",
				},
				Difficulty: model.Difficulty{
					Model: gorm.Model{ID: 2},
					Name:  "Medium",
				},
				User: model.User{
					ID:        "user2",
					FirstName: "Jane",
					LastName:  "Smith",
				},
			},
		}

		total := int64(50)
		result := recipes.ToResponse(total)

		assert.Equal(t, total, result.Total)
		assert.Len(t, result.Results, 2)
		
		// Test first recipe
		assert.Equal(t, uint(1), result.Results[0].ID)
		assert.Equal(t, "Recipe 1", result.Results[0].Name)
		assert.Equal(t, "Description 1", result.Results[0].Description)
		
		// Test second recipe
		assert.Equal(t, uint(2), result.Results[1].ID)
		assert.Equal(t, "Recipe 2", result.Results[1].Name)
		assert.Equal(t, "Description 2", result.Results[1].Description)
	})

	t.Run("ShouldHandleEmptyRecipesList", func(t *testing.T) {
		recipes := model.FoodRecipes{}
		total := int64(0)
		
		result := recipes.ToResponse(total)
		
		assert.Equal(t, total, result.Total)
		assert.Len(t, result.Results, 0)
		assert.NotNil(t, result.Results) // Should be empty slice, not nil
	})

	t.Run("ShouldHandleNilRecipesList", func(t *testing.T) {
		var recipes model.FoodRecipes
		total := int64(0)
		
		result := recipes.ToResponse(total)
		
		assert.Equal(t, total, result.Total)
		assert.Len(t, result.Results, 0)
	})
}

func TestCalculateAverageRating(t *testing.T) {
	t.Run("ShouldCalculateAverageRatingWithMultipleRatings", func(t *testing.T) {
		recipe := model.FoodRecipe{
			Model: gorm.Model{ID: 1},
			Name:  "Test Recipe",
			Ratings: model.Ratings{
				{Score: 5.0},
				{Score: 4.0},
				{Score: 3.0},
			},
		}

		result := recipe.CalculateAverageRating()

		expectedAverage := (5.0 + 4.0 + 3.0) / 3.0
		assert.Equal(t, expectedAverage, result.AverageRating)
	})

	t.Run("ShouldCalculateAverageRatingWithSingleRating", func(t *testing.T) {
		recipe := model.FoodRecipe{
			Model: gorm.Model{ID: 1},
			Name:  "Test Recipe",
			Ratings: model.Ratings{
				{Score: 4.5},
			},
		}

		result := recipe.CalculateAverageRating()

		assert.Equal(t, 4.5, result.AverageRating)
	})

	t.Run("ShouldReturnZeroWhenNoRatings", func(t *testing.T) {
		recipe := model.FoodRecipe{
			Model:   gorm.Model{ID: 1},
			Name:    "Test Recipe",
			Ratings: model.Ratings{}, // Empty ratings
		}

		result := recipe.CalculateAverageRating()

		assert.Equal(t, 0.0, result.AverageRating)
	})

	t.Run("ShouldReturnZeroWhenNilRatings", func(t *testing.T) {
		recipe := model.FoodRecipe{
			Model:   gorm.Model{ID: 1},
			Name:    "Test Recipe",
			Ratings: nil, // Nil ratings
		}

		result := recipe.CalculateAverageRating()

		assert.Equal(t, 0.0, result.AverageRating)
	})

	t.Run("ShouldHandleFloatingPointPrecision", func(t *testing.T) {
		recipe := model.FoodRecipe{
			Model: gorm.Model{ID: 1},
			Name:  "Test Recipe",
			Ratings: model.Ratings{
				{Score: 4.7},
				{Score: 3.3},
				{Score: 4.0},
			},
		}

		result := recipe.CalculateAverageRating()

		expectedAverage := (4.7 + 3.3 + 4.0) / 3.0
		assert.InDelta(t, expectedAverage, result.AverageRating, 0.001)
	})
}

func TestCalculateAverageRatings(t *testing.T) {
	t.Run("ShouldCalculateAverageRatingsForMultipleRecipes", func(t *testing.T) {
		recipes := model.FoodRecipes{
			{
				Model: gorm.Model{ID: 1},
				Name:  "Recipe 1",
				Ratings: model.Ratings{
					{Score: 5.0},
					{Score: 3.0},
				},
			},
			{
				Model: gorm.Model{ID: 2},
				Name:  "Recipe 2",
				Ratings: model.Ratings{
					{Score: 4.0},
					{Score: 4.0},
					{Score: 2.0},
				},
			},
			{
				Model: gorm.Model{ID: 3},
				Name:  "Recipe 3",
				Ratings: model.Ratings{}, // No ratings
			},
		}

		result := recipes.CalculateAverageRatings()

		// Recipe 1: (5.0 + 3.0) / 2 = 4.0
		assert.Equal(t, 4.0, result[0].AverageRating)
		
		// Recipe 2: (4.0 + 4.0 + 2.0) / 3 = 3.333...
		expectedAverage := (4.0 + 4.0 + 2.0) / 3.0
		assert.InDelta(t, expectedAverage, result[1].AverageRating, 0.001)
		
		// Recipe 3: No ratings = 0.0
		assert.Equal(t, 0.0, result[2].AverageRating)
	})

	t.Run("ShouldHandleEmptyRecipesList", func(t *testing.T) {
		recipes := model.FoodRecipes{}
		
		result := recipes.CalculateAverageRatings()
		
		assert.Len(t, result, 0)
	})

	t.Run("ShouldHandleNilRecipesList", func(t *testing.T) {
		var recipes model.FoodRecipes
		
		result := recipes.CalculateAverageRatings()
		
		assert.Nil(t, result)
	})

	t.Run("ShouldPreserveOriginalRecipeData", func(t *testing.T) {
		originalName := "Original Recipe"
		originalID := uint(1)
		
		recipes := model.FoodRecipes{
			{
				Model: gorm.Model{ID: originalID},
				Name:  originalName,
				Ratings: model.Ratings{
					{Score: 4.0},
				},
			},
		}

		result := recipes.CalculateAverageRatings()

		// Test that original data is preserved
		assert.Equal(t, originalID, result[0].ID)
		assert.Equal(t, originalName, result[0].Name)
		assert.Equal(t, 4.0, result[0].AverageRating)
	})
}
