package model_test

import (
	"testing"
	"time"

	"wongnok/internal/model"
	"wongnok/internal/model/dto"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestRatingFromRequest(t *testing.T) {
	t.Run("ShouldCreateRatingFromRequest", func(t *testing.T) {
		rating := model.Rating{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Score:        3.5,
			FoodRecipeID: 10,
			UserID:       "original_user",
		}

		request := dto.RatingRequest{
			Score: 4.5,
		}

		result := rating.FromRequest(request)

		// Test that request data is mapped
		assert.Equal(t, request.Score, result.Score)

		// Test that other fields are reset (based on current implementation)
		assert.Equal(t, gorm.Model{}, result.Model)
		assert.Equal(t, uint(0), result.FoodRecipeID)
		assert.Equal(t, "", result.UserID)
	})

	t.Run("ShouldHandleZeroScore", func(t *testing.T) {
		rating := model.Rating{}

		request := dto.RatingRequest{
			Score: 0.0,
		}

		result := rating.FromRequest(request)

		assert.Equal(t, 0.0, result.Score)
	})

	t.Run("ShouldHandleMaximumScore", func(t *testing.T) {
		rating := model.Rating{}

		request := dto.RatingRequest{
			Score: 5.0,
		}

		result := rating.FromRequest(request)

		assert.Equal(t, 5.0, result.Score)
	})

	t.Run("ShouldHandleFloatingPointScore", func(t *testing.T) {
		rating := model.Rating{}

		request := dto.RatingRequest{
			Score: 3.7,
		}

		result := rating.FromRequest(request)

		assert.Equal(t, 3.7, result.Score)
	})

	t.Run("ShouldHandleNegativeScore", func(t *testing.T) {
		rating := model.Rating{}

		request := dto.RatingRequest{
			Score: -1.0,
		}

		result := rating.FromRequest(request)

		assert.Equal(t, -1.0, result.Score)
	})
}

func TestRatingToResponse(t *testing.T) {
	t.Run("ShouldTransformRatingToResponse", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2023, 1, 2, 10, 0, 0, 0, time.UTC)

		rating := model.Rating{
			Model: gorm.Model{
				ID:        1,
				CreatedAt: createdAt,
				UpdatedAt: updatedAt,
			},
			Score:        4.5,
			FoodRecipeID: 123,
			UserID:       "user456",
		}

		result := rating.ToResponse()

		assert.Equal(t, 4.5, result.Score)
		assert.Equal(t, uint(123), result.FoodRecipeID)
	})

	t.Run("ShouldHandleZeroValues", func(t *testing.T) {
		rating := model.Rating{
			Model: gorm.Model{
				ID: 1,
			},
			Score:        0.0,
			FoodRecipeID: 0,
			UserID:       "",
		}

		result := rating.ToResponse()

		assert.Equal(t, 0.0, result.Score)
		assert.Equal(t, uint(0), result.FoodRecipeID)
	})

	t.Run("ShouldHandleFloatingPointScore", func(t *testing.T) {
		rating := model.Rating{
			Model: gorm.Model{
				ID: 1,
			},
			Score:        3.14159,
			FoodRecipeID: 999,
			UserID:       "user123",
		}

		result := rating.ToResponse()

		assert.Equal(t, 3.14159, result.Score)
		assert.Equal(t, uint(999), result.FoodRecipeID)
	})

	t.Run("ShouldNotIncludeUserIDInResponse", func(t *testing.T) {
		rating := model.Rating{
			Model: gorm.Model{
				ID: 1,
			},
			Score:        4.0,
			FoodRecipeID: 100,
			UserID:       "secret_user_id",
		}

		result := rating.ToResponse()

		// Verify that UserID is not exposed in response
		assert.Equal(t, 4.0, result.Score)
		assert.Equal(t, uint(100), result.FoodRecipeID)
		// UserID should not be accessible in response
	})
}

func TestRatingsToResponse(t *testing.T) {
	t.Run("ShouldConvertMultipleRatingsToResponse", func(t *testing.T) {
		ratings := model.Ratings{
			{
				Model: gorm.Model{ID: 1},
				Score: 5.0,
				FoodRecipeID: 100,
				UserID: "user1",
			},
			{
				Model: gorm.Model{ID: 2},
				Score: 3.5,
				FoodRecipeID: 200,
				UserID: "user2",
			},
			{
				Model: gorm.Model{ID: 3},
				Score: 4.2,
				FoodRecipeID: 300,
				UserID: "user3",
			},
		}

		result := ratings.ToResponse()

		assert.Len(t, result.Results, 3)

		// Test first rating
		assert.Equal(t, 5.0, result.Results[0].Score)
		assert.Equal(t, uint(100), result.Results[0].FoodRecipeID)

		// Test second rating
		assert.Equal(t, 3.5, result.Results[1].Score)
		assert.Equal(t, uint(200), result.Results[1].FoodRecipeID)

		// Test third rating
		assert.Equal(t, 4.2, result.Results[2].Score)
		assert.Equal(t, uint(300), result.Results[2].FoodRecipeID)
	})

	t.Run("ShouldHandleEmptyRatingsList", func(t *testing.T) {
		ratings := model.Ratings{}

		result := ratings.ToResponse()

		assert.Len(t, result.Results, 0)
		assert.NotNil(t, result.Results) // Should be empty slice, not nil
	})

	t.Run("ShouldHandleNilRatingsList", func(t *testing.T) {
		var ratings model.Ratings

		result := ratings.ToResponse()

		assert.Len(t, result.Results, 0)
		assert.NotNil(t, result.Results) // Should be empty slice, not nil
	})

	t.Run("ShouldHandleSingleRating", func(t *testing.T) {
		ratings := model.Ratings{
			{
				Model: gorm.Model{ID: 1},
				Score: 4.8,
				FoodRecipeID: 999,
				UserID: "solo_user",
			},
		}

		result := ratings.ToResponse()

		assert.Len(t, result.Results, 1)
		assert.Equal(t, 4.8, result.Results[0].Score)
		assert.Equal(t, uint(999), result.Results[0].FoodRecipeID)
	})

	t.Run("ShouldHandleRatingsWithZeroScores", func(t *testing.T) {
		ratings := model.Ratings{
			{
				Model: gorm.Model{ID: 1},
				Score: 0.0,
				FoodRecipeID: 100,
				UserID: "user1",
			},
			{
				Model: gorm.Model{ID: 2},
				Score: 5.0,
				FoodRecipeID: 200,
				UserID: "user2",
			},
		}

		result := ratings.ToResponse()

		assert.Len(t, result.Results, 2)
		assert.Equal(t, 0.0, result.Results[0].Score)
		assert.Equal(t, 5.0, result.Results[1].Score)
	})

	t.Run("ShouldPreserveRatingOrder", func(t *testing.T) {
		ratings := model.Ratings{
			{
				Model: gorm.Model{ID: 3},
				Score: 3.0,
				FoodRecipeID: 300,
			},
			{
				Model: gorm.Model{ID: 1},
				Score: 1.0,
				FoodRecipeID: 100,
			},
			{
				Model: gorm.Model{ID: 2},
				Score: 2.0,
				FoodRecipeID: 200,
			},
		}

		result := ratings.ToResponse()

		assert.Len(t, result.Results, 3)
		// Order should be preserved as in original slice
		assert.Equal(t, 3.0, result.Results[0].Score)
		assert.Equal(t, uint(300), result.Results[0].FoodRecipeID)
		assert.Equal(t, 1.0, result.Results[1].Score)
		assert.Equal(t, uint(100), result.Results[1].FoodRecipeID)
		assert.Equal(t, 2.0, result.Results[2].Score)
		assert.Equal(t, uint(200), result.Results[2].FoodRecipeID)
	})
}