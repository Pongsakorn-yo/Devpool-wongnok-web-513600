package dto

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCredentialResponse_JSONMarshaling(t *testing.T) {
	expiry := time.Now().Add(time.Hour)

	credential := CredentialResponse{
		AccessToken:  "test-access-token",
		TokenType:    "Bearer",
		RefreshToken: "test-refresh-token",
		Expiry:       expiry,
		ExpiresIn:    3600,
		IDToken:      "test-id-token",
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(credential)
	assert.NoError(t, err)
	assert.Contains(t, string(jsonData), "test-access-token")
	assert.Contains(t, string(jsonData), "Bearer")

	// Test JSON unmarshaling
	var unmarshaled CredentialResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, credential.AccessToken, unmarshaled.AccessToken)
	assert.Equal(t, credential.TokenType, unmarshaled.TokenType)
	assert.Equal(t, credential.RefreshToken, unmarshaled.RefreshToken)
	assert.Equal(t, credential.ExpiresIn, unmarshaled.ExpiresIn)
	assert.Equal(t, credential.IDToken, unmarshaled.IDToken)
}

func TestCredentialResponse_OmitEmptyFields(t *testing.T) {
	credential := CredentialResponse{
		AccessToken: "test-access-token",
		Expiry:      time.Now(),
		ExpiresIn:   3600,
		IDToken:     "test-id-token",
		// TokenType and RefreshToken are omitted
	}

	jsonData, err := json.Marshal(credential)
	assert.NoError(t, err)

	// TokenType should be omitted when empty
	assert.NotContains(t, string(jsonData), "tokenType")
	// RefreshToken should be omitted when empty
	assert.NotContains(t, string(jsonData), "refreshToken")
}

func TestKeycloakCallbackQuery_Validation(t *testing.T) {
	query := KeycloakCallbackQuery{
		State: "test-state",
		Code:  "test-code",
	}

	assert.Equal(t, "test-state", query.State)
	assert.Equal(t, "test-code", query.Code)
}

func TestLogoutQuery_Validation(t *testing.T) {
	query := LogoutQuery{
		IDTokenHint:           "test-id-token-hint",
		PostLogoutRedirectURI: "https://example.com/logout",
	}

	assert.Equal(t, "test-id-token-hint", query.IDTokenHint)
	assert.Equal(t, "https://example.com/logout", query.PostLogoutRedirectURI)
}

func TestCredentialResponse_EmptyStruct(t *testing.T) {
	var credential CredentialResponse

	jsonData, err := json.Marshal(credential)
	assert.NoError(t, err)

	var unmarshaled CredentialResponse
	err = json.Unmarshal(jsonData, &unmarshaled)
	assert.NoError(t, err)

	assert.Equal(t, credential, unmarshaled)
}
