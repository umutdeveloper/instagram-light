package models

import "time"

type Like struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index"`
	PostID    uint      `gorm:"not null;index"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
