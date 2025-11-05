# VSCode Dev Container Dockerfile
FROM ubuntu:24.04

# Prevent apt from prompting for input
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && \
    apt-get install -y git curl build-essential ca-certificates bash software-properties-common && \
    \
    # Add deadsnakes PPA and install Python 3.10
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y python3.10 python3.10-venv python3.10-distutils && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10 && \
    ln -sf /usr/bin/python3.10 /usr/local/bin/python3 && \
    ln -sf /usr/local/bin/pip3.10 /usr/local/bin/pip3 && \
    \
    # Install OpenJDK 17 for openapi-generator and Java tools
    apt-get install -y openjdk-17-jdk && \
    \
    # Install Node.js v20 (using NodeSource)
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    \
    # Detect architecture and install Go 1.25.2
    ARCH=$(dpkg --print-architecture) && \
    case "$ARCH" in \
      amd64) GO_ARCH="linux-amd64" ;; \
      arm64) GO_ARCH="linux-arm64" ;; \
      *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac && \
    curl -LO https://go.dev/dl/go1.25.2.${GO_ARCH}.tar.gz && \
    tar -C /usr/local -xzf go1.25.2.${GO_ARCH}.tar.gz && \
    rm go1.25.2.${GO_ARCH}.tar.gz && \
    \
    # Install dev tools (for convenience)
    apt-get install -y zsh vim nano net-tools lsof && \
    \
    # Clean up
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Add Go to PATH
ENV PATH="/usr/local/go/bin:/home/vscode/go/bin:${PATH}"

# Create vscode user for VSCode Remote Containers
RUN useradd -ms /usr/bin/zsh vscode && usermod -aG sudo vscode

# Set working directory and default user
WORKDIR /workspace
USER vscode

# Install Go tools
RUN /usr/local/go/bin/go install github.com/swaggo/swag/cmd/swag@latest

# Install Python test dependencies for dev container (now using Python 3.10)
RUN pip3 install pytest pytest-asyncio pytest-cov httpx black flake8 mypy

# Add pip user install path to PATH
ENV PATH="/home/vscode/.local/bin:${PATH}"