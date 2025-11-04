// @title Instagram Light API
// @version 1.0
// @description Lightweight Instagram-like API with Go Fiber
// @contact.name API Support
// @contact.email support@example.com
// @host localhost:8080
// @BasePath /
package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/utils"

	fiberSwagger "github.com/swaggo/fiber-swagger"

	_ "github.com/umutdeveloper/instagram-light/backend/docs"
)

func main() {
	if err := utils.LoadEnv(); err != nil {
		log.Println("No .env file found, using system environment variables.")
	}

	db.InitDB()

	app := fiber.New()

	api.RegisterRoutes(app)

	// Swagger UI endpoint
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	port := utils.GetEnv("PORT", "8080")
	log.Printf("Server running on port %s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
