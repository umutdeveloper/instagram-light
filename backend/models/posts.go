package models

// PostsResponse represents the paginated posts response
// swagger:model
type PostsResponse struct {
	Page  int    `json:"page"`
	Limit int    `json:"limit"`
	Posts []Post `json:"posts"`
}
