package tests

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupFeedApp() *fiber.App {
	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.DB.AutoMigrate(&models.User{}, &models.Post{}, &models.Follow{})
	app := fiber.New()
	api.RegisterFeedRoutes(app)
	return app
}

func TestFeedPaginationAndFanOut(t *testing.T) {
	app := setupFeedApp()

	// Create users
	user1 := models.User{Username: "user1", Password: "pass1"}
	user2 := models.User{Username: "user2", Password: "pass2"}
	user3 := models.User{Username: "user3", Password: "pass3"}
	db.DB.Create(&user1)
	db.DB.Create(&user2)
	db.DB.Create(&user3)

	// user1 follows user2 and user3
	follow2 := models.Follow{FollowerID: user1.ID, FollowingID: user2.ID}
	follow3 := models.Follow{FollowerID: user1.ID, FollowingID: user3.ID}
	db.DB.Create(&follow2)
	db.DB.Create(&follow3)

	// Create posts for all users
	for i := 1; i <= 30; i++ {
		uid := user1.ID
		switch i % 3 {
		case 2:
			uid = user2.ID
		case 0:
			uid = user3.ID
		}
		post := models.Post{UserID: uid, Caption: "Post " + string(rune(i)), MediaURL: "http://media.com/" + string(rune(i)) + ".jpg"}
		db.DB.Create(&post)
	}

	// Get feed for user1, page 1, limit 10
	req := httptest.NewRequest("GET", "/api/feed?user_id=1&page=1&limit=10", nil)
	resp, _ := app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)
	var respBody struct {
		Page  int `json:"page"`
		Limit int `json:"limit"`
		Posts []struct {
			ID         uint   `json:"id"`
			UserID     uint   `json:"user_id"`
			Caption    string `json:"caption"`
			MediaURL   string `json:"media_url"`
			CreatedAt  string `json:"created_at"`
			LikesCount int    `json:"likes_count"`
		} `json:"posts"`
	}
	json.NewDecoder(resp.Body).Decode(&respBody)
	assert.Equal(t, 1, respBody.Page)
	assert.Equal(t, 10, respBody.Limit)
	assert.Len(t, respBody.Posts, 10)

	// Get feed for user1, page 2, limit 10
	req2 := httptest.NewRequest("GET", "/api/feed?user_id=1&page=2&limit=10", nil)
	resp2, _ := app.Test(req2)
	assert.Equal(t, 200, resp2.StatusCode)
	var respBody2 struct {
		Page  int `json:"page"`
		Limit int `json:"limit"`
		Posts []struct {
			ID         uint   `json:"id"`
			UserID     uint   `json:"user_id"`
			Caption    string `json:"caption"`
			MediaURL   string `json:"media_url"`
			CreatedAt  string `json:"created_at"`
			LikesCount int    `json:"likes_count"`
		} `json:"posts"`
	}
	json.NewDecoder(resp2.Body).Decode(&respBody2)
	assert.Equal(t, 2, respBody2.Page)
	assert.Equal(t, 10, respBody2.Limit)
	assert.Len(t, respBody2.Posts, 10)

	// Get feed for user1, page 4, limit 10 (should be empty)
	req3 := httptest.NewRequest("GET", "/api/feed?user_id=1&page=4&limit=10", nil)
	resp3, _ := app.Test(req3)
	assert.Equal(t, 200, resp3.StatusCode)
	var respBody3 struct {
		Page  int `json:"page"`
		Limit int `json:"limit"`
		Posts []struct {
			ID         uint   `json:"id"`
			UserID     uint   `json:"user_id"`
			Caption    string `json:"caption"`
			MediaURL   string `json:"media_url"`
			CreatedAt  string `json:"created_at"`
			LikesCount int    `json:"likes_count"`
		} `json:"posts"`
	}
	json.NewDecoder(resp3.Body).Decode(&respBody3)
	assert.Equal(t, 4, respBody3.Page)
	assert.Equal(t, 10, respBody3.Limit)
	assert.Len(t, respBody3.Posts, 0)
}
