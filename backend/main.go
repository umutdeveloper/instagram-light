package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/utils"
)

func main() {
	if err := utils.LoadEnv(); err != nil {
		log.Println("No .env file found, using system environment variables.")
	}

	db.InitDB()

	app := fiber.New()
	api.RegisterRoutes(app)

	port := utils.GetEnv("PORT", "8080")
	log.Printf("Server running on port %s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
