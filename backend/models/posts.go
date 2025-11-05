package models

// PostsResponse represents the paginated posts response
// swagger:model
type PostsResponse struct {
	Page  int    `json:"page"`
	Limit int    `json:"limit"`
	Posts []Post `json:"posts"`
}

// AIServiceResponse represents the response from AI moderation service
type AIServiceResponse struct {
	NSFW      bool    `json:"nsfw"`
	Score     float64 `json:"score"`
	ModelName string  `json:"model_name"`
}
