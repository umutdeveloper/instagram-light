// @title Instagram Light API
// @version 1.0
// @description Lightweight Instagram-like API with Go Fiber
// @contact.name API Support
// @contact.email support@example.com
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"
package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

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

	app := fiber.New(fiber.Config{
		Prefork: true,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000",
		AllowCredentials: true,
	}))

	api.RegisterRoutes(app)

	// Swagger UI endpoint
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	port := utils.GetEnv("PORT", "8080")
	log.Printf("Server running on port %s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
