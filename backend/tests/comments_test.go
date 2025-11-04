package tests

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"github.com/umutdeveloper/instagram-light/backend/tests/helpers"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupCommentApp() *fiber.App {
	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.DB.AutoMigrate(&models.Comment{})
	app := fiber.New()
	api.RegisterCommentRoutes(app)
	return app
}

func TestCreateAndGetComment(t *testing.T) {
	app := setupCommentApp()
	token := helpers.GenerateJWT(1, "user1")
	commentBody := map[string]string{"text": "Nice post!"}
	body, _ := json.Marshal(commentBody)

	// Create comment
	req := httptest.NewRequest("POST", "/api/posts/1/comments", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req)
	assert.Equal(t, 201, resp.StatusCode)
	var created models.Comment
	json.NewDecoder(resp.Body).Decode(&created)
	assert.Equal(t, int64(1), created.PostID)
	assert.Equal(t, "Nice post!", created.Text)
	assert.Equal(t, int64(1), created.UserID)
	assert.WithinDuration(t, time.Now(), created.CreatedAt, time.Second*5)

	// Get comments
	reqGet := httptest.NewRequest("GET", "/api/posts/1/comments", nil)
	reqGet.Header.Set("Authorization", "Bearer "+token)
	respGet, _ := app.Test(reqGet)
	assert.Equal(t, 200, respGet.StatusCode)
	var comments []models.Comment
	json.NewDecoder(respGet.Body).Decode(&comments)
	assert.Len(t, comments, 1)
	assert.Equal(t, created.ID, comments[0].ID)
	assert.Equal(t, created.Text, comments[0].Text)
}

func TestDeleteComment(t *testing.T) {
	app := setupCommentApp()
	// User 1 creates a comment
	token1 := helpers.GenerateJWT(1, "user1")
	commentBody := map[string]string{"text": "To be deleted"}
	body, _ := json.Marshal(commentBody)
	req := httptest.NewRequest("POST", "/api/posts/1/comments", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token1)
	resp, _ := app.Test(req)
	assert.Equal(t, 201, resp.StatusCode)
	var created models.Comment
	json.NewDecoder(resp.Body).Decode(&created)

	// User 1 deletes their own comment
	delReq := httptest.NewRequest("DELETE", "/api/posts/1/comments/"+strconv.FormatInt(created.ID, 10), nil)
	delReq.Header.Set("Authorization", "Bearer "+token1)
	delResp, _ := app.Test(delReq)
	assert.Equal(t, 204, delResp.StatusCode)

	// Confirm comment is deleted
	getReq := httptest.NewRequest("GET", "/api/posts/1/comments", nil)
	getReq.Header.Set("Authorization", "Bearer "+token1)
	getResp, _ := app.Test(getReq)
	assert.Equal(t, 200, getResp.StatusCode)
	var comments []models.Comment
	json.NewDecoder(getResp.Body).Decode(&comments)
	assert.Len(t, comments, 0)

	// User 2 tries to delete a comment they don't own
	// First, create a new comment as user 1
	req2 := httptest.NewRequest("POST", "/api/posts/1/comments", bytes.NewReader(body))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Authorization", "Bearer "+token1)
	resp2, _ := app.Test(req2)
	var created2 models.Comment
	json.NewDecoder(resp2.Body).Decode(&created2)
	token2 := helpers.GenerateJWT(2, "user2")
	delReq2 := httptest.NewRequest("DELETE", "/api/posts/1/comments/"+strconv.FormatInt(created2.ID, 10), nil)
	delReq2.Header.Set("Authorization", "Bearer "+token2)
	delResp2, _ := app.Test(delReq2)
	assert.Equal(t, 403, delResp2.StatusCode)

	// Try to delete a non-existent comment
	delReq3 := httptest.NewRequest("DELETE", "/api/posts/1/comments/9999", nil)
	delReq3.Header.Set("Authorization", "Bearer "+token1)
	delResp3, _ := app.Test(delReq3)
	assert.Equal(t, 404, delResp3.StatusCode)
}
