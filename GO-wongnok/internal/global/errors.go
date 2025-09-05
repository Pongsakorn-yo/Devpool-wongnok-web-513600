package global

import (
	"errors"
	"wongnok/internal/config"
)

var (
	ErrForbidden error = errors.New("forbidden")
)

var Verifier config.IOIDCTokenVerifier
