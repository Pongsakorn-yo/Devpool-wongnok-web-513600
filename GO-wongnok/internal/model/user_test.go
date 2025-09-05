package model_test

import (
	"testing"
	"time"

	"wongnok/internal/model"
	"wongnok/internal/model/dto"

	"github.com/stretchr/testify/assert"
)

func TestUserFromClaims(t *testing.T) {
	t.Run("ShouldCreateUserFromClaims", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2023, 1, 2, 10, 0, 0, 0, time.UTC)
		deletedAt := time.Date(2023, 1, 3, 10, 0, 0, 0, time.UTC)

		user := model.User{
			ID:        "original_id",
			FirstName: "Original",
			LastName:  "User",
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: &deletedAt,
		}

		claims := model.Claims{
			ID:        "new_user_id",
			FirstName: "John",
			LastName:  "Doe",
		}

		result := user.FromClaims(claims)

		// Test that claims data is mapped
		assert.Equal(t, claims.ID, result.ID)
		assert.Equal(t, claims.FirstName, result.FirstName)
		assert.Equal(t, claims.LastName, result.LastName)

		// Test that timestamp fields are preserved
		assert.Equal(t, createdAt, result.CreatedAt)
		assert.Equal(t, updatedAt, result.UpdatedAt)
		assert.Equal(t, &deletedAt, result.DeletedAt)
	})

	t.Run("ShouldHandleEmptyOriginalUser", func(t *testing.T) {
		user := model.User{} // Empty user

		claims := model.Claims{
			ID:        "user123",
			FirstName: "Jane",
			LastName:  "Smith",
		}

		result := user.FromClaims(claims)

		// Test that claims data is mapped
		assert.Equal(t, claims.ID, result.ID)
		assert.Equal(t, claims.FirstName, result.FirstName)
		assert.Equal(t, claims.LastName, result.LastName)

		// Test that empty timestamps are preserved
		assert.True(t, result.CreatedAt.IsZero())
		assert.True(t, result.UpdatedAt.IsZero())
		assert.Nil(t, result.DeletedAt)
	})

	t.Run("ShouldHandleEmptyClaims", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2023, 1, 2, 10, 0, 0, 0, time.UTC)

		user := model.User{
			ID:        "existing_id",
			FirstName: "Existing",
			LastName:  "User",
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: nil,
		}

		claims := model.Claims{
			ID:        "",
			FirstName: "",
			LastName:  "",
		}

		result := user.FromClaims(claims)

		// Test that empty claims are mapped
		assert.Equal(t, "", result.ID)
		assert.Equal(t, "", result.FirstName)
		assert.Equal(t, "", result.LastName)

		// Test that timestamps are preserved
		assert.Equal(t, createdAt, result.CreatedAt)
		assert.Equal(t, updatedAt, result.UpdatedAt)
		assert.Nil(t, result.DeletedAt)
	})

	t.Run("ShouldHandleSpecialCharacters", func(t *testing.T) {
		user := model.User{}

		claims := model.Claims{
			ID:        "user@example.com",
			FirstName: "José María",
			LastName:  "García-López",
		}

		result := user.FromClaims(claims)

		assert.Equal(t, "user@example.com", result.ID)
		assert.Equal(t, "José María", result.FirstName)
		assert.Equal(t, "García-López", result.LastName)
	})

	t.Run("ShouldHandleNilDeletedAt", func(t *testing.T) {
		user := model.User{
			ID:        "existing_id",
			DeletedAt: nil, // Explicitly nil
		}

		claims := model.Claims{
			ID:        "new_id",
			FirstName: "New",
			LastName:  "User",
		}

		result := user.FromClaims(claims)

		assert.Equal(t, claims.ID, result.ID)
		assert.Nil(t, result.DeletedAt)
	})
}

func TestUserToResponse(t *testing.T) {
	t.Run("ShouldTransformUserToResponse", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2023, 1, 2, 10, 0, 0, 0, time.UTC)
		deletedAt := time.Date(2023, 1, 3, 10, 0, 0, 0, time.UTC)

		user := model.User{
			ID:        "user123",
			FirstName: "John",
			LastName:  "Doe",
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: &deletedAt,
		}

		result := user.ToResponse()

		// Test that only public fields are included
		assert.Equal(t, "user123", result.ID)
		assert.Equal(t, "John", result.FirstName)
		assert.Equal(t, "Doe", result.LastName)

		// Verify that response struct has expected type
		expectedResponse := dto.UserResponse{
			ID:        "user123",
			FirstName: "John",
			LastName:  "Doe",
		}
		assert.Equal(t, expectedResponse, result)
	})

	t.Run("ShouldHandleEmptyUser", func(t *testing.T) {
		user := model.User{
			ID:        "",
			FirstName: "",
			LastName:  "",
		}

		result := user.ToResponse()

		assert.Equal(t, "", result.ID)
		assert.Equal(t, "", result.FirstName)
		assert.Equal(t, "", result.LastName)
	})

	t.Run("ShouldHandleSpecialCharacters", func(t *testing.T) {
		user := model.User{
			ID:        "user@example.com",
			FirstName: "José María",
			LastName:  "García-López O'Connor",
		}

		result := user.ToResponse()

		assert.Equal(t, "user@example.com", result.ID)
		assert.Equal(t, "José María", result.FirstName)
		assert.Equal(t, "García-López O'Connor", result.LastName)
	})

	t.Run("ShouldNotIncludeTimestampsInResponse", func(t *testing.T) {
		createdAt := time.Date(2023, 1, 1, 10, 0, 0, 0, time.UTC)
		updatedAt := time.Date(2023, 1, 2, 10, 0, 0, 0, time.UTC)
		deletedAt := time.Date(2023, 1, 3, 10, 0, 0, 0, time.UTC)

		user := model.User{
			ID:        "user123",
			FirstName: "John",
			LastName:  "Doe",
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			DeletedAt: &deletedAt,
		}

		result := user.ToResponse()

		// Test that timestamps are not exposed in response
		assert.Equal(t, "user123", result.ID)
		assert.Equal(t, "John", result.FirstName)
		assert.Equal(t, "Doe", result.LastName)

		// Verify response structure doesn't contain timestamps
		// (this is implicit by the type system)
	})

	t.Run("ShouldHandleLongNames", func(t *testing.T) {
		longFirstName := "Wolfeschlegelsteinhausenbergerdorff"
		longLastName := "Adolph Blaine Charles David Earl Frederick Gerald Hubert Irvin John Kenneth Lloyd Martin Nero Oliver Paul Quincy Randolph Sherman Thomas Uncas Victor William Xerxes Yancy Zeus"

		user := model.User{
			ID:        "user_with_long_name",
			FirstName: longFirstName,
			LastName:  longLastName,
		}

		result := user.ToResponse()

		assert.Equal(t, "user_with_long_name", result.ID)
		assert.Equal(t, longFirstName, result.FirstName)
		assert.Equal(t, longLastName, result.LastName)
	})

	t.Run("ShouldHandleOnlyFirstName", func(t *testing.T) {
		user := model.User{
			ID:        "user456",
			FirstName: "Madonna",
			LastName:  "", // Empty last name
		}

		result := user.ToResponse()

		assert.Equal(t, "user456", result.ID)
		assert.Equal(t, "Madonna", result.FirstName)
		assert.Equal(t, "", result.LastName)
	})

	t.Run("ShouldHandleOnlyLastName", func(t *testing.T) {
		user := model.User{
			ID:        "user789",
			FirstName: "", // Empty first name
			LastName:  "Cher",
		}

		result := user.ToResponse()

		assert.Equal(t, "user789", result.ID)
		assert.Equal(t, "", result.FirstName)
		assert.Equal(t, "Cher", result.LastName)
	})
}
