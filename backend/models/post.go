package models

import (
	"time"
)

// ToggleLikeResponse represents the response for the like toggle API
type ToggleLikeResponse struct {
	Liked bool `json:"liked"`
}

type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Caption   string    `gorm:"type:text" json:"caption"`
	MediaURL  string    `gorm:"not null" json:"media_url"`
	Flagged   bool      `gorm:"default:false" json:"flagged"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
