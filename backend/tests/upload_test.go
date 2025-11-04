package tests

import (
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/tests/helpers"
)

func setupUploadApp() *fiber.App {
	app := fiber.New()
	api.RegisterRoutes(app)
	return app
}

func TestUploadMedia(t *testing.T) {
	app := setupUploadApp()

	// Create a temporary file to upload
	tmpFile, err := os.CreateTemp("", "testfile-*.jpg")
	assert.NoError(t, err)
	defer os.Remove(tmpFile.Name())
	_, err = tmpFile.WriteString("fake image content")
	assert.NoError(t, err)
	tmpFile.Close()

	// Prepare multipart form
	body := &strings.Builder{}
	writer := multipart.NewWriter(body)
	fileWriter, err := writer.CreateFormFile("file", filepath.Base(tmpFile.Name()))
	assert.NoError(t, err)
	file, err := os.Open(tmpFile.Name())
	assert.NoError(t, err)
	defer file.Close()
	_, err = io.Copy(fileWriter, file)
	assert.NoError(t, err)
	writer.Close()

	token := helpers.GenerateJWT(1, "user1")
	req := httptest.NewRequest("POST", "/api/upload", strings.NewReader(body.String()))
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	// Check response body for media_url
	respBody, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)
	bodyStr := string(respBody)
	assert.Contains(t, bodyStr, "media_url")
	// Unmarshal and check the path is not empty
	type uploadResp struct {
		MediaURL string `json:"media_url"`
	}
	var ur uploadResp
	err = json.Unmarshal(respBody, &ur)
	assert.NoError(t, err)
	assert.NotEmpty(t, ur.MediaURL)
}
