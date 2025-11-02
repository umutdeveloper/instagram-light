package tests

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupApp() *fiber.App {
	os.Setenv("JWT_SECRET", "testsecret")
	db.DB, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.DB.AutoMigrate(&api.User{})
	app := fiber.New()
	api.RegisterAuthRoutes(app)
	return app
}

func TestRegister(t *testing.T) {
	app := setupApp()
	body := map[string]string{"username": "testuser", "password": "testpass"}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/api/auth/register", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)
}

func TestRegisterDuplicate(t *testing.T) {
	app := setupApp()
	body := map[string]string{"username": "testuser", "password": "testpass"}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/api/auth/register", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	app.Test(req)
	resp, _ := app.Test(req)
	assert.Equal(t, 400, resp.StatusCode)
}

func TestLoginSuccess(t *testing.T) {
	app := setupApp()
	regBody := map[string]string{"username": "testuser", "password": "testpass"}
	jsonReg, _ := json.Marshal(regBody)
	regReq := httptest.NewRequest("POST", "/api/auth/register", bytes.NewReader(jsonReg))
	regReq.Header.Set("Content-Type", "application/json")
	app.Test(regReq)
	loginBody := map[string]string{"username": "testuser", "password": "testpass"}
	jsonLogin, _ := json.Marshal(loginBody)
	loginReq := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(jsonLogin))
	loginReq.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(loginReq)
	assert.Equal(t, 200, resp.StatusCode)
	var respBody map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&respBody)
	assert.NotEmpty(t, respBody["token"])
}

func TestLoginFail(t *testing.T) {
	app := setupApp()
	loginBody := map[string]string{"username": "nouser", "password": "badpass"}
	jsonLogin, _ := json.Marshal(loginBody)
	loginReq := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(jsonLogin))
	loginReq.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(loginReq)
	assert.Equal(t, 401, resp.StatusCode)
}
