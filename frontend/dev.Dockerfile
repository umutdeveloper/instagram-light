# ---------- Frontend (Next.js) ----------
FROM node:20-alpine

WORKDIR /app

# Copy dependency files and install
RUN if [ -f package.json ]; then npm install && npm cache clean --force; else echo "No package.json found, skipping npm install"; fi

# Copy project source
COPY . .

# Ensure hot reload works in Docker
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Expose frontend port
EXPOSE 3000

# Start Next.js dev server
CMD ["npm", "run", "dev"]
