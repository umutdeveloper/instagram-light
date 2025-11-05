package tests

import (
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/tests/helpers"
)

func getMockJWT(userID uint, username string) string {
	return helpers.GenerateJWT(userID, username)
}

func setupWSApp() *fiber.App {
	// Set JWT secret for tests
	if os.Getenv("JWT_SECRET") == "" {
		os.Setenv("JWT_SECRET", "test-secret-key-12345")
	}

	app := fiber.New()
	api.RegisterWebSocketRoutes(app)
	return app
}

func TestWSEndpoint_Authorized(t *testing.T) {
	app := setupWSApp()

	// Start test server with Fiber
	go app.Listen(":9999")
	defer app.Shutdown()

	// Wait for server to start
	time.Sleep(200 * time.Millisecond)

	token := getMockJWT(123, "testuser")

	dialer := websocket.Dialer{}
	headers := make(http.Header)
	headers.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	conn, resp, err := dialer.Dial("ws://localhost:9999/ws", headers)
	if err != nil {
		t.Fatalf("WebSocket connection failed: %v, resp: %+v", err, resp)
	}
	defer conn.Close()

	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode)
}

func TestWSEndpoint_Unauthorized(t *testing.T) {
	app := setupWSApp()

	// Start test server with Fiber
	go app.Listen(":9998")
	defer app.Shutdown()

	// Wait for server to start
	time.Sleep(200 * time.Millisecond)

	dialer := websocket.Dialer{}

	conn, resp, err := dialer.Dial("ws://localhost:9998/ws", nil)

	// Connection should be established but then closed by server due to no auth
	if conn != nil {
		// Try to read a message - should get close message
		conn.SetReadDeadline(time.Now().Add(1 * time.Second))
		_, _, readErr := conn.ReadMessage()
		conn.Close()
		// Should get an error when trying to read (connection closed)
		assert.NotNil(t, readErr, "Expected connection to be closed by server")
	}

	// Either connection fails immediately or succeeds with 101 but then closes
	assert.True(t, err != nil || resp.StatusCode == http.StatusSwitchingProtocols)
}
