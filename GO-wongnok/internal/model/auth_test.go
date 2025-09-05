package model_test

import (
	"encoding/json"
	"testing"
	"time"

	"wongnok/internal/model"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"golang.org/x/oauth2"
)

func TestCredentialToResponse(t *testing.T) {
	t.Run("ShouldTransformCredentialToResponseWithAllFields", func(t *testing.T) {
		mockTime := time.Date(2023, 12, 25, 15, 30, 0, 0, time.UTC)

		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "access_token_123",
				TokenType:    "Bearer",
				RefreshToken: "refresh_token_456",
				Expiry:       mockTime,
			},
			IDToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
		}

		result := cred.ToResponse()

		// Test all fields are mapped correctly
		assert.Equal(t, "access_token_123", result.AccessToken)
		assert.Equal(t, "Bearer", result.TokenType)
		assert.Equal(t, "refresh_token_456", result.RefreshToken)
		assert.Equal(t, mockTime, result.Expiry)
		assert.Equal(t, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", result.IDToken)

		// Test that all required fields are present
		assert.NotEmpty(t, result.AccessToken)
		assert.NotEmpty(t, result.TokenType)
		assert.NotEmpty(t, result.RefreshToken)
		assert.NotZero(t, result.Expiry)
		assert.NotEmpty(t, result.IDToken)
	})

	t.Run("ShouldHandleEmptyTokenType", func(t *testing.T) {
		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "access_token",
				TokenType:    "", // Empty token type
				RefreshToken: "refresh_token",
				Expiry:       time.Now(),
			},
			IDToken: "id_token",
		}

		result := cred.ToResponse()

		assert.Equal(t, "", result.TokenType)
		assert.NotEmpty(t, result.AccessToken)
	})

	t.Run("ShouldHandleEmptyRefreshToken", func(t *testing.T) {
		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "access_token",
				TokenType:    "Bearer",
				RefreshToken: "", // Empty refresh token
				Expiry:       time.Now(),
			},
			IDToken: "id_token",
		}

		result := cred.ToResponse()

		assert.Equal(t, "", result.RefreshToken)
		assert.NotEmpty(t, result.AccessToken)
	})

	t.Run("ShouldHandleEmptyIDToken", func(t *testing.T) {
		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "access_token",
				TokenType:    "Bearer",
				RefreshToken: "refresh_token",
				Expiry:       time.Now(),
			},
			IDToken: "", // Empty ID token
		}

		result := cred.ToResponse()

		assert.Equal(t, "", result.IDToken)
		assert.NotEmpty(t, result.AccessToken)
	})

	t.Run("ShouldHandleZeroExpiryTime", func(t *testing.T) {
		var zeroTime time.Time

		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "access_token",
				TokenType:    "Bearer",
				RefreshToken: "refresh_token",
				Expiry:       zeroTime, // Zero time
			},
			IDToken: "id_token",
		}

		result := cred.ToResponse()

		assert.Equal(t, zeroTime, result.Expiry)
		assert.True(t, result.Expiry.IsZero())
	})

	t.Run("ShouldHandleExpiredToken", func(t *testing.T) {
		expiredTime := time.Now().Add(-1 * time.Hour) // 1 hour ago

		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "expired_access_token",
				TokenType:    "Bearer",
				RefreshToken: "refresh_token",
				Expiry:       expiredTime,
			},
			IDToken: "id_token",
		}

		result := cred.ToResponse()

		assert.Equal(t, expiredTime, result.Expiry)
		assert.True(t, result.Expiry.Before(time.Now()))
		assert.Equal(t, "expired_access_token", result.AccessToken)
	})

	t.Run("ShouldHandleFutureExpiryTime", func(t *testing.T) {
		futureTime := time.Now().Add(24 * time.Hour) // 24 hours from now

		cred := model.Credential{
			Token: &oauth2.Token{
				AccessToken:  "future_access_token",
				TokenType:    "Bearer",
				RefreshToken: "refresh_token",
				Expiry:       futureTime,
			},
			IDToken: "id_token",
		}

		result := cred.ToResponse()

		assert.Equal(t, futureTime, result.Expiry)
		assert.True(t, result.Expiry.After(time.Now()))
		assert.Equal(t, "future_access_token", result.AccessToken)
	})
}

func TestClaims(t *testing.T) {
	t.Run("ShouldCreateValidClaims", func(t *testing.T) {
		claims := model.Claims{
			ID:        "user123",
			FirstName: "John",
			LastName:  "Doe",
		}

		assert.Equal(t, "user123", claims.ID)
		assert.Equal(t, "John", claims.FirstName)
		assert.Equal(t, "Doe", claims.LastName)
	})

	t.Run("ShouldValidateRequiredFields", func(t *testing.T) {
		validate := validator.New()

		t.Run("ValidClaims", func(t *testing.T) {
			claims := model.Claims{
				ID:        "user123",
				FirstName: "John",
				LastName:  "Doe",
			}

			err := validate.Struct(claims)
			assert.NoError(t, err)
		})

		t.Run("MissingID", func(t *testing.T) {
			claims := model.Claims{
				ID:        "", // Missing required field
				FirstName: "John",
				LastName:  "Doe",
			}

			err := validate.Struct(claims)
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "ID")
		})

		t.Run("MissingFirstName", func(t *testing.T) {
			claims := model.Claims{
				ID:        "user123",
				FirstName: "", // Missing required field
				LastName:  "Doe",
			}

			err := validate.Struct(claims)
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "FirstName")
		})

		t.Run("MissingLastName", func(t *testing.T) {
			claims := model.Claims{
				ID:        "user123",
				FirstName: "John",
				LastName:  "", // Missing required field
			}

			err := validate.Struct(claims)
			assert.Error(t, err)
			assert.Contains(t, err.Error(), "LastName")
		})
	})

	t.Run("ShouldHandleJSONSerialization", func(t *testing.T) {
		claims := model.Claims{
			ID:        "user123",
			FirstName: "John",
			LastName:  "Doe",
		}

		// Test JSON marshaling
		jsonData, err := json.Marshal(claims)
		assert.NoError(t, err)

		expectedJSON := `{"sub":"user123","given_name":"John","family_name":"Doe"}`
		assert.JSONEq(t, expectedJSON, string(jsonData))

		// Test JSON unmarshaling
		var unmarshaled model.Claims
		err = json.Unmarshal(jsonData, &unmarshaled)
		assert.NoError(t, err)
		assert.Equal(t, claims, unmarshaled)
	})

	t.Run("ShouldHandleEmptyValues", func(t *testing.T) {
		claims := model.Claims{
			ID:        "",
			FirstName: "",
			LastName:  "",
		}

		assert.Equal(t, "", claims.ID)
		assert.Equal(t, "", claims.FirstName)
		assert.Equal(t, "", claims.LastName)
	})

	t.Run("ShouldHandleSpecialCharacters", func(t *testing.T) {
		claims := model.Claims{
			ID:        "user@example.com",
			FirstName: "José María",
			LastName:  "García-López",
		}

		assert.Equal(t, "user@example.com", claims.ID)
		assert.Equal(t, "José María", claims.FirstName)
		assert.Equal(t, "García-López", claims.LastName)

		// Test JSON handling with special characters
		jsonData, err := json.Marshal(claims)
		assert.NoError(t, err)

		var unmarshaled model.Claims
		err = json.Unmarshal(jsonData, &unmarshaled)
		assert.NoError(t, err)
		assert.Equal(t, claims, unmarshaled)
	})
}
