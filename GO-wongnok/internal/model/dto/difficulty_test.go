package dto

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDifficultyResponse_JSONMarshaling(t *testing.T) {
	difficulty := DifficultyResponse{
		ID:   1,
		Name: "Easy",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(difficulty)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "Easy")
	assert.Contains(t, string(jsonData), "\"id\":1")

	// Test JSON unmarshaling
	var unmarshaled DifficultyResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, difficulty.ID, unmarshaled.ID)
	assert.Equal(t, difficulty.Name, unmarshaled.Name)
}

func TestDifficultyResponse_OmitEmptyName(t *testing.T) {
	difficulty := DifficultyResponse{
		ID: 2,
		// Name is empty
	}

	jsonData, err := json.Marshal(difficulty)
	assert.NoError(t, err)

	// Name should be omitted when empty due to omitempty tag
	assert.NotContains(t, string(jsonData), "name")
	assert.Contains(t, string(jsonData), "\"id\":2")
}

func TestDifficultyResponse_WithName(t *testing.T) {
	difficulty := DifficultyResponse{
		ID:   3,
		Name: "Hard",
	}

	jsonData, err := json.Marshal(difficulty)
	assert.NoError(t, err)

	// Name should be included when not empty
	assert.Contains(t, string(jsonData), "name")
	assert.Contains(t, string(jsonData), "Hard")
}

func TestDifficultyResponse_ValidDifficulties(t *testing.T) {
	testCases := []struct {
		name       string
		difficulty DifficultyResponse
		hasName    bool
	}{
		{
			name: "Easy difficulty with name",
			difficulty: DifficultyResponse{
				ID:   1,
				Name: "Easy",
			},
			hasName: true,
		},
		{
			name: "Medium difficulty with name",
			difficulty: DifficultyResponse{
				ID:   2,
				Name: "Medium",
			},
			hasName: true,
		},
		{
			name: "Hard difficulty with name",
			difficulty: DifficultyResponse{
				ID:   3,
				Name: "Hard",
			},
			hasName: true,
		},
		{
			name: "Difficulty without name",
			difficulty: DifficultyResponse{
				ID: 4,
			},
			hasName: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			jsonData, err := json.Marshal(tc.difficulty)
			assert.NoError(t, err)

			var unmarshaled DifficultyResponse
			err = json.Unmarshal(jsonData, &unmarshaled)
			assert.NoError(t, err)
			assert.Equal(t, tc.difficulty, unmarshaled)

			if tc.hasName {
				assert.Contains(t, string(jsonData), "name")
			} else {
				assert.NotContains(t, string(jsonData), "name")
			}
		})
	}
}

func TestDifficultyResponse_EmptyStruct(t *testing.T) {
	var difficulty DifficultyResponse

	jsonData, err := json.Marshal(difficulty)
	assert.NoError(t, err)

	var unmarshaled DifficultyResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, difficulty, unmarshaled)
	assert.Equal(t, uint(0), unmarshaled.ID)
	assert.Equal(t, "", unmarshaled.Name)
}

func TestDifficultyResponse_JSONStructure(t *testing.T) {
	difficulty := DifficultyResponse{
		ID:   1,
		Name: "Test Difficulty",
	}

	jsonData, err := json.Marshal(difficulty)
	assert.NoError(t, err)

	// Check required JSON fields
	assert.Contains(t, string(jsonData), "id")
	assert.Contains(t, string(jsonData), "name")
	assert.Contains(t, string(jsonData), "Test Difficulty")
}

func TestDifficultyResponse_DifferentLevels(t *testing.T) {
	difficulties := []DifficultyResponse{
		{ID: 1, Name: "Beginner"},
		{ID: 2, Name: "Intermediate"},
		{ID: 3, Name: "Advanced"},
		{ID: 4, Name: "Expert"},
	}

	for _, difficulty := range difficulties {
		jsonData, err := json.Marshal(difficulty)
		assert.NoError(t, err)

		var unmarshaled DifficultyResponse
		err = json.Unmarshal(jsonData, &unmarshaled)
		assert.NoError(t, err)
		assert.Equal(t, difficulty, unmarshaled)
	}
}
