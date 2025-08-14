# CaseWise Patient Management System

A comprehensive **Patient Case Notes System** built with a modern **Turbo** monorepo architecture, **TypeScript**, and **Secure JWT Authentication with Cookies**. Designed to meet NHS UK standards with a prescription pad-style interface.

## 🏗️ Architecture

This monorepo contains three main components:

- **Backend** (`/backend`) - **TypeScript** Node.js/Express API server with **Secure JWT Authentication** and **SQLite Database**
- **Worker** (`/worker`) - **JavaScript** Background job processing service with **automatic admin seeding** and **OCR processing** (optimized for medical document processing)
- **Frontend** (`/frontend`) - **TypeScript** React-based web application with **NHS-style UI** and **Patient Case Notes Management**

## 🏥 Patient Case Notes System Features

### Core Functionality
- **Patient Registry** - Complete patient management with NHS numbers
- **Case Notes Management** - Medical records with prescription pad-style interface
- **PII Protection** - Secure handling of patient personal information
- **Document Upload** - File upload with OCR processing (coming soon)
- **Search & Filter** - Advanced patient search and filtering
- **Status Tracking** - Patient status management (active, urgent, inactive)

### NHS-Style Interface
- **Prescription Pad Design** - Familiar medical interface layout
- **Professional UI** - Clean, medical-grade user experience
- **Responsive Design** - Works on all devices and screen sizes
- **Accessibility** - WCAG compliant for healthcare environments
- **Medical Icons** - Lucide React icons for medical terminology

### Patient Management
- **Complete Patient Profiles** - Full PII and medical information
- **Emergency Contacts** - Critical contact information
- **Medical History** - Comprehensive medical background
- **Allergies & Medications** - Current medication tracking
- **Case Count Tracking** - Number of visits and case notes

### Case Notes Features
- **Diagnosis Recording** - Structured diagnosis entry
- **Prescription Management** - Medication and dosage tracking
- **Clinical Notes** - Detailed medical observations
- **Status Management** - Draft, completed, urgent statuses
- **Attachment Support** - Document upload and management
- **OCR Integration** - Automatic text extraction from documents

## 🔐 Authentication System

### Features
- **JWT-based Authentication** - Secure token-based authentication
- **HTTP-Only Cookies** - Secure token storage (no localStorage)
- **SQLite Database** - Lightweight database for user management
- **Password Hashing** - bcrypt for secure password storage
- **Role-based Access Control** - Admin and user roles
- **Protected Routes** - Middleware for securing API endpoints
- **Auto-login** - Persistent sessions with secure cookies
- **Automatic Admin Seeding** - Worker service ensures admin user is always available
- **Secure Logout** - Proper session termination

### Security Features
- **HTTP-Only Cookies** - Tokens cannot be accessed by JavaScript (XSS protection)
- **Secure Flag** - Cookies only sent over HTTPS in production
- **SameSite Strict** - CSRF protection
- **Automatic Token Expiration** - 24-hour token lifetime
- **No Token in Response Body** - Tokens only stored in secure cookies

### Default Admin User
- **Email**: `admin@casewise.com`
- **Password**: `admin`
- **Role**: `admin`

### API Endpoints
- `POST /api/auth/login` - User login (sets secure cookie)
- `POST /api/auth/logout` - User logout (clears cookie)
- `POST /api/auth/seed` - Seed admin user (called automatically by worker)
- `GET /api/auth/verify` - Verify JWT token from cookie
- `GET /api/status` - Protected status endpoint
- `GET /api/health-metrics` - Protected health data
- `GET /api/admin/users` - Admin-only endpoint

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
   turbo run dev --filter=worker     # Worker service (seeds admin user)
   turbo run dev --filter=frontend   # Frontend on port 3000
   ```

## 📁 Project Structure

```
CaseWise/
├── backend/                 # TypeScript Node.js/Express API
│   ├── src/
│   │   ├── index.ts        # Main server file (TypeScript)
│   │   ├── database/
│   │   │   └── schema.ts   # Database initialization
│   │   ├── models/
│   │   │   └── User.ts     # User model with authentication
│   │   ├── middleware/
│   │   │   └── auth.ts     # JWT authentication middleware
│   │   └── routes/
│   │       └── auth.ts     # Authentication routes
│   ├── data/               # SQLite database files
│   ├── package.json
│   ├── tsconfig.json       # TypeScript configuration
│   └── env.example
├── worker/                  # JavaScript Background job processor
│   ├── src/
│   │   └── index.js        # Worker service with auto-seeding & OCR
│   ├── package.json
│   └── env.example
├── frontend/                # TypeScript React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx         # Main React component (TypeScript)
│   │   ├── index.tsx       # React entry point (TypeScript)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Authentication context
│   │   └── components/
│   │       ├── Login.tsx   # Login component
│   │       ├── PatientList.tsx # Patient registry component
│   │       ├── CaseNotes.tsx # Case notes management
│   │       └── AddPatient.tsx # Patient registration form
│   ├── package.json
│   ├── tsconfig.json       # TypeScript configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── postcss.config.js   # PostCSS configuration
├── docker/                  # Docker development files
│   ├── backend.Dockerfile.dev
│   ├── worker.Dockerfile.dev
│   └── frontend.Dockerfile.dev
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
- `turbo run dev --filter=worker` - Start worker service (auto-seeds admin)

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
- **OCR Optimization** - Simpler for document processing tasks
- **Flexibility** - Easy integration with various OCR libraries
- **Performance** - No compilation overhead for simple tasks
- **Auto-seeding** - Ensures admin user is always available

## 🏥 NHS-Style UI/UX

### Frontend Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable medical icons
- **Responsive Design** - Works on all device sizes
- **NHS Color Scheme** - Professional medical color palette
- **Prescription Pad Layout** - Familiar medical interface design
- **Patient Registry** - Comprehensive patient management
- **Case Notes Interface** - Medical record management
- **Secure Authentication** - NHS-compliant login system

### Design Features
- **Medical Icons** - Stethoscope, pills, activity, user icons
- **Status Indicators** - Patient status with color coding
- **Professional Layout** - Clean, medical-grade interface
- **Form Validation** - Comprehensive input validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Professional loading indicators
- **Navigation** - Intuitive medical workflow navigation

## 🔐 Authentication Workflow

### 1. Automatic Admin Seeding
The worker service automatically ensures the admin user exists:
```bash
# Worker automatically calls this on startup
POST /api/auth/seed
```

### 2. User Login
```bash
# Login with admin credentials (sets secure HTTP-only cookie)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@casewise.com", "password": "admin"}' \
  -c cookies.txt
```

### 3. Access Protected Endpoints
```bash
# Use the cookie for subsequent requests
curl -X GET http://localhost:3001/api/status \
  -b cookies.txt
```

### 4. Secure Logout
```bash
# Clear the authentication cookie
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

### 5. Frontend Authentication
- **Login Form** - Beautiful, responsive login interface
- **Secure Cookie Storage** - HTTP-only cookies (XSS protection)
- **Auto-login** - Persistent sessions across browser sessions
- **Protected Routes** - Automatic redirect to login if not authenticated
- **Secure Logout** - Proper session termination with loading states

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

#### Public Endpoints
- `GET /health` - Health check endpoint
- `POST /api/auth/login` - User authentication (sets secure cookie)
- `POST /api/auth/logout` - User logout (clears cookie)
- `POST /api/auth/seed` - Seed admin user (called by worker)
- `GET /api/auth/verify` - Verify JWT token from cookie

#### Protected Endpoints (Require JWT Cookie)
- `GET /api/status` - API status with user info
- `GET /api/health-metrics` - Health data endpoint
- `GET /api/admin/users` - Admin-only endpoint

### Frontend (Port 3000)
- Automatically proxies API calls to backend
- **Patient Management Interface** with case notes
- **Patient Registry** with search and filtering
- **Case Notes Management** with prescription pad style
- **Patient Registration** with comprehensive forms

### Worker Service
- **Automatic Admin Seeding** - Ensures admin user exists on startup
- **Backend Health Monitoring** - Regular health checks
- **OCR Processing** - Document text extraction (coming soon)
- **Retry Logic** - Robust seeding with multiple attempts

## 🔧 Development

### Backend Development
- Built with **TypeScript** and Express.js
- **Secure JWT Authentication** with HTTP-only cookies
- **SQLite Database** for user management
- Includes security middleware (helmet, cors)
- Structured for easy API expansion
- Full type safety and IntelliSense

### Worker Development
- Background job processing service in **JavaScript**
- **Automatic Admin Seeding** - No manual intervention needed
- **Health Monitoring** - Regular backend health checks
- **OCR Integration** - Document processing capabilities
- **Retry Logic** - Robust error handling and retries
- Extensible job queue system
- Graceful shutdown handling
- Optimized for medical document processing

### Frontend Development
- Modern React 18 with **TypeScript** and hooks
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful medical icons
- **NHS-Style Interface** - Professional medical UI
- **Secure Authentication Context** for state management
- **HTTP-only Cookie Support** - XSS protection
- **Patient Management** - Complete patient registry
- **Case Notes System** - Medical record management
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

## 🔐 Security Features

### Authentication
- **JWT Tokens** - Secure, stateless authentication
- **HTTP-Only Cookies** - XSS protection (no localStorage)
- **Password Hashing** - bcrypt with salt rounds
- **Token Expiration** - 24-hour token lifetime
- **Role-based Access** - Admin and user permissions
- **Secure Logout** - Proper session termination

### API Security
- **Protected Routes** - Middleware for authentication
- **Input Validation** - Request validation and sanitization
- **Error Handling** - Secure error responses
- **CORS Configuration** - Cross-origin resource sharing with credentials
- **Cookie Security** - SameSite, Secure, and HttpOnly flags

### Database Security
- **SQLite** - File-based database with proper permissions
- **Prepared Statements** - SQL injection prevention
- **User Isolation** - Separate user data storage

### PII Protection
- **Patient Data Encryption** - Secure storage of personal information
- **Access Controls** - Role-based patient data access
- **Audit Logging** - Track data access and modifications
- **Data Retention** - NHS-compliant data retention policies
