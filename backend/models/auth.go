package models

// AuthRequest represents the request body for authentication endpoints
// swagger:model
type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterResponse represents a successful registration response
// swagger:model
type RegisterResponse struct {
	Message string `json:"message"`
}

// LoginResponse represents a successful login response
// swagger:model
type LoginResponse struct {
	Token string `json:"token"`
}
