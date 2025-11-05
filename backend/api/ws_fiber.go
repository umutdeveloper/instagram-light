package api

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/umutdeveloper/instagram-light/backend/middleware"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"github.com/umutdeveloper/instagram-light/backend/utils"
)

// RegisterWebSocketRoutes registers WebSocket routes with Fiber
func RegisterWebSocketRoutes(app *fiber.App) {
	// WebSocket endpoint with upgrade check middleware
	app.Get("/ws", func(c *fiber.Ctx) error {
		// Check if it's a WebSocket upgrade request
		if websocket.IsWebSocketUpgrade(c) {
			// Upgrade to WebSocket
			return websocket.New(handleWebSocket)(c)
		}
		return fiber.ErrUpgradeRequired
	})
}

func handleWebSocket(c *websocket.Conn) {
	// Get Authorization header from query or initial HTTP request
	authHeader := c.Headers("Authorization")
	if authHeader == "" {
		log.Println("WebSocket: No authorization header")
		c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Unauthorized"))
		return
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		log.Println("WebSocket: Invalid authorization format")
		c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Unauthorized"))
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	userID, err := middleware.ParseJWTUserID(tokenString)
	if err != nil {
		log.Printf("WebSocket: Invalid token: %v", err)
		c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, "Unauthorized"))
		return
	}

	log.Printf("WebSocket: User %s connected", userID)

	// Add connection to manager
	utils.WSManagerInstance.AddConnection(userID, c)
	defer utils.WSManagerInstance.RemoveConnection(userID)
	defer c.Close()

	// Read messages
	for {
		var msg models.WSEvent
		if err := c.ReadJSON(&msg); err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}
		log.Printf("WebSocket received message from user %s: %+v", userID, msg)
	}
}
