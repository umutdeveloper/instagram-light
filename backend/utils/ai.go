package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/umutdeveloper/instagram-light/backend/models"
)

// isAbsoluteURL checks if a URL is absolute (starts with http:// or https://)
func isAbsoluteURL(url string) bool {
	return strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://")
}

// ModerateImage calls the AI service to check for NSFW content
func ModerateImage(mediaURL string) (*models.AIServiceResponse, error) {
	aiServiceURL := GetEnv("AI_SERVICE_URL", "http://ai-service:8000")
	backendURL := GetEnv("BACKEND_URL", "http://backend:8080")

	// Convert relative path to absolute URL for AI service
	imageURL := mediaURL
	if !isAbsoluteURL(imageURL) {
		imageURL = backendURL + "/" + mediaURL
	}

	requestBody := map[string]string{
		"image_url": imageURL,
	}
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", aiServiceURL+"/moderate-image", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned status %d", resp.StatusCode)
	}

	var aiResponse models.AIServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&aiResponse); err != nil {
		return nil, fmt.Errorf("failed to decode AI response: %w", err)
	}

	return &aiResponse, nil
}
