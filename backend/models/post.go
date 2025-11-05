package models

import (
	"time"
)

// ToggleLikeResponse represents the response for the like toggle API
type ToggleLikeResponse struct {
	Liked bool `json:"liked"`
}

type Post struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index"`
	Caption   string    `gorm:"type:text"`
	MediaURL  string    `gorm:"not null"`
	Flagged   bool      `gorm:"default:false"` // NSFW content flag
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
