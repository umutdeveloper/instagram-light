package tests

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
)

func TestHealthEndpoint(t *testing.T) {
	// Initialize Fiber app
	app := fiber.New()
	api.RegisterRoutes(app)

	// Create a new HTTP request to the /health endpoint
	req := httptest.NewRequest(http.MethodGet, "/health", nil)

	// Perform the request
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)

	// Check that the response body contains the expected JSON
	expectedBody := `{"status":"ok"}`
	assert.JSONEq(t, expectedBody, string(body))
}
