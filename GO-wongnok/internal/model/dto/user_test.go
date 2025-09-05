package dto

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUserResponse_JSONMarshaling(t *testing.T) {
	user := UserResponse{
		ID:        "user-123",
		FirstName: "John",
		LastName:  "Doe",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(user)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "user-123")
	assert.Contains(t, string(jsonData), "John")
	assert.Contains(t, string(jsonData), "Doe")

	// Test JSON unmarshaling
	var unmarshaled UserResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, unmarshaled.ID)
	assert.Equal(t, user.FirstName, unmarshaled.FirstName)
	assert.Equal(t, user.LastName, unmarshaled.LastName)
}

func TestUserResponse_EmptyFields(t *testing.T) {
	user := UserResponse{
		ID: "user-123",
		// FirstName and LastName are empty
	}

	jsonData, err := json.Marshal(user)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "user-123")
	assert.Contains(t, string(jsonData), "firstName")
	assert.Contains(t, string(jsonData), "lastName")

	var unmarshaled UserResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, "user-123", unmarshaled.ID)
	assert.Equal(t, "", unmarshaled.FirstName)
	assert.Equal(t, "", unmarshaled.LastName)
}

func TestUserResponse_AllEmptyFields(t *testing.T) {
	var user UserResponse

	jsonData, err := json.Marshal(user)
	assert.NoError(t, err)

	var unmarshaled UserResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, user, unmarshaled)
}

func TestUserResponse_ValidUserData(t *testing.T) {
	testCases := []struct {
		name      string
		user      UserResponse
		expectErr bool
	}{
		{
			name: "Valid user with all fields",
			user: UserResponse{
				ID:        "user-001",
				FirstName: "Jane",
				LastName:  "Smith",
			},
			expectErr: false,
		},
		{
			name: "Valid user with ID only",
			user: UserResponse{
				ID: "user-002",
			},
			expectErr: false,
		},
		{
			name: "Valid user with special characters",
			user: UserResponse{
				ID:        "user-@#$",
				FirstName: "José",
				LastName:  "García-López",
			},
			expectErr: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			jsonData, err := json.Marshal(tc.user)
			if tc.expectErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)

			var unmarshaled UserResponse
			err = json.Unmarshal(jsonData, &unmarshaled)
			assert.NoError(t, err)
			assert.Equal(t, tc.user, unmarshaled)
		})
	}
}

func TestUserResponse_JSONStructure(t *testing.T) {
	user := UserResponse{
		ID:        "test-id",
		FirstName: "Test",
		LastName:  "User",
	}

	jsonData, err := json.Marshal(user)
	assert.NoError(t, err)

	expectedFields := []string{"id", "firstName", "lastName"}
	for _, field := range expectedFields {
		assert.Contains(t, string(jsonData), field)
	}
}
