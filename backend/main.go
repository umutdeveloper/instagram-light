package main

import (
	"fmt"
	"log"
	"os"

	// Fiber web framework
	"github.com/gofiber/fiber/v2"
	// GORM ORM and PostgreSQL driver
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	// For loading .env files
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables.")
	}

	// Get database connection string from environment
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set in environment")
	}

	// Connect to PostgreSQL using GORM
	_, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	// Database connection established

	// Initialize Fiber app
	app := fiber.New()

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		// Respond with JSON status
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Graceful server start on port 8080 (or PORT env)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
