package dto

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCookingDurationResponse_JSONMarshaling(t *testing.T) {
	duration := CookingDurationResponse{
		ID:   1,
		Name: "Quick (15 min)",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(duration)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "Quick (15 min)")
	assert.Contains(t, string(jsonData), "\"id\":1")

	// Test JSON unmarshaling
	var unmarshaled CookingDurationResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, duration.ID, unmarshaled.ID)
	assert.Equal(t, duration.Name, unmarshaled.Name)
}

func TestCookingDurationResponse_OmitEmptyName(t *testing.T) {
	duration := CookingDurationResponse{
		ID: 2,
		// Name is empty
	}

	jsonData, err := json.Marshal(duration)
	assert.NoError(t, err)

	// Name should be omitted when empty due to omitempty tag
	assert.NotContains(t, string(jsonData), "name")
	assert.Contains(t, string(jsonData), "\"id\":2")
}

func TestCookingDurationResponse_WithName(t *testing.T) {
	duration := CookingDurationResponse{
		ID:   3,
		Name: "Medium (30 min)",
	}

	jsonData, err := json.Marshal(duration)
	assert.NoError(t, err)

	// Name should be included when not empty
	assert.Contains(t, string(jsonData), "name")
	assert.Contains(t, string(jsonData), "Medium (30 min)")
}

func TestCookingDurationResponse_ValidDurations(t *testing.T) {
	testCases := []struct {
		name     string
		duration CookingDurationResponse
		hasName  bool
	}{
		{
			name: "Quick duration with name",
			duration: CookingDurationResponse{
				ID:   1,
				Name: "Quick (15 min)",
			},
			hasName: true,
		},
		{
			name: "Medium duration with name",
			duration: CookingDurationResponse{
				ID:   2,
				Name: "Medium (30 min)",
			},
			hasName: true,
		},
		{
			name: "Long duration with name",
			duration: CookingDurationResponse{
				ID:   3,
				Name: "Long (60+ min)",
			},
			hasName: true,
		},
		{
			name: "Duration without name",
			duration: CookingDurationResponse{
				ID: 4,
			},
			hasName: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			jsonData, err := json.Marshal(tc.duration)
			assert.NoError(t, err)

			var unmarshaled CookingDurationResponse
			err = json.Unmarshal(jsonData, &unmarshaled)
			assert.NoError(t, err)
			assert.Equal(t, tc.duration, unmarshaled)

			if tc.hasName {
				assert.Contains(t, string(jsonData), "name")
			} else {
				assert.NotContains(t, string(jsonData), "name")
			}
		})
	}
}

func TestCookingDurationResponse_EmptyStruct(t *testing.T) {
	var duration CookingDurationResponse

	jsonData, err := json.Marshal(duration)
	assert.NoError(t, err)

	var unmarshaled CookingDurationResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, duration, unmarshaled)
	assert.Equal(t, uint(0), unmarshaled.ID)
	assert.Equal(t, "", unmarshaled.Name)
}

func TestCookingDurationResponse_JSONStructure(t *testing.T) {
	duration := CookingDurationResponse{
		ID:   1,
		Name: "Test Duration",
	}

	jsonData, err := json.Marshal(duration)
	assert.NoError(t, err)

	// Check required JSON fields
	assert.Contains(t, string(jsonData), "id")
	assert.Contains(t, string(jsonData), "name")
	assert.Contains(t, string(jsonData), "Test Duration")
}
