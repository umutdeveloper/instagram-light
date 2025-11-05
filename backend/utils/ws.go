package utils

import (
	"sync"

	"github.com/gofiber/websocket/v2"
)

// Global WebSocket manager instance
var WSManagerInstance = NewWSManager()

type WSManager struct {
	mu          sync.RWMutex
	connections map[string]*websocket.Conn // userID -> connection
}

func NewWSManager() *WSManager {
	return &WSManager{
		connections: make(map[string]*websocket.Conn),
	}
}

func (m *WSManager) AddConnection(userID string, conn *websocket.Conn) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.connections[userID] = conn
}

func (m *WSManager) RemoveConnection(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.connections, userID)
}

func (m *WSManager) SendToUser(userID string, message interface{}) error {
	m.mu.RLock()
	conn, ok := m.connections[userID]
	m.mu.RUnlock()
	if !ok {
		return nil // No connection for user
	}
	return conn.WriteJSON(message)
}

func (m *WSManager) Broadcast(message interface{}) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, conn := range m.connections {
		conn.WriteJSON(message)
	}
}
