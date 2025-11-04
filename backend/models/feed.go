package models

import "time"

// PostWithLikes represents a post with like count for the feed
// swagger:model
type PostWithLikes struct {
	ID         uint      `json:"id"`
	UserID     uint      `json:"user_id"`
	Caption    string    `json:"caption"`
	MediaURL   string    `json:"media_url"`
	CreatedAt  time.Time `json:"created_at"`
	LikesCount int       `json:"likes_count"`
}

// FeedResponse represents the paginated feed response
// swagger:model
type FeedResponse struct {
	Page  int             `json:"page"`
	Limit int             `json:"limit"`
	Posts []PostWithLikes `json:"posts"`
}
