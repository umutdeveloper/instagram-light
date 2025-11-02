# ---------- Dev Stage (Hot Reload + Conditional Setup) ----------
FROM golang:1.25-alpine

WORKDIR /app

# Install required packages and Air
RUN apk add --no-cache git curl && \
    go install github.com/air-verse/air@latest

# Copy module files first (for caching)
COPY go.mod go.sum* ./

# Create go.mod if missing (first-time build)
RUN [ -f go.mod ] || go mod init instagram-light-backend

# Ensure dependencies are tidy
RUN go mod tidy

# Copy all source files
COPY . .

# Disable CGO for lightweight binary builds
ENV CGO_ENABLED=0

# Pre-build binary (optional; Air will rebuild anyway)
RUN go build -o main .

# Expose backend port
EXPOSE 8080

# Default command starts Air with config
CMD ["air", "-c", "air.toml"]
