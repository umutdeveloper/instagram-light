package db

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/umutdeveloper/instagram-light/backend/models"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB = db

	// AutoMigrate all main tables
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Like{},
		&models.Follow{},
		&models.Comment{},
	); err != nil {
		log.Fatalf("Failed to migrate models: %v", err)
	}
	log.Println("Database connection established successfully")
}
