# ---------- Dev Stage (Hot Reload + Conditional Setup) ----------
FROM golang:1.25-alpine

WORKDIR /app

# Install required packages and Air
RUN apk add --no-cache git curl && \
    go install github.com/air-verse/air@latest

# Copy all source files
COPY . .

# Create go.mod if missing (first-time build)
RUN [ -f go.mod ] || go mod init github.com/umutdeveloper/instagram-light/backend

# Force Go to resolve and download all required deps from imports automatically
RUN go mod tidy && go mod download


# Disable CGO for lightweight binary builds
ENV CGO_ENABLED=0

# Pre-build binary (optional; Air will rebuild anyway)
RUN go build -o main .

# Expose backend port
EXPOSE 8080

# Default command starts Air with config through a shell for Fiber prefork
CMD ["sh", "-c", "air -c air.toml"]
