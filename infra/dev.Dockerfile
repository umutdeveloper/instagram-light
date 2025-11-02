# VSCode Dev Container Dockerfile
FROM ubuntu:latest

# Install dependencies
RUN apt-get update && \
	apt-get install -y git curl build-essential ca-certificates && \
	# Install Node.js v20 (using NodeSource)
	curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
	apt-get install -y nodejs && \
	# Install pnpm
	npm install -g pnpm && \
	# Install Go (latest stable)
	curl -fsSL https://go.dev/dl/ | grep -o 'go[0-9.]*\.linux-amd64.tar.gz' | head -1 | xargs -I {} curl -O https://go.dev/dl/{} && \
	tar -C /usr/local -xzf go*.linux-amd64.tar.gz && \
	rm go*.linux-amd64.tar.gz && \
	# Clean up
	apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Go path
ENV PATH="/usr/local/go/bin:$PATH"

# Set working directory
WORKDIR /workspace
