package api

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/middleware"
	"github.com/umutdeveloper/instagram-light/backend/models"
)

// RegisterPostRoutes registers post-related routes
func RegisterPostRoutes(app *fiber.App) {
	posts := app.Group("/api/posts", middleware.JWTMiddleware())
	posts.Get("/", GetPosts)
	posts.Post("/", CreatePost)
	posts.Get(":id", GetPostByID)
	posts.Delete(":id", DeletePostByID)
}

// GetPosts handles GET /api/posts
// @Summary List posts
// @Description Get a paginated list of posts
// @Tags posts
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Page size"
// @Success 200 {object} models.PostsResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts [get]
func GetPosts(c *fiber.Ctx) error {
	// Pagination
	pageParam := c.Query("page", "1")
	limitParam := c.Query("limit", "20")
	page, err := strconv.Atoi(pageParam)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	var posts []models.Post
	tx := db.DB.Order("created_at DESC").Limit(limit).Offset(offset)
	if err := tx.Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch posts"})
	}
	return c.JSON(models.PostsResponse{
		Page:  page,
		Limit: limit,
		Posts: posts,
	})
}

// CreatePost handles POST /api/posts
// @Summary Create a post
// @Description Create a new post
// @Tags posts
// @Accept json
// @Produce json
// @Param post body models.Post true "Post data"
// @Success 201 {object} models.Post
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts [post]
func CreatePost(c *fiber.Ctx) error {
	var post models.Post
	if err := c.BodyParser(&post); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if post.UserID == 0 || post.MediaURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "UserID and MediaURL are required"})
	}
	if err := db.DB.Create(&post).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create post"})
	}
	return c.Status(fiber.StatusCreated).JSON(post)
}

// GetPostByID handles GET /api/posts/:id
// @Summary Get post by ID
// @Description Get a single post by its ID
// @Tags posts
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.Post
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts/{id} [get]
func GetPostByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid post ID"})
	}
	var post models.Post
	if err := db.DB.First(&post, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Post not found"})
	}
	return c.JSON(post)
}

// DeletePostByID handles DELETE /api/posts/:id
// @Summary Delete post by ID
// @Description Delete a post by its ID
// @Tags posts
// @Param id path int true "Post ID"
// @Success 204 {string} string "No Content"
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts/{id} [delete]
func DeletePostByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid post ID"})
	}
	if err := db.DB.Delete(&models.Post{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete post"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
