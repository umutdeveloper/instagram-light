package api

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/utils"
)

// UploadMedia handles POST /api/upload
func UploadMedia(c *fiber.Ctx) error {
	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file uploaded"})
	}

	uploadDir := utils.GetEnv("MEDIA_PATH", "tmp/uploads/")
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory"})
	}

	// Generate unique filename
	timestamp := time.Now().UnixNano()
	filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)
	filePath := filepath.Join(uploadDir, filename)

	// Save file
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Return the path to be used in MediaURL
	return c.JSON(fiber.Map{"media_url": filePath})
}
