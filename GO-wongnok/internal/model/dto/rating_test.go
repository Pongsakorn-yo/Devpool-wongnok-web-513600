package dto

import (
	"encoding/json"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
)

func TestRatingRequest_Validation(t *testing.T) {
	validate := validator.New()

	testCases := []struct {
		name      string
		request   RatingRequest
		expectErr bool
	}{
		{
			name: "Valid rating - middle score",
			request: RatingRequest{
				Score: 3.5,
			},
			expectErr: false,
		},
		{
			name: "Valid rating - maximum score",
			request: RatingRequest{
				Score: 5.0,
			},
			expectErr: false,
		},
		{
			name: "Valid rating - decimal score",
			request: RatingRequest{
				Score: 4.7,
			},
			expectErr: false,
		},
		{
			name: "Valid rating - minimum positive score",
			request: RatingRequest{
				Score: 0.1,
			},
			expectErr: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := validate.Struct(tc.request)

			if tc.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestRatingRequest_JSONMarshaling(t *testing.T) {
	request := RatingRequest{
		Score: 4.5,
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(request)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "4.5")

	// Test JSON unmarshaling
	var unmarshaled RatingRequest
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, request.Score, unmarshaled.Score)
}

func TestRatingResponse_JSONMarshaling(t *testing.T) {
	response := RatingResponse{
		Score:        4.2,
		FoodRecipeID: 123,
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "4.2")
	assert.Contains(t, string(jsonData), "123")

	// Test JSON unmarshaling
	var unmarshaled RatingResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, response.Score, unmarshaled.Score)
	assert.Equal(t, response.FoodRecipeID, unmarshaled.FoodRecipeID)
}

func TestRatingResponse_ZeroValues(t *testing.T) {
	response := RatingResponse{
		Score:        0.0,
		FoodRecipeID: 0,
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	var unmarshaled RatingResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, 0.0, unmarshaled.Score)
	assert.Equal(t, uint(0), unmarshaled.FoodRecipeID)
}

func TestRatingsResponse_BaseListResponse(t *testing.T) {
	ratings := []RatingResponse{
		{
			Score:        4.5,
			FoodRecipeID: 1,
		},
		{
			Score:        3.8,
			FoodRecipeID: 2,
		},
		{
			Score:        5.0,
			FoodRecipeID: 3,
		},
	}

	response := RatingsResponse{
		Total:   3,
		Results: ratings,
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "\"total\":3")
	assert.Contains(t, string(jsonData), "4.5")
	assert.Contains(t, string(jsonData), "3.8")
	assert.Contains(t, string(jsonData), "5")

	var unmarshaled RatingsResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, int64(3), unmarshaled.Total)
	assert.Equal(t, 3, len(unmarshaled.Results))
	assert.Equal(t, 4.5, unmarshaled.Results[0].Score)
	assert.Equal(t, uint(1), unmarshaled.Results[0].FoodRecipeID)
}

func TestRatingsResponse_EmptyResults(t *testing.T) {
	response := RatingsResponse{
		Results: []RatingResponse{},
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	// Total should be omitted when zero due to omitempty tag
	assert.NotContains(t, string(jsonData), "total")

	var unmarshaled RatingsResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), unmarshaled.Total)
	assert.Equal(t, 0, len(unmarshaled.Results))
}

func TestRatingRequest_DifferentScores(t *testing.T) {
	scores := []float64{0.0, 1.0, 2.5, 3.7, 4.2, 5.0}

	for _, score := range scores {
		t.Run("Score "+string(rune(int(score*10))), func(t *testing.T) {
			request := RatingRequest{Score: score}

			jsonData, err := json.Marshal(request)
			assert.NoError(t, err)

			var unmarshaled RatingRequest
			err = json.Unmarshal(jsonData, &unmarshaled)
			assert.NoError(t, err)
			assert.Equal(t, score, unmarshaled.Score)
		})
	}
}

func TestRatingResponse_JSONStructure(t *testing.T) {
	response := RatingResponse{
		Score:        4.8,
		FoodRecipeID: 456,
	}

	jsonData, err := json.Marshal(response)
	assert.NoError(t, err)

	// Check required JSON fields
	assert.Contains(t, string(jsonData), "score")
	assert.Contains(t, string(jsonData), "foodRecipeID")
	assert.Contains(t, string(jsonData), "4.8")
	assert.Contains(t, string(jsonData), "456")
}
