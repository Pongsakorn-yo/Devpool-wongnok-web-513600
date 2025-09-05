package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"
	"wongnok/internal/config"
	"wongnok/internal/model"
	"wongnok/internal/model/dto"

	"github.com/pkg/errors"
)

type IOAuth2Config config.IOAuth2Config
type IOIDCTokenVerifier config.IOIDCTokenVerifier
type IOIDCIDToken config.IOIDCIDToken

type IService interface {
	GenerateState() string
	AuthCodeURL(state string) string
	Exchange(ctx context.Context, code string) (model.Credential, error)
	VerifyToken(ctx context.Context, token string) (IOIDCIDToken, error)
	LogoutURL(logoutQuery dto.LogoutQuery) (string, error)
}

type Service struct {
	Keycloak     config.Keycloak
	OAuth2Config IOAuth2Config
	Verifier     IOIDCTokenVerifier
}

func NewService(kc config.Keycloak, oauth2Config IOAuth2Config, verifier IOIDCTokenVerifier) IService {
	return &Service{
		Keycloak:     kc,
		OAuth2Config: oauth2Config,
		Verifier:     verifier,
	}
}

func (service Service) GenerateState() string {
	buffer := make([]byte, 32)
	rand.Read(buffer)
	return base64.URLEncoding.EncodeToString(buffer)
}

func (service Service) AuthCodeURL(state string) string {
	authURL := service.OAuth2Config.AuthCodeURL(state)

	found := strings.Contains(authURL, "host.docker.internal")

	if found {
		// แทนที่ host.docker.internal ด้วย localhost สำหรับ browser
		authURL = strings.Replace(authURL, "host.docker.internal", "localhost", 1)
	}

	return authURL
}

func (service Service) Exchange(ctx context.Context, code string) (model.Credential, error) {
	token, err := service.OAuth2Config.Exchange(ctx, code)
	if err != nil {
		return model.Credential{}, errors.Wrap(err, "exchange token")
	}

	idToken, ok := token.Extra("id_token").(string)
	if !ok {
		return model.Credential{}, fmt.Errorf("id token is missing")
	}

	return model.Credential{
		Token:   token,
		IDToken: idToken,
	}, nil
}

func (service Service) VerifyToken(ctx context.Context, token string) (IOIDCIDToken, error) {
	// idToken, err := service.Verifier.Verify(ctx, token)
	// if err != nil {
	// 	return nil, errors.Wrap(err, "verify token")
	// }

	// return idToken, nil

	idToken, err := service.Verifier.Verify(ctx, token)
	if err != nil {
		// ถ้า error เกี่ยวกับ issuer mismatch ให้ข้าม error นี้
		if strings.Contains(err.Error(), "issued by a different provider") &&
			strings.Contains(err.Error(), "localhost") &&
			strings.Contains(err.Error(), "host.docker.internal") {

			// สร้าง custom verifier ที่ accept localhost issuer
			// หรือ skip issuer verification ชั่วคราว
			return service.Verifier.Verify(ctx, token) // ลองอีกครั้ง
		}
		return nil, errors.Wrap(err, "verify token")
	}
	return idToken, nil
}

func (service Service) LogoutURL(logoutQuery dto.LogoutQuery) (string, error) {
	uri, err := url.Parse(service.Keycloak.LogoutURL())
	if err != nil {
		return "", errors.Wrap(err, "parse logout url")
	}

	query := uri.Query()

	// Only add id_token_hint if it's not empty
	if logoutQuery.IDTokenHint != "" {
		query.Set("id_token_hint", logoutQuery.IDTokenHint)
	}

	// Only add post_logout_redirect_uri if it's not empty
	if logoutQuery.PostLogoutRedirectURI != "" {
		query.Set("post_logout_redirect_uri", logoutQuery.PostLogoutRedirectURI)
	}

	uri.RawQuery = query.Encode()

	return uri.String(), nil
}
