package api

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/middleware"
	"github.com/umutdeveloper/instagram-light/backend/models"
)

// register user routes
func RegisterUserRoutes(app *fiber.App) {
	user := app.Group("/api/users", middleware.JWTMiddleware())
	user.Get("/search", SearchUsers)
	user.Get(":id", GetUserByID)
	user.Get(":id/followers", GetFollowers)
	user.Get(":id/following", GetFollowing)
}

// SearchUsers handles GET /api/users/search?q=query
// @Summary Search users
// @Description Search for users by username or email
// @Tags users
// @Produce json
// @Param q query string true "Search query"
// @Success 200 {array} models.User
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/users/search [get]
func SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Search query is required"})
	}

	var users []models.User
	searchPattern := "%" + query + "%"
	err := db.DB.Where("username LIKE ? OR email LIKE ?", searchPattern, searchPattern).
		Limit(20).
		Find(&users).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to search users"})
	}

	// Hide password fields
	for i := range users {
		users[i].Password = ""
	}

	return c.JSON(users)
}

// GetFollowers handles GET /api/users/:id/followers
// @Summary Get followers
// @Description Get a list of followers for a user
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {array} models.User
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/users/{id}/followers [get]
func GetFollowers(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var followers []models.User
	err = db.DB.Table("users").
		Select("users.*").
		Joins("JOIN follows ON follows.follower_id = users.id").
		Where("follows.following_id = ?", id).
		Find(&followers).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch followers"})
	}

	// Hide password fields
	for i := range followers {
		followers[i].Password = ""
	}

	return c.JSON(followers)
}

// GetFollowing handles GET /api/users/:id/following
// @Summary Get following
// @Description Get a list of users this user is following
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {array} models.User
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/users/{id}/following [get]
func GetFollowing(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var following []models.User
	err = db.DB.Table("users").
		Select("users.*").
		Joins("JOIN follows ON follows.following_id = users.id").
		Where("follows.follower_id = ?", id).
		Find(&following).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch following"})
	}

	// Hide password fields
	for i := range following {
		following[i].Password = ""
	}

	return c.JSON(following)
}

// GetUserByID handles GET /api/users/:id
// @Summary Get user by ID
// @Description Get a user by their ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/users/{id} [get]
func GetUserByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var user models.User
	if err := db.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Hide password field
	user.Password = ""
	return c.JSON(user)
}
