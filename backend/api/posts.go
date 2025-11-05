package api

import (
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/middleware"
	"github.com/umutdeveloper/instagram-light/backend/models"
	"github.com/umutdeveloper/instagram-light/backend/utils"
)

// RegisterPostRoutes registers post-related routes
func RegisterPostRoutes(app *fiber.App) {
	posts := app.Group("/api/posts", middleware.JWTMiddleware())
	posts.Get("/", GetPosts)
	posts.Post("/", CreatePost)
	posts.Get(":id", GetPostByID)
	posts.Delete(":id", DeletePostByID)
	posts.Post(":id/like", ToggleLike)
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

	aiResponse, err := utils.ModerateImage(post.MediaURL)
	if err != nil {
		fmt.Printf("AI moderation failed: %v\n", err)
	} else {
		post.Flagged = aiResponse.NSFW
		fmt.Printf("AI moderation result: NSFW=%v, Score=%.3f\n", aiResponse.NSFW, aiResponse.Score)
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

// ToggleLike handles POST /api/posts/:id/like
// @Summary Toggle like for a post
// @Description Like or unlike a post for the authenticated user
// @Tags posts
// @Produce json
// @Param id path int true "Post ID"
// @Success 200 {object} models.ToggleLikeResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts/{id}/like [post]
func ToggleLike(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid post ID"})
	}
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(int64)
	if !ok || userID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	// Check if post exists
	var post models.Post
	if err := db.DB.First(&post, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Post not found"})
	}
	// Check if like exists
	var like models.Like
	result := db.DB.Where("user_id = ? AND post_id = ?", userID, id).First(&like)
	if result.Error == nil {
		// Like exists, so unlike (delete)
		if err := db.DB.Delete(&like).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to unlike post"})
		}
		return c.JSON(models.ToggleLikeResponse{Liked: false})
	}
	// Like does not exist, so like (create)
	newLike := models.Like{UserID: uint(userID), PostID: uint(id)}
	if err := db.DB.Create(&newLike).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to like post"})
	}

	var postOwner models.Post
	if err := db.DB.First(&postOwner, id).Error; err == nil {
		wsEvent := models.WSEvent{
			Type:    "new_like",
			Payload: newLike,
		}
		go func(userID uint, event models.WSEvent) {
			_ = utils.WSManagerInstance.SendToUser(fmt.Sprintf("%d", userID), event)
		}(postOwner.UserID, wsEvent)
	}

	return c.JSON(models.ToggleLikeResponse{Liked: true})
}
