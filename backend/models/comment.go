package models

import (
	"time"
)

type Comment struct {
	ID        int64     `json:"id" db:"id"`
	PostID    int64     `json:"post_id" db:"post_id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	Text      string    `json:"text" db:"text"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
