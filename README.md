# Event Planning Application

A full-stack event planning application with secure authentication, built with React (TypeScript) frontend and Node.js (Express with TypeScript) backend.

## Engineering Decisions

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL with Knex.js query builder
- **Authentication**: JWT with HTTP-only cookies + refresh tokens

### Key Architectural Choices
- **Cookie-based Authentication**: HTTP-only cookies prevent XSS attacks, automatic token refresh handles expired sessions
- **TypeScript Throughout**: Type safety across frontend and backend
- **Knex.js over ORMs**: Direct SQL control and better learning experience
- **Separation of Concerns**: Clean architecture with separate routes, controllers, models, and services

### Security Features
- JWT access tokens (15min) + refresh tokens (7 days)
- Password hashing with bcrypt
- HTTP-only, secure, same-site cookies
- CORS protection and Helmet security headers

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL database running
- npm

### Quick Start

1. **Clone and setup backend:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment (.env file already included):**
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=eventuser
   DB_PASSWORD=eventpass
   DB_NAME=event_planner
   JWT_SECRET=your_secret_key
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate:latest
   ```

4. **Start backend server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

5. **Setup and start frontend:**
   ```bash
   cd ../client
   npm install
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Available API Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Testing Authentication

1. Visit `http://localhost:5173`
2. Create account via signup
3. Login with credentials
4. Access protected dashboard
5. Automatic token refresh happens in background

## Current Features

✅ **Complete Authentication System**
- User registration and login
- JWT token management with automatic refresh
- Protected routes and navigation
- Secure cookie-based token storage
- Authentication context and services

✅ **Database Setup**
- Users table with proper schema
- Migration system ready for future tables
- MySQL integration with Knex.js

✅ **Frontend Components**
- Login/Signup pages with validation
- Authentication context for state management
- Protected routes and automatic redirects
- Responsive UI with Tailwind CSS