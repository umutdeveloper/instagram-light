package tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"github.com/umutdeveloper/instagram-light/backend/tests/helpers"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupPostWSApp() *fiber.App {
	// Set JWT secret for tests
	if os.Getenv("JWT_SECRET") == "" {
		os.Setenv("JWT_SECRET", "test-secret-key-12345")
	}

	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.DB.AutoMigrate(&models.Post{}, &models.Like{})
	app := fiber.New()
	api.RegisterPostRoutes(app)
	return app
}

func TestWSEventOnLike(t *testing.T) {
	app := setupPostWSApp()
	api.RegisterWebSocketRoutes(app)

	postOwner := models.Post{UserID: 1, Caption: "ws like", MediaURL: "http://media/like.jpg"}
	db.DB.Create(&postOwner)

	// Start WebSocket server
	go app.Listen(":9997")
	defer app.Shutdown()
	time.Sleep(100 * time.Millisecond) // Give server time to start

	wsToken := helpers.GenerateJWT(postOwner.UserID, "postowner")
	dialer := websocket.Dialer{}
	headers := make(http.Header)
	headers.Set("Authorization", fmt.Sprintf("Bearer %s", wsToken))

	conn, resp, err := dialer.Dial("ws://localhost:9997/ws", headers)
	if err != nil {
		t.Fatalf("WebSocket connection failed: %v, resp: %+v", err, resp)
	}
	defer conn.Close()
	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode)

	likerID := uint(2)
	likeToken := helpers.GenerateJWT(likerID, "liker")

	reqLike := httptest.NewRequest("POST", fmt.Sprintf("/api/posts/%d/like", postOwner.ID), nil)
	reqLike.Header.Set("Authorization", "Bearer "+likeToken)
	respLike, _ := app.Test(reqLike)
	assert.Equal(t, 200, respLike.StatusCode)

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := conn.ReadMessage()
	assert.NoError(t, err, "WebSocket no event received")

	var wsEvent models.WSEvent
	_ = json.Unmarshal(msg, &wsEvent)
	assert.Equal(t, "new_like", wsEvent.Type)
	likePayload, _ := json.Marshal(wsEvent.Payload)
	assert.True(t, strings.Contains(string(likePayload), fmt.Sprintf("\"PostID\":%d", postOwner.ID)))
}
