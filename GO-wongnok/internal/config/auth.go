package config

import (
	"context"
	"fmt"
	"strings"

	"github.com/coreos/go-oidc"
	"golang.org/x/oauth2"
)

type Keycloak struct {
	ClientID     string `env:"KEYCLOAK_CLIENT_ID"`
	ClientSecret string `env:"KEYCLOAK_CLIENT_SECRET"`
	RedirectURL  string `env:"KEYCLOAK_REDIRECT_URL"`
	Realm        string `env:"KEYCLOAK_REALM"`
	URL          string `env:"KEYCLOAK_URL"`
	ExternalURL  string `env:"KEYCLOAK_EXTERNAL_URL"`
}

func (kc Keycloak) RealmURL() string {
	return fmt.Sprintf("%s/realms/%s", kc.URL, kc.Realm)
}

func (kc Keycloak) LogoutURL() string {
	url := fmt.Sprintf("%s/protocol/openid-connect/logout", kc.RealmURL())
	found := strings.Contains(url, "host.docker.internal")

	if found {
		url = strings.Replace(url, "host.docker.internal", "localhost", 1)
	}
	return url
}

type IOAuth2Config interface {
	AuthCodeURL(state string, opts ...oauth2.AuthCodeOption) string
	Exchange(ctx context.Context, code string, opts ...oauth2.AuthCodeOption) (*oauth2.Token, error)
}

type IOIDCTokenVerifier interface {
	Verify(ctx context.Context, rawIDToken string) (*oidc.IDToken, error)
}

type IOIDCIDToken interface {
	Claims(v any) error
}
