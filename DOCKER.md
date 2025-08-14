# Docker Development Guide

This guide explains how to use Docker Compose for development with the Health App monorepo.

## 🐳 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2 (included with Docker Desktop)

### Start Development Environment
```bash
# Build and start all services
npm run docker:up

# Or build first, then start
npm run docker:build
npm run docker:up
```

### Stop Development Environment
```bash
# Stop all services
npm run docker:down

# Stop and remove volumes (clean slate)
npm run docker:clean
```

## 🚀 Available Commands

### Docker Management
```bash
npm run docker:up      # Start all services
npm run docker:down    # Stop all services
npm run docker:build   # Build all containers
npm run docker:logs    # View logs from all services
npm run docker:restart # Restart all services
npm run docker:clean   # Stop and clean everything
```

### Direct Docker Compose
```bash
# Start in background
docker-compose up -d

# Start specific service
docker-compose up backend

# View logs
docker-compose logs -f frontend

# Rebuild specific service
docker-compose build --no-cache backend
```

## 🌐 Service Access

Once running, access your services at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Development Workflow

### 1. Start Environment
```bash
npm run docker:up
```

### 2. Make Code Changes
- Edit files in your IDE
- Changes are automatically reflected due to volume mounting
- Hot reload works in all services

### 3. View Logs
```bash
# All services
npm run docker:logs

# Specific service
docker-compose logs -f backend
```

### 4. Restart Services
```bash
# Restart all
npm run docker:restart

# Restart specific service
docker-compose restart backend
```

## 🏗️ Architecture

### Service Dependencies
```
Worker → Backend → Frontend
```

- **Worker**: Runs independently, processes background jobs
- **Backend**: Depends on worker, provides API
- **Frontend**: Depends on backend, displays UI

### Volume Mounting
- Source code is mounted into containers
- `node_modules` are preserved in containers
- Changes reflect immediately without rebuilding

### Networking
- All services communicate via `case-wise-network`
- Services can reference each other by service name
- Ports are exposed to host for development access

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process or change ports in docker-compose.yml
```

#### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose build --no-cache backend
```

#### Dependencies Not Installing
```bash
# Clean and rebuild
npm run docker:clean
npm run docker:build
npm run docker:up
```

### Reset Everything
```bash
# Nuclear option - removes everything
docker-compose down -v --remove-orphans
docker system prune -a
npm run docker:build
npm run docker:up
```

## 📁 File Structure

```
CaseWise/
├── docker-compose.yml          # Main compose file
├── .dockerignore              # Root docker ignore
├── docker/                    # Docker development files
│   ├── backend.Dockerfile.dev # Backend development image
│   ├── worker.Dockerfile.dev  # Worker development image
│   └── frontend.Dockerfile.dev # Frontend development image
├── backend/
│   └── .dockerignore         # Backend-specific ignores
├── worker/
│   └── .dockerignore         # Worker-specific ignores
└── frontend/
    └── .dockerignore         # Frontend-specific ignores
```

## 🔄 Development vs Production

### Development (Current Setup)
- Uses volume mounting for live code changes
- Includes development dependencies
- Hot reload enabled
- Debug-friendly configuration

### Production (Future)
- Multi-stage builds
- Optimized images
- Environment-specific configs
- Health checks and monitoring

## 💡 Tips

1. **Use npm scripts** - They're easier to remember than docker-compose commands
2. **Check logs first** - Most issues can be diagnosed from logs
3. **Rebuild when needed** - If dependencies change, rebuild containers
4. **Use volumes** - Code changes are reflected immediately
5. **Network isolation** - Services can communicate but are isolated from host

## 🆘 Need Help?

- Check service logs: `npm run docker:logs`
- Verify containers are running: `docker-compose ps`
- Check container health: `docker-compose exec backend npm run type-check`
