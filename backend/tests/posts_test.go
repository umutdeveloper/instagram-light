package tests

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"github.com/umutdeveloper/instagram-light/backend/tests/helpers"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupPostApp() *fiber.App {
	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.DB.AutoMigrate(&models.Post{})
	app := fiber.New()
	api.RegisterPostRoutes(app)
	return app
}

func TestCreateAndGetPost(t *testing.T) {
	app := setupPostApp()
	postBody := models.Post{UserID: 1, Caption: "Hello World", MediaURL: "http://media.com/1.jpg"}
	body, _ := json.Marshal(postBody)
	token := helpers.GenerateJWT(1, "user1")
	req := httptest.NewRequest("POST", "/api/posts", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req)
	assert.Equal(t, 201, resp.StatusCode)
	var created models.Post
	json.NewDecoder(resp.Body).Decode(&created)
	assert.Equal(t, postBody.UserID, created.UserID)
	assert.Equal(t, postBody.Caption, created.Caption)
	assert.Equal(t, postBody.MediaURL, created.MediaURL)

	// Get all posts (paginated)
	reqGet := httptest.NewRequest("GET", "/api/posts", nil)
	reqGet.Header.Set("Authorization", "Bearer "+token)
	respGet, _ := app.Test(reqGet)
	assert.Equal(t, 200, respGet.StatusCode)
	var respBody struct {
		Page  int           `json:"page"`
		Limit int           `json:"limit"`
		Posts []models.Post `json:"posts"`
	}
	json.NewDecoder(respGet.Body).Decode(&respBody)
	assert.Len(t, respBody.Posts, 1)
	assert.Equal(t, created.ID, respBody.Posts[0].ID)

	// Get post by ID
	reqGetByID := httptest.NewRequest("GET", "/api/posts/1", nil)
	reqGetByID.Header.Set("Authorization", "Bearer "+token)
	respGetByID, _ := app.Test(reqGetByID)
	assert.Equal(t, 200, respGetByID.StatusCode)
	var got models.Post
	json.NewDecoder(respGetByID.Body).Decode(&got)
	assert.Equal(t, created.ID, got.ID)
	assert.Equal(t, created.Caption, got.Caption)
	assert.Equal(t, created.MediaURL, got.MediaURL)

	// Get post not found
	reqNF := httptest.NewRequest("GET", "/api/posts/999", nil)
	reqNF.Header.Set("Authorization", "Bearer "+token)
	respNF, _ := app.Test(reqNF)
	assert.Equal(t, 404, respNF.StatusCode)
}

func TestDeletePost(t *testing.T) {
	app := setupPostApp()
	post := models.Post{UserID: 2, Caption: "Delete Me", MediaURL: "http://media.com/2.jpg"}
	db.DB.Create(&post)
	token := helpers.GenerateJWT(2, "user2")

	// Delete post
	reqDel := httptest.NewRequest("DELETE", "/api/posts/1", nil)
	reqDel.Header.Set("Authorization", "Bearer "+token)
	respDel, _ := app.Test(reqDel)
	assert.Equal(t, 204, respDel.StatusCode)

	// Confirm deletion
	reqGet := httptest.NewRequest("GET", "/api/posts/1", nil)
	reqGet.Header.Set("Authorization", "Bearer "+token)
	respGet, _ := app.Test(reqGet)
	assert.Equal(t, 404, respGet.StatusCode)
}
