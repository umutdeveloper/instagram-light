package api

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"github.com/umutdeveloper/instagram-light/backend/utils"
)

// UploadMedia handles POST /api/upload
// @Summary Upload media file
// @Description Uploads a media file and returns its storage path
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Media file to upload"
// @Success 200 {object} models.UploadResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/upload [post]
func UploadMedia(c *fiber.Ctx) error {
	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{Error: "No file uploaded"})
	}

	uploadDir := utils.GetEnv("MEDIA_PATH", "tmp/uploads/")
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{Error: "Failed to create upload directory"})
	}

	// Generate unique, sanitized filename
	timestamp := time.Now().UnixNano()
	originalName := file.Filename
	ext := ""
	if dot := len(originalName) - len(filepath.Ext(originalName)); dot > 0 {
		ext = filepath.Ext(originalName)
	}
	// Remove spaces and non-alphanumeric (except dot, dash, underscore) from base name
	base := originalName[:len(originalName)-len(ext)]
	baseSanitized := ""
	for _, r := range base {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			baseSanitized += string(r)
		}
	}
	if baseSanitized == "" {
		baseSanitized = "file"
	}
	uniqueName := fmt.Sprintf("%d_%s%s", timestamp, baseSanitized, ext)
	filePath := filepath.Join(uploadDir, uniqueName)

	// Save file
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{Error: "Failed to save file"})
	}

	// Return the path to be used in MediaURL
	return c.JSON(models.UploadResponse{MediaURL: filePath})
}
