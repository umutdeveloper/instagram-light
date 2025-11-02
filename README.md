# 🌅 Instagram Light

> A lightweight, open-source Instagram clone built with **Go (Fiber)**, **Next.js**, and **PostgreSQL** — optimized for simplicity, speed, and modular scalability.

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.22+-00ADD8?style=for-the-badge&logo=go" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker" />
</p>

---

## 🧭 Overview

**Instagram Light** is a minimal, fast, and modern re-implementation of Instagram’s core features — built for learning, prototyping, and small-scale deployment.

The goal is to create a **clean, modular architecture** with production-ready patterns: authentication, database management, API design, and frontend integration — all within a single monorepo.

---

## 🧱 Architecture

```
instagram-light/
├── backend/       # Go (Fiber) API Server
│   ├── api/       # Route handlers
│   ├── db/        # DB connection & migrations
│   ├── models/    # GORM models
│   ├── utils/     # Helpers, JWT, password hashing, etc.
│   └── main.go
│
├── frontend/      # Next.js web app
│   ├── app/       # App router (Next.js 14+)
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── ...
│
├── shared/        # Shared constants, types, assets
│
├── infra/         # Docker, CI/CD, configs
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── ...
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology | Description |
|-------|-------------|-------------|
| **Backend** | Go (Fiber), GORM, JWT, Bcrypt | REST API, Auth, ORM |
| **Frontend** | Next.js (14+), TailwindCSS | SSR frontend & UI |
| **Database** | PostgreSQL | User/Post/Like tables |
| **Realtime** | WebSocket (Fiber) | Notifications & chat |
| **Storage** | Local → S3 (later) | Media uploads |
| **Deployment** | Docker + Fly.io / Render / Railway | Easy cloud deploy |
| **Logging/Monitoring** | Zap or Logrus (Go) | Structured logging |

---

## 🪜 Getting Started

### 1️⃣ Prerequisites

Ensure you have:
- **Go 1.22+**
- **Node.js 18+**
- **Docker & Docker Compose**
- **Git**

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/instagram-light.git
cd instagram-light
```

---

### 3️⃣ Environment Variables

Create `.env` files in both `/backend` and `/frontend`.

#### `/backend/.env`
```
PORT=8080
DB_URL=postgres://postgres:password@db:5432/instagram_light?sslmode=disable
JWT_SECRET=supersecret
MEDIA_PATH=./media
```

#### `/frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

### 4️⃣ Docker Setup

Run everything via Docker Compose:

```bash
docker-compose up --build
```

It will:
- Start PostgreSQL
- Start Go backend (Fiber)
- Start Next.js frontend

Access:
- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend → [http://localhost:8080/health](http://localhost:8080/health)

---

## 🧩 Core Features (MVP)

| Feature | Status | Description |
|----------|---------|-------------|
| 👤 User Auth | ✅ | JWT login/register/logout |
| 🖼️ Post CRUD | 🔄 | Upload & view posts |
| ❤️ Likes | 🔄 | Like/unlike posts |
| 💬 Comments | 🔄 | Add/view comments |
| 🔔 Notifications | 🚧 | Real-time with WebSocket |
| 🚫 Moderation | 🚧 | Basic NSFW/keyword filter |
| 🧮 Analytics | 🕒 | Future (optional module) |

---

## 🧪 API Example

### Health Check
```bash
GET /health
Response: { "status": "ok" }
```

### Register
```bash
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

---

## 🧰 Developer Tips

- Run backend locally without Docker:
  ```bash
  cd backend
  go run main.go
  ```
- Run frontend locally:
  ```bash
  cd frontend
  npm run dev
  ```
- Database migrations (planned via `golang-migrate`)

---

## 🧪 Testing

- **Backend tests:** `go test ./...`
- **Frontend tests:** `npm run test`
- **CI/CD:** GitHub Actions (workflow in `.github/workflows/ci.yml`)

---

## 🚀 Deployment

You can deploy using:
- **Fly.io**
- **Render**
- **Railway**
- **Docker Hub + VPS**

Example:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Roadmap

| Phase | Goal | Status |
|-------|------|---------|
| **Phase 1** | Basic auth, posts, likes | ✅ |
| **Phase 2** | Realtime notifications | 🚧 |
| **Phase 3** | Image CDN & moderation | 🕒 |
| **Phase 4** | Analytics & Admin Dashboard | 🕒 |

---

## 🧑‍💻 Contributors

| Name | Role | Contact |
|------|------|----------|
| You | Creator / Lead Dev | [GitHub](https://github.com/your-username) |

---

## 🪪 License
This project is licensed under the **MIT License** — free to use and modify.

```
MIT License © 2025 Umut ÇAKIR
```

---

## 🌟 Support
If you like this project:
- ⭐ Star it on GitHub  
- 🐞 Open issues for bugs or ideas  
- 💬 Contribute with pull requests  

---

<p align="center">
  Made with ❤️ using Go + Next.js
</p>
