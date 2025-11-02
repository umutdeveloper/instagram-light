package models

import "time"

type Follow struct {
	ID          uint      `gorm:"primaryKey"`
	FollowerID  uint      `gorm:"not null;index"` // The user who follows
	FollowingID uint      `gorm:"not null;index"` // The user being followed
	CreatedAt   time.Time `gorm:"autoCreateTime"`
}
