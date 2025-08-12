# Health App Monorepo

A comprehensive health monitoring application built with a modern **Turbo** monorepo architecture and **TypeScript**.

## 🏗️ Architecture

This monorepo contains three main components:

- **Backend** (`/backend`) - **TypeScript** Node.js/Express API server
- **Worker** (`/worker`) - **JavaScript** Background job processing service (optimized for OCR tasks)
- **Frontend** (`/frontend`) - **TypeScript** React-based web application

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- **Docker Desktop** (for containerized development)

### Option 1: Docker Development (Recommended)

```bash
# Start all services in containers
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

**Access your services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Option 2: Local Development

1. **Install all dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   
   # Worker
   cp worker/env.example worker/.env
   ```

3. **Start development servers:**
   ```bash
   # Start all services with Turbo
   turbo run dev
   
   # Or start individually:
   turbo run dev --filter=backend    # Backend on port 3001
   turbo run dev --filter=worker     # Worker service
   turbo run dev --filter=frontend   # Frontend on port 3000
   ```

## 📁 Project Structure

```
HealthApp/
├── backend/                 # TypeScript Node.js/Express API
│   ├── src/
│   │   └── index.ts        # Main server file (TypeScript)
│   ├── package.json
│   ├── tsconfig.json       # TypeScript configuration
│   ├── Dockerfile.dev      # Development Docker image
│   └── env.example
├── worker/                  # JavaScript Background job processor
│   ├── src/
│   │   └── index.js        # Worker service (JavaScript for OCR)
│   ├── package.json
│   ├── Dockerfile.dev      # Development Docker image
│   └── env.example
├── frontend/                # TypeScript React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx         # Main React component (TypeScript)
│   │   ├── App.css         # Styling
│   │   └── index.tsx       # React entry point (TypeScript)
│   ├── package.json
│   ├── tsconfig.json       # TypeScript configuration
│   └── Dockerfile.dev      # Development Docker image
├── package.json             # Root monorepo config
├── tsconfig.json           # Root TypeScript configuration
├── turbo.json              # Turbo configuration
├── docker-compose.yml      # Docker Compose configuration
├── DOCKER.md               # Docker development guide
└── README.md
```

## 🛠️ Available Scripts

### Root Level (Turbo Commands)
- `turbo run dev` - Start all services in development mode
- `turbo run build` - Build all packages with caching
- `turbo run test` - Run tests across all packages
- `turbo run lint` - Lint all packages
- `turbo run clean` - Clean all packages
- `turbo run format` - Format all packages
- `turbo run type-check` - Type check all packages

### Docker Development
- `npm run docker:up` - Start all services in containers
- `npm run docker:down` - Stop all services
- `npm run docker:build` - Build all containers
- `npm run docker:logs` - View logs from all services
- `npm run docker:restart` - Restart all services
- `npm run docker:clean` - Stop and clean everything

### Individual Services
- `turbo run dev --filter=backend` - Start backend server
- `turbo run dev --filter=frontend` - Start React development server
- `turbo run dev --filter=worker` - Start worker service

### NPM Scripts (for convenience)
- `npm run dev` - Start all services
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run dev:worker` - Start worker only

## 🚀 Turbo Features

This monorepo leverages **Turbo** for:

- **Fast Builds** - Incremental builds with intelligent caching
- **Parallel Execution** - Run tasks across packages simultaneously
- **Dependency Graph** - Automatic task ordering based on dependencies
- **Remote Caching** - Share build cache across team members
- **Task Pipelining** - Efficient task execution with proper dependencies

## 🔧 TypeScript Benefits

### Backend & Frontend
- **Type Safety** - Catch errors at compile time
- **Better IntelliSense** - Enhanced developer experience
- **Refactoring Support** - Safe code modifications
- **Interface Definitions** - Clear API contracts

### Worker (JavaScript)
- **OCR Optimization** - Simpler for image processing tasks
- **Flexibility** - Easy integration with various OCR libraries
- **Performance** - No compilation overhead for simple tasks

## 🐳 Docker Development

### Why Docker?
- **Consistent Environment** - Same setup across all team members
- **Isolation** - Services don't interfere with local system
- **Easy Setup** - One command to start everything
- **Production-like** - Closer to actual deployment environment

### Quick Docker Commands
```bash
# Start everything
npm run docker:up

# View logs
npm run docker:logs

# Stop everything
npm run docker:down

# Clean slate
npm run docker:clean
```

For detailed Docker usage, see [DOCKER.md](./DOCKER.md).

## 🌐 Service Endpoints

### Backend (Port 3001)
- `GET /health` - Health check endpoint
- `GET /api/status` - API status information

### Frontend (Port 3000)
- Automatically proxies API calls to backend
- Modern health dashboard with real-time metrics

## 🔧 Development

### Backend Development
- Built with **TypeScript** and Express.js
- Includes security middleware (helmet, cors)
- Structured for easy API expansion
- Full type safety and IntelliSense

### Worker Development
- Background job processing service in **JavaScript**
- Extensible job queue system
- Graceful shutdown handling
- Optimized for OCR and image processing tasks

### Frontend Development
- Modern React 18 with **TypeScript** and hooks
- Responsive design with CSS Grid
- Real-time backend status monitoring
- Full type safety for components and state

## 📦 Package Management

This monorepo uses **Turbo** for efficient task management:
- Shared dependencies are hoisted to the root
- Each service has its own package.json and TypeScript config
- Turbo handles task orchestration and caching
- Easy to add new services or modify existing ones

## 🚀 Deployment

### Production Build
```bash
turbo run build
```

### Individual Service Deployment
```bash
# Backend (TypeScript compiled to JavaScript)
cd backend && npm start

# Worker (JavaScript)
cd worker && npm start

# Frontend (TypeScript compiled to JavaScript)
cd frontend && npm start
```

## 🔍 Turbo Commands

### Development
```bash
# Start all services
turbo run dev

# Start specific service
turbo run dev --filter=backend

# Start multiple services
turbo run dev --filter=backend --filter=frontend
```

### Building
```bash
# Build all packages
turbo run build

# Build specific package
turbo run build --filter=frontend

# Build with force (ignore cache)
turbo run build --force
```

### Testing & Quality
```bash
# Run all tests
turbo run test

# Lint all packages
turbo run lint

# Type check all packages
turbo run type-check

# Clean all packages
turbo run clean
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test all services: `turbo run test`
4. Type check: `turbo run type-check`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions, please check the individual service documentation or create an issue in the repository.