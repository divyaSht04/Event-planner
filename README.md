# Event Planning Application

A comprehensive full-stack event planning application that allows users to create, manage, and browse events with secure authentication and a responsive UI. Built with React (TypeScript) frontend and Node.js (Express with TypeScript) backend.

## Engineering Decisions

### Tech Stack Selection
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Axios
- **Backend**: Node.js + Express + TypeScript + Knex.js
- **Database**: MySQL with Knex.js query builder
- **Authentication**: JWT with HTTP-only cookies + refresh tokens
- **Development**: Hot module replacement (Vite) + nodemon for auto-restart

### Key Architectural Choices

#### 1. Database & Query Layer
- **Knex.js over ORMs**: Chosen for direct SQL control, better performance understanding, and migration capabilities
- **MySQL**: Relational database for complex event-user relationships and data integrity
- **Migration-First Development**: Schema changes tracked and versioned through Knex migrations

#### 2. Authentication Architecture
- **Cookie-based JWT**: HTTP-only cookies prevent XSS attacks while maintaining stateless authentication
- **Dual Token System**: 15-minute access tokens + 7-day refresh tokens for security and UX balance
- **Automatic Token Refresh**: Background refresh prevents session interruptions
- **Route Protection**: Both frontend (React Router) and backend (Express middleware) authorization

#### 3. Frontend Architecture
- **Component Organization**: Pages grouped by feature (auth-pages/, event-page/) for maintainability
- **Custom Component Library**: Reusable CustomButton, CustomInput, CustomFormField for consistency
- **Context-Based State**: Authentication context for global auth state management
- **Error Boundaries**: Dedicated NotFound and AccessDenied pages for user experience

#### 4. Backend Architecture
- **MVC Pattern**: Separate models, controllers, and routes for clean separation of concerns
- **Middleware Chain**: Authentication, validation, and error handling middleware
- **RESTful API Design**: Standard HTTP methods and status codes for predictable interface

### Security Implementation
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **JWT Security**: Short-lived access tokens with secure refresh mechanism
- **Cookie Security**: HTTP-only, secure, SameSite cookies for CSRF protection
- **CORS Configuration**: Specific origin allowlist and credential support
- **Input Validation**: Server-side validation for all user inputs and data integrity

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL database server
- npm package manager

### Environment Configuration
Create a `.env` file in the `server` directory with the following variables:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=eventuser
DB_PASSWORD=eventpass
DB_NAME=event_planner
JWT_SECRET=secret_jwt_key
JWT_REFRESH_SECRET=_secret_refresh_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```



### Backend Setup
1. **Navigate to server directory and install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Run database migrations:**
   ```bash
   npm run migrate:latest
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001`

### Frontend Setup
1. **Navigate to client directory and install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Verification
- Backend: Visit `http://localhost:3001/api/health` to verify server is running
- Frontend: Visit `http://localhost:5173` to access the application
- Database: Check MySQL connection and verify tables are created

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Event Management Endpoints
- `GET /api/events` - Get all public events (with pagination, search, filtering)
- `GET /api/events/my` - Get current user's events
- `GET /api/events/:id` - Get specific event details
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event (owner only)
- `DELETE /api/events/:id` - Delete event (owner only)




## Current Features

### ✅ Complete Authentication System
- User registration with email validation
- Secure login/logout with JWT tokens
- Automatic token refresh mechanism
- Protected routes and navigation guards
- Authentication context and state management

### ✅ Event Management System
- **Create Events**: Full event creation with validation
- **Browse Events**: Public events listing with search and filters
- **My Events**: Personal event management dashboard
- **Event Details**: Comprehensive event information display
- **Edit/Delete**: Full CRUD operations for event owners

### ✅ Advanced Features
- **Search & Filter**: Find events by title, description, location, type, and tags
- **Pagination**: Server-side pagination for performance
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Error Handling**: Professional 404 page
- **Future Date Validation**: Prevents creation of past events
- **Owner Authorization**: Only event creators can modify their events

### ✅ User Experience
- **Custom Components**: Consistent UI with reusable components
- **Loading States**: Visual feedback during API calls
- **Form Validation**: Client and server-side validation
- **Authentication Prompts**: Login encouragement for non-authenticated users
## Assumptions Made During Development

### 1. User Authentication
- Users must be authenticated to create, edit, or delete events
- Public events are viewable by all users (authenticated and non-authenticated)
- Only event owners can modify their own events
- Email addresses are unique and used as primary user identifiers

### 2. Event Data Model
- Events have a single owner (creator)
- Events can be either "public" or "private"
- Private events are only visible to their owners
- Tags are stored as comma-separated strings for simplicity
- Event dates must be in the future when created

### 3. Business Rules
- Events cannot be created for past dates
- Users can create unlimited events
- No RSVP system implemented (future enhancement)
- No event capacity limits
- Tags are free-form text (no predefined tag system)


### 4. Security Model
- JWT tokens stored in HTTP-only cookies for security
- Refresh tokens have longer lifespan than access tokens

### 5. Data Validation
- Server-side validation is the source of truth
- Client-side validation provides immediate user feedback
- Date/time inputs use HTML5 input types for browser compatibility
- Text fields have reasonable length limits



## Development Commands

### Backend Commands
```bash
cd server
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run migrate:latest    # Run latest migrations
npm run migrate:rollback  # Rollback last migration
```

### Frontend Commands
```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```
