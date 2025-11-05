package tests

import (
	"bytes"
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

func setupCommentWSApp() *fiber.App {
	// Set JWT secret for tests
	if os.Getenv("JWT_SECRET") == "" {
		os.Setenv("JWT_SECRET", "test-secret-key-12345")
	}

	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.DB.AutoMigrate(&models.Post{}, &models.Comment{})
	app := fiber.New()
	api.RegisterCommentRoutes(app)
	return app
}

func TestWSEventOnComment(t *testing.T) {
	app := setupCommentWSApp()
	api.RegisterWebSocketRoutes(app)

	postOwnerID := uint(1)
	post := models.Post{UserID: postOwnerID, Caption: "ws comment", MediaURL: "http://media/comment.jpg"}
	db.DB.Create(&post)

	// Start WebSocket server
	go app.Listen(":9996")
	defer app.Shutdown()
	time.Sleep(100 * time.Millisecond) // Give server time to start

	wsToken := helpers.GenerateJWT(postOwnerID, "postowner")
	dialer := websocket.Dialer{}
	headers := make(http.Header)
	headers.Set("Authorization", fmt.Sprintf("Bearer %s", wsToken))

	conn, resp, err := dialer.Dial("ws://localhost:9996/ws", headers)
	if err != nil {
		t.Fatalf("WebSocket connection failed: %v, resp: %+v", err, resp)
	}
	defer conn.Close()
	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode)

	commenterID := uint(2)
	commentToken := helpers.GenerateJWT(commenterID, "commenter")

	commentBody := map[string]string{"text": "Nice post!"}
	body, _ := json.Marshal(commentBody)
	commentReq := httptest.NewRequest("POST", fmt.Sprintf("/api/posts/%d/comments", post.ID), bytes.NewReader(body))
	commentReq.Header.Set("Content-Type", "application/json")
	commentReq.Header.Set("Authorization", "Bearer "+commentToken)
	respComment, _ := app.Test(commentReq)
	assert.Equal(t, 201, respComment.StatusCode)

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, msg, err := conn.ReadMessage()
	assert.NoError(t, err, "WebSocket no event received")

	var wsEvent models.WSEvent
	_ = json.Unmarshal(msg, &wsEvent)
	assert.Equal(t, "new_comment", wsEvent.Type)
	commentPayload, _ := json.Marshal(wsEvent.Payload)
	assert.True(t, strings.Contains(string(commentPayload), "Nice post!"))
}
