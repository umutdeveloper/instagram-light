package api

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/middleware"
	"github.com/umutdeveloper/instagram-light/backend/models"
)

// RegisterCommentRoutes registers comment-related routes under posts
func RegisterCommentRoutes(app *fiber.App) {
	comments := app.Group("/api/posts/:post_id/comments", middleware.JWTMiddleware())
	comments.Get("/", GetComments)
	comments.Post("/", CreateComment)
	comments.Delete(":comment_id", DeleteComment)
}

// DeleteComment handles DELETE /api/posts/:post_id/comments/:comment_id
// @Summary Delete a comment
// @Description Delete a comment by its ID (only by the comment owner)
// @Tags comments
// @Param post_id path int true "Post ID"
// @Param comment_id path int true "Comment ID"
// @Success 204 "No Content"
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 403 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts/{post_id}/comments/{comment_id} [delete]
func DeleteComment(c *fiber.Ctx) error {
	postID, err := strconv.ParseInt(c.Params("post_id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid post_id"})
	}
	commentID, err := strconv.ParseInt(c.Params("comment_id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid comment_id"})
	}
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(int64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	var comment models.Comment
	err = db.DB.Where("id = ? AND post_id = ?", commentID, postID).First(&comment).Error
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Comment not found"})
	}
	if comment.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You can only delete your own comment"})
	}
	if err := db.DB.Delete(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete comment"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// CreateComment handles POST /api/posts/:post_id/comments
// CreateComment handles POST /api/posts/:post_id/comments
// @Summary Create a comment for a post
// @Description Create a new comment for a specific post
// @Tags comments
// @Accept json
// @Produce json
// @Param post_id path int true "Post ID"
// @Param body body object true "Comment body (text only)"
// @Success 201 {object} models.Comment
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts/{post_id}/comments [post]
func CreateComment(c *fiber.Ctx) error {
	postID, err := strconv.ParseInt(c.Params("post_id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid post_id"})
	}
	var req struct {
		Text string `json:"text"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	userIDVal := c.Locals("user_id")
	userID, ok := userIDVal.(int64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	comment := &models.Comment{
		PostID:    postID,
		UserID:    userID,
		Text:      req.Text,
		CreatedAt: time.Now(),
	}
	if err := db.DB.Create(comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create comment"})
	}
	return c.Status(fiber.StatusCreated).JSON(comment)
}

// GetComments handles GET /api/posts/:post_id/comments
// GetComments handles GET /api/posts/:post_id/comments
// @Summary Get comments for a post
// @Description Get all comments for a specific post
// @Tags comments
// @Produce json
// @Param post_id path int true "Post ID"
// @Success 200 {array} models.Comment
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /api/posts/{post_id}/comments [get]
func GetComments(c *fiber.Ctx) error {
	postID, err := strconv.ParseInt(c.Params("post_id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid post_id"})
	}
	var comments []models.Comment
	err = db.DB.Where("post_id = ?", postID).Order("created_at asc").Find(&comments).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch comments"})
	}
	return c.JSON(comments)
}
