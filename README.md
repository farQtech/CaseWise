
# CaseWise Patient Management System

[![Build Status](https://github.com/farQtech/CaseWise/actions/workflows/ci.yml/badge.svg)](https://github.com/farQtech/CaseWise/actions/runs/16965895220)

A comprehensive **Patient Case Notes System** built with a modern **Turbo** monorepo architecture, **TypeScript**, and **Secure JWT Authentication with Cookies**. Designed to meet NHS UK standards with a prescription pad-style interface.

## 🏗️ Architecture

This monorepo contains three main components:

-   **Backend** (`/backend`) - **TypeScript** Node.js/Express API server with **Secure JWT Authentication** and **SQLite Database**
    
-   **Worker** (`/worker`) - **JavaScript** Background job processing service with **automatic admin seeding** and **OCR processing**
    
-   **Frontend** (`/frontend`) - **TypeScript** React web application with **NHS-style UI** and **Patient Case Notes Management**
    
    

## 🔐 Authentication System

### Features

-   **JWT-based Authentication**
    
-   **HTTP-Only Cookies**
    
-   **SQLite Database**
    
-   **Password Hashing** (bcrypt)
    
-   **Role-based Access Control**
    
-   **Protected Routes**
    
-   **Auto-login**
    
-   **Automatic Admin Seeding**
    
-   **Secure Logout**
    

### Security Features

-   **HTTP-Only Cookies**
    
-   **Secure Flag** (HTTPS only)
    
-   **SameSite Strict**
    
-   **Automatic Token Expiration** (24h)
    
-   **No Token in Response Body**
    

### Default Admin User

-   **Email**: `admin@casewise.com`
    
-   **Password**: `admin`
    
-   **Role**: `admin`
    

### API Endpoints

-   `POST /api/auth/login`
    
-   `POST /api/auth/logout`
    
-   `POST /api/auth/seed`
    
-   `GET /api/auth/verify`
    
-   `GET /api/status`
    
-   `GET /api/health-metrics`
    
-   `GET /api/admin/users`

## Login

### get auth cookie

```bash
curl "http://localhost:3000/api/auth/login" -H "Content-Type: application/json" --data-raw '{"email":"admin@casewise.com","password":"admin"}'

  ```

  Note that this will add a cookie to your postman/client that you need to use for other requests
    

## 🌐 Case Notes API (Backend)

### Get all case notes for a patient

```bash
curl -X GET http://localhost:3001/api/notes/patient/<PATIENT_ID> \
  -b <cookie>

```

### Get a single case note by ID

```bash
curl -X GET http://localhost:3001/api/notes/<CASE_NOTE_ID> \
  -b <cookie>

```

### Create a new case note

```bash
curl -X POST http://localhost:3001/api/notes/patient/<PATIENT_ID> \
  -H "Content-Type: application/json" \
  -d '{
        "date": "2025-08-14",
        "time": "14:00",
        "diagnosis": "Common Cold",
        "prescription": "Paracetamol 500mg",
        "notes": "Patient shows mild symptoms",
        "status": "draft"
      }' \
  -b cookies.txt

```

> **Notes:**
> 
> -   Replace `<PATIENT_ID>` and `<CASE_NOTE_ID>` with actual IDs.
>     
> -   `-b cookies.txt` uses the authenticated cookie obtained from login.
>     
> -   All endpoints require JWT authentication.
>     

## 🚀 Quick Start

### Prerequisites

-   Node.js >= 18.0.0
    
-   npm >= 8.0.0
    
-   Docker Desktop (for containerized development)
    

### Option 1: Docker Development

```bash
npm run docker:up      # Start all services
npm run docker:logs    # View logs
npm run docker:down    # Stop services

```

**Access services:**

-   Frontend: [http://localhost:3000](http://localhost:3000/)
    
-   Backend API: [http://localhost:3001](http://localhost:3001/)
    
-   Health Check: [http://localhost:3001/health](http://localhost:3001/health)
    

### Option 2: Local Development

```bash
# Install all dependencies
npm install

# Setup environment variables
cp backend/env.example backend/.env
cp worker/env.example worker/.env

# Start dev servers
turbo run dev
# Or individually
turbo run dev --filter=backend
turbo run dev --filter=worker
turbo run dev --filter=frontend

```

## 📁 Project Structure

```
CaseWise/
├── backend/       # TypeScript Node.js/Express API
├── worker/        # JavaScript Background job processor
├── frontend/      # TypeScript React application
├── docker/        # Docker development files
├── package.json
├── tsconfig.json
├── turbo.json
├── docker-compose.yml
└── README.md

```

## 🛠️ Available Scripts

### Root Level (Turbo)

-   `turbo run dev` - Start all services
    
-   `turbo run build` - Build all packages
    
-   `turbo run test` - Run tests
    
-   `turbo run lint` - Lint all packages
    
-   `turbo run clean` - Clean all packages
    
-   `turbo run format` - Format all packages
    
-   `turbo run type-check` - Type check all packages
    

### Individual Services

-   `turbo run dev --filter=backend`
    
-   `turbo run dev --filter=frontend`
    
-   `turbo run dev --filter=worker`
    

### Docker

-   `npm run docker:up`
    
-   `npm run docker:down`
    
-   `npm run docker:build`
    
-   `npm run docker:logs`
    
-   `npm run docker:restart`
    
-   `npm run docker:clean`
    

## 🔧 Development Notes

-   **Backend**: TypeScript + Express + JWT Auth + SQLite
    
-   **Worker**: JavaScript + OCR + Admin Seeding
    
-   **Frontend**: React + TypeScript + Tailwind CSS + NHS-style UI
    

## 🔐 Security Features

-   JWT authentication, HTTP-only cookies, password hashing, token expiration
    
-   Protected routes, input validation, error handling, CORS
    
-   SQLite prepared statements, role-based access, PII protection
    

## 🚀 Deployment

### Production Build

```bash
turbo run build

```

### Individual Services

```bash
cd backend && npm start
cd worker && npm start
cd frontend && npm start

```

### Turbo Commands

```bash
turbo run dev
turbo run dev --filter=backend
turbo run build
turbo run test

```