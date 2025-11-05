package middleware

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func parseJWTClaims(tokenStr string) (jwt.MapClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, fiber.ErrInternalServerError
	}
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.ErrUnauthorized
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return nil, fiber.ErrUnauthorized
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fiber.ErrUnauthorized
	}
	return claims, nil
}

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing or invalid Authorization header"})
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := parseJWTClaims(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
		}
		// Set user_id and username in context
		if sub, ok := claims["sub"].(float64); ok {
			c.Locals("user_id", int64(sub))
		}
		if username, ok := claims["username"].(string); ok {
			c.Locals("username", username)
		}
		return c.Next()
	}
}

func ParseJWTUserID(tokenStr string) (string, error) {
	claims, err := parseJWTClaims(tokenStr)
	if err != nil {
		return "", err
	}
	if sub, ok := claims["sub"]; ok {
		switch v := sub.(type) {
		case float64:
			return fmt.Sprintf("%d", int64(v)), nil
		case string:
			return v, nil
		}
	}
	return "", fiber.ErrUnauthorized
}
