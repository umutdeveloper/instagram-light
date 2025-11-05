package models

type WSEvent struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}
