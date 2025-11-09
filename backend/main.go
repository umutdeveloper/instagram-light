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
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	fiberSwagger "github.com/swaggo/fiber-swagger"
	"github.com/umutdeveloper/instagram-light/backend/api"
	"github.com/umutdeveloper/instagram-light/backend/db"
	_ "github.com/umutdeveloper/instagram-light/backend/docs"
	"github.com/umutdeveloper/instagram-light/backend/utils"
)

func main() {
	if err := utils.LoadEnv(); err != nil {
		log.Println("No .env file found, using system environment variables.")
	}

	db.InitDB()

	app := fiber.New(fiber.Config{
		Prefork: true,
	})

	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000",
		AllowCredentials: true,
	}))

	api.RegisterRoutes(app)
	api.RegisterWebSocketRoutes(app) // WebSocket now integrated with Fiber

	// Serve static files from tmp/uploads directory
	app.Static("/tmp/uploads", "./tmp/uploads")

	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	// Start Fiber API server with WebSocket support and Prefork enabled
	port := utils.GetEnv("PORT", "8080")
	log.Printf("Fiber API (with WebSocket at /ws) starting on port %s with Prefork enabled", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Error starting Fiber server: %v", err)
	}
}
