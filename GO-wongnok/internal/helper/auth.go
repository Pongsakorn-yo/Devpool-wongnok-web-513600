package helper

import (
	"net/http"
	"strings"
	"wongnok/internal/config"
	"wongnok/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

func DecodeClaims(ctx *gin.Context) (model.Claims, error) {
	value, exists := ctx.Get("claims")
	if !exists {
		return model.Claims{}, errors.New(http.StatusText(http.StatusUnauthorized))
	}

	claims, ok := value.(model.Claims)
	if !ok {
		return model.Claims{}, errors.New(http.StatusText(http.StatusUnauthorized))
	}

	return claims, nil
}

func DecodeClaimsFromHeader(ctx *gin.Context, verifier config.IOIDCTokenVerifier) (model.Claims, error) {
	bearerPrefix := "Bearer "
	tokenWithBearer := ctx.GetHeader("Authorization")
	if !strings.HasPrefix(tokenWithBearer, bearerPrefix) {
		return model.Claims{}, http.ErrNoCookie
	}
	rawToken := strings.TrimPrefix(tokenWithBearer, bearerPrefix)
	idToken, err := verifier.Verify(ctx.Request.Context(), rawToken)
	if err != nil {
		return model.Claims{}, err
	}
	var claims model.Claims
	if err := idToken.Claims(&claims); err != nil {
		return model.Claims{}, err
	}
	return claims, nil
}
