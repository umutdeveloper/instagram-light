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

func clearTables() {
	db.DB.AutoMigrate(&models.User{}, &models.Follow{})
	db.DB.Exec("DELETE FROM follows")
	db.DB.Exec("DELETE FROM users")
}

func setupUserApp() *fiber.App {
	db.DB.AutoMigrate(&models.User{}, &models.Follow{})
	app := fiber.New()
	api.RegisterUserRoutes(app)
	return app
}

func setupUserFollowData() {
	user1 := models.User{Username: "alice", Email: "alice@example.com", Password: "pass1"}
	db.DB.Create(&user1)
	user2 := models.User{Username: "bob", Email: "bob@example.com", Password: "pass2"}
	db.DB.Create(&user2)
	user3 := models.User{Username: "carol", Email: "carol@example.com", Password: "pass3"}
	db.DB.Create(&user3)

	follow1 := models.Follow{FollowerID: 2, FollowingID: 1} // bob follows alice
	follow2 := models.Follow{FollowerID: 3, FollowingID: 1} // carol follows alice
	follow3 := models.Follow{FollowerID: 1, FollowingID: 2} // alice follows bob
	db.DB.Create(&follow1)
	db.DB.Create(&follow2)
	db.DB.Create(&follow3)
}

func TestGetUserByID(t *testing.T) {
	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	clearTables()
	app := setupUserApp()
	// Create a user
	user := models.User{Username: "testuser", Email: "test@example.com", Password: "secret"}
	db.DB.Create(&user)

	// Test valid user
	req := httptest.NewRequest("GET", "/api/users/1", nil)
	resp, _ := app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)
	var got models.User
	json.NewDecoder(resp.Body).Decode(&got)
	assert.Equal(t, "testuser", got.Username)
	assert.Equal(t, "test@example.com", got.Email)
	assert.Equal(t, "", got.Password) // Password should be hidden

	// Test user not found
	reqNF := httptest.NewRequest("GET", "/api/users/999", nil)
	respNF, _ := app.Test(reqNF)
	assert.Equal(t, 404, respNF.StatusCode)
}

func TestGetFollowersAndFollowing(t *testing.T) {
	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	clearTables()
	app := setupUserApp()
	setupUserFollowData()

	// Test followers of alice (id=1)
	reqFollowers := httptest.NewRequest("GET", "/api/users/1/followers", nil)
	respFollowers, _ := app.Test(reqFollowers)
	assert.Equal(t, 200, respFollowers.StatusCode)
	var followers []models.User
	json.NewDecoder(respFollowers.Body).Decode(&followers)
	assert.Len(t, followers, 2)
	usernames := []string{followers[0].Username, followers[1].Username}
	assert.Contains(t, usernames, "bob")
	assert.Contains(t, usernames, "carol")
	for _, u := range followers {
		assert.Equal(t, "", u.Password)
	}

	// Test following of alice (id=1)
	reqFollowing := httptest.NewRequest("GET", "/api/users/1/following", nil)
	respFollowing, _ := app.Test(reqFollowing)
	assert.Equal(t, 200, respFollowing.StatusCode)
	var following []models.User
	json.NewDecoder(respFollowing.Body).Decode(&following)
	assert.Len(t, following, 1)
	assert.Equal(t, "bob", following[0].Username)
	assert.Equal(t, "", following[0].Password)

	// Test followers of bob (id=2)
	reqFollowersBob := httptest.NewRequest("GET", "/api/users/2/followers", nil)
	respFollowersBob, _ := app.Test(reqFollowersBob)
	assert.Equal(t, 200, respFollowersBob.StatusCode)
	var followersBob []models.User
	json.NewDecoder(respFollowersBob.Body).Decode(&followersBob)
	assert.Len(t, followersBob, 1)
	assert.Equal(t, "alice", followersBob[0].Username)

	// Test following of bob (id=2)
	reqFollowingBob := httptest.NewRequest("GET", "/api/users/2/following", nil)
	respFollowingBob, _ := app.Test(reqFollowingBob)
	assert.Equal(t, 200, respFollowingBob.StatusCode)
	var followingBob []models.User
	json.NewDecoder(respFollowingBob.Body).Decode(&followingBob)
	assert.Len(t, followingBob, 1)
}
