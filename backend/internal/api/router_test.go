package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestGesundheitUndSchutz(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := NewRouter(nil, "test-geheimnis-mit-mindestens-32-zeichen")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/health", nil))
	if w.Code != http.StatusOK {
		t.Fatalf("/health: %d", w.Code)
	}

	// Geschützte Wege ohne Token: 401, die Datenbank wird nie gefragt.
	for _, weg := range []string{"/api/scrapbooks", "/api/auth/me", "/api/scrapbooks/1/pages"} {
		w := httptest.NewRecorder()
		r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, weg, nil))
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("%s ohne Token: %d", weg, w.Code)
		}
	}
}
