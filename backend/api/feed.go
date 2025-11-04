package api

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/umutdeveloper/instagram-light/backend/db"
	"github.com/umutdeveloper/instagram-light/backend/models"
)

// RegisterFeedRoutes registers the feed route
func RegisterFeedRoutes(app *fiber.App) {
	app.Get("/api/feed", GetFeed)
}

// GetFeed handles GET /api/feed
// @Summary Get user feed
// @Description Get a paginated feed for a user (posts from followed users)
// @Tags feed
// @Produce json
// @Param user_id query int true "User ID"
// @Param page query int false "Page number"
// @Param limit query int false "Page size"
// @Success 200 {object} models.FeedResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/feed [get]
func GetFeed(c *fiber.Ctx) error {
	userIDParam := c.Query("user_id")
	if userIDParam == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user_id query parameter is required"})
	}
	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user_id"})
	}

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

	var posts []models.PostWithLikes

	// Get followed user IDs
	var followedIDs []uint
	db.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Pluck("following_id", &followedIDs)
	followedIDs = append(followedIDs, uint(userID)) // include self

	// Get posts from followed users
	var dbPosts []models.Post
	if err := db.DB.Where("user_id IN ?", followedIDs).Order("created_at desc").Limit(limit).Offset(offset).Find(&dbPosts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch feed posts"})
	}

	// Get likes count for each post
	for _, post := range dbPosts {
		var likesCount int64
		db.DB.Model(&models.Like{}).Where("post_id = ?", post.ID).Count(&likesCount)
		posts = append(posts, models.PostWithLikes{
			ID:         post.ID,
			UserID:     post.UserID,
			Caption:    post.Caption,
			MediaURL:   post.MediaURL,
			CreatedAt:  post.CreatedAt,
			LikesCount: int(likesCount),
		})
	}

	return c.JSON(models.FeedResponse{
		Page:  page,
		Limit: limit,
		Posts: posts,
	})
}
