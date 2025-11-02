package api

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"unique" json:"username"`
	Password string `json:"password"`
}

func RegisterAuthRoutes(app *fiber.App) {
	app.Post("/api/auth/register", register)
	app.Post("/api/auth/login", login)
}

func register(c *fiber.Ctx) error {
	type reqBody struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var body reqBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}
	user := User{Username: body.Username, Password: string(hashed)}
	if err := db.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username already exists"})
	}
	return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func login(c *fiber.Ctx) error {
	type reqBody struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var body reqBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	var user User
	if err := db.DB.Where("username = ?", body.Username).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("JWT_SECRET not set")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Server error"})
	}
	claims := jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}
	return c.JSON(fiber.Map{"token": signed})
}
