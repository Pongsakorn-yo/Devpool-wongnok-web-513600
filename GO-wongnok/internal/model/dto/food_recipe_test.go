package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
)

func TestFoodRecipeRequest_Validation(t *testing.T) {
	validate := validator.New()

	testCases := []struct {
		name      string
		request   FoodRecipeRequest
		expectErr bool
		errFields []string
	}{
		{
			name: "Valid request",
			request: FoodRecipeRequest{
				Name:              "Pad Thai",
				Description:       "Traditional Thai noodle dish",
				Ingredient:        "Rice noodles, shrimp, eggs, bean sprouts",
				Instruction:       "1. Soak noodles 2. Stir fry everything",
				ImageURL:          stringPtr("https://example.com/image.jpg"),
				CookingDurationID: 2,
				DifficultyID:      1,
			},
			expectErr: false,
		},
		{
			name: "Missing required fields",
			request: FoodRecipeRequest{
				CookingDurationID: 1,
				DifficultyID:      1,
			},
			expectErr: true,
			errFields: []string{"Name", "Description", "Ingredient", "Instruction"},
		},
		{
			name: "Invalid URL",
			request: FoodRecipeRequest{
				Name:              "Test Recipe",
				Description:       "Test Description",
				Ingredient:        "Test Ingredient",
				Instruction:       "Test Instruction",
				ImageURL:          stringPtr("invalid-url"),
				CookingDurationID: 1,
				DifficultyID:      1,
			},
			expectErr: true,
			errFields: []string{"ImageURL"},
		},
		{
			name: "Invalid CookingDurationID",
			request: FoodRecipeRequest{
				Name:              "Test Recipe",
				Description:       "Test Description",
				Ingredient:        "Test Ingredient",
				Instruction:       "Test Instruction",
				CookingDurationID: 5, // Invalid - should be 1, 2, or 3
				DifficultyID:      1,
			},
			expectErr: true,
			errFields: []string{"CookingDurationID"},
		},
		{
			name: "Invalid DifficultyID",
			request: FoodRecipeRequest{
				Name:              "Test Recipe",
				Description:       "Test Description",
				Ingredient:        "Test Ingredient",
				Instruction:       "Test Instruction",
				CookingDurationID: 1,
				DifficultyID:      5, // Invalid - should be 1, 2, or 3
			},
			expectErr: true,
			errFields: []string{"DifficultyID"},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := validate.Struct(tc.request)

			if tc.expectErr {
				assert.Error(t, err)
				for _, field := range tc.errFields {
					assert.Contains(t, err.Error(), field)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestFoodRecipeResponse_JSONMarshaling(t *testing.T) {
	now := time.Now()
	imageURL := "https://example.com/image.jpg"

	response := FoodRecipeResponse{
		ID:          1,
		Name:        "Pad Thai",
		Description: "Traditional Thai noodle dish",
		Ingredient:  "Rice noodles, shrimp, eggs",
		Instruction: "Stir fry everything together",
		ImageURL:    &imageURL,
		CookingDuration: CookingDurationResponse{
			ID:   2,
			Name: "Medium (30 min)",
		},
		Difficulty: DifficultyResponse{
			ID:   1,
			Name: "Easy",
		},
		CreatedAt:     now,
		UpdatedAt:     now,
		AverageRating: 4.5,
		User: UserResponse{
			ID:        "user-123",
			FirstName: "John",
			LastName:  "Doe",
		},
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "Pad Thai")
	assert.Contains(t, string(jsonData), "Traditional Thai")

	// Test JSON unmarshaling
	var unmarshaled FoodRecipeResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, response.ID, unmarshaled.ID)
	assert.Equal(t, response.Name, unmarshaled.Name)
	assert.Equal(t, response.AverageRating, unmarshaled.AverageRating)
}

func TestFoodRecipeResponse_OmitEmptyImageURL(t *testing.T) {
	response := FoodRecipeResponse{
		ID:          1,
		Name:        "Test Recipe",
		Description: "Test Description",
		Ingredient:  "Test Ingredient",
		Instruction: "Test Instruction",
		// ImageURL is nil
		CookingDuration: CookingDurationResponse{ID: 1, Name: "Quick"},
		Difficulty:      DifficultyResponse{ID: 1, Name: "Easy"},
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		AverageRating:   0,
		User:            UserResponse{ID: "user-123"},
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	// ImageURL should be omitted when nil
	assert.NotContains(t, string(jsonData), "imageUrl")
}

func TestFoodRecipesResponse_BaseListResponse(t *testing.T) {
	recipes := []FoodRecipeResponse{
		{
			ID:              1,
			Name:            "Recipe 1",
			Description:     "Description 1",
			Ingredient:      "Ingredient 1",
			Instruction:     "Instruction 1",
			CookingDuration: CookingDurationResponse{ID: 1},
			Difficulty:      DifficultyResponse{ID: 1},
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
			AverageRating:   4.0,
			User:            UserResponse{ID: "user-1"},
		},
		{
			ID:              2,
			Name:            "Recipe 2",
			Description:     "Description 2",
			Ingredient:      "Ingredient 2",
			Instruction:     "Instruction 2",
			CookingDuration: CookingDurationResponse{ID: 2},
			Difficulty:      DifficultyResponse{ID: 2},
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
			AverageRating:   3.5,
			User:            UserResponse{ID: "user-2"},
		},
	}

	response := FoodRecipesResponse{
		Total:   2,
		Results: recipes,
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "Recipe 1")
	assert.Contains(t, string(jsonData), "Recipe 2")
	assert.Contains(t, string(jsonData), "\"total\":2")

	var unmarshaled FoodRecipesResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, int64(2), unmarshaled.Total)
	assert.Equal(t, 2, len(unmarshaled.Results))
}

func TestFoodRecipeRequest_JSONMarshaling(t *testing.T) {
	imageURL := "https://example.com/test.jpg"
	request := FoodRecipeRequest{
		Name:              "Test Recipe",
		Description:       "Test Description",
		Ingredient:        "Test Ingredient",
		Instruction:       "Test Instruction",
		ImageURL:          &imageURL,
		CookingDurationID: 1,
		DifficultyID:      2,
	}

	jsonData, err := json.Marshal(request)
	assert.NoError(t, err)

	var unmarshaled FoodRecipeRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, request.Name, unmarshaled.Name)
	assert.Equal(t, request.CookingDurationID, unmarshaled.CookingDurationID)
	assert.Equal(t, request.DifficultyID, unmarshaled.DifficultyID)
}

// Helper function to create string pointer
func stringPtr(s string) *string {
	return &s
}
