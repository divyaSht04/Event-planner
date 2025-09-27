# 🎉 Event Planner - Full-Stack Event Management Application

A comprehensive, secure, and user-friendly event planning platform that enables users to create, manage, and discover events. Built with modern technologies and best practices for scalability, security, and exceptional user experience.

## 🌟 Key Features at a Glance

- **🔐 Secure Authentication** - Email verification with OTP, JWT tokens, auto-refresh
- **📅 Complete Event Management** - Create, edit, delete, and browse events
- **🔍 Advanced Search & Filtering** - Find events by multiple criteria with smart sorting
- **📱 Responsive Design** - Works perfectly on all devices
- **🛡️ Security-First** - Protected routes, input validation, authorization checks
- **⚡ Modern Tech Stack** - React 18, TypeScript, Express, MySQL, Tailwind CSS

## 🛠️ Technology Stack

### **Frontend Architecture**
- **React 18** with TypeScript for type safety and modern features
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** for utility-first styling and responsive design
- **React Router** for client-side routing and navigation guards
- **Axios** for HTTP requests with interceptors and error handling
- **React Context** for global state management
- **React Hot Toast** for elegant user notifications

### **Backend Architecture**
- **Node.js + Express** with TypeScript for scalable server development
- **Knex.js** query builder for MySQL with migration management
- **JWT Authentication** with access/refresh token pattern
- **bcrypt** for secure password hashing
- **Winston** for structured logging
- **Helmet** for security headers
- **CORS** for secure cross-origin requests

### **Database & Infrastructure**
- **MySQL** relational database for complex relationships
- **Migration-based schema management** for version control
- **Connection pooling** for optimal database performance
- **Parameterized queries** for SQL injection prevention

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
- **Error Boundaries**: Dedicated NotFound for user experience

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

### Prerequisites
- **Node.js** (v18 or higher) 
- **MySQL** (v8.0 or higher)
- **npm** package manager (comes with Node.js)
- **Git** for version control

### Environment Configuration
Create a `.env` file in the `server` directory with the following variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=eventuser
DB_PASSWORD=eventpass
DB_NAME=event_planner

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Email Configuration (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
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

### 🔐 **Authentication Endpoints**
- `POST /api/auth/register` - Register new user (requires email verification)
- `POST /api/auth/verify-otp` - Verify email with OTP code
- `POST /api/auth/login` - User login with credentials
- `POST /api/auth/logout` - Secure logout with token cleanup
- `POST /api/auth/refresh` - Automatic token refresh
- `GET /api/auth/me` - Get current user profile

### 📅 **Event Management Endpoints**
- `GET /api/events` - Get all public events with pagination, search, and filters
  - Query params: `search`, `category_id`, `tag_ids`, `event_type`, `upcoming`, `date_start`, `date_end`, `sortBy`, `sortOrder`, `page`, `limit`
- `GET /api/events/my-events` - Get current user's events with same filtering options
- `GET /api/events/:id` - Get specific event details (public events or owned events)
- `POST /api/events` - Create new event (authenticated users only)
- `PUT /api/events/:id` - Update event (owner only with authorization check)
- `DELETE /api/events/:id` - Delete event (owner only with authorization check)

### 🏷️ **Category & Tag Endpoints**
- `GET /api/categories` - Get all available categories
- `GET /api/categories/:id/events` - Get events by category
- `GET /api/tags` - Get all available tags
- `GET /api/tags/:id/events` - Get events by tag




## Current Features

## ✨ Complete Feature Set

### 🔐 **Advanced Authentication System**
- **Email Verification**: OTP-based registration with nodemailer integration
- **Secure Login/Logout**: JWT tokens with HTTP-only cookies
- **Auto Token Refresh**: Seamless session management with 15min/7day token lifecycle
- **Route Protection**: Both frontend and backend authorization
- **UX Improvements**: Authenticated users automatically redirected from auth pages

### 📅 **Comprehensive Event Management**
- **Create Events**: Rich form with categories, tags, dates, and validation
- **Browse Public Events**: Discover community events with advanced search
- **My Events Dashboard**: Personal event management with full CRUD operations
- **Event Details**: Complete event information with owner controls
- **Smart Authorization**: Only event owners can edit/delete their events

### 🔍 **Advanced Search & Discovery**
- **Multi-Criteria Search**: Title, description, location, categories, and tags
- **Dynamic Sorting**: Sort by date, creation time, or title (ascending/descending)
- **Smart Filtering**: Event type, upcoming events, date ranges
- **Category System**: Organized event categorization
- **Tag System**: Flexible event tagging for better discovery

### 🎨 **Premium User Experience**
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Smart Pagination**: Hidden when not needed, elegant controls when required
- **Loading States**: Visual feedback during all operations
- **Error Handling**: Professional error pages and user feedback
- **Toast Notifications**: Real-time feedback for user actions
- **Custom Components**: Consistent UI with reusable component library

### 🛡️ **Security & Performance**
- **Input Validation**: Comprehensive client and server-side validation
- **Authorization Checks**: Event ownership verification at multiple levels
- **Password Security**: bcrypt hashing
- **CORS Protection**: Secure cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries with Knex.js
- **XSS Protection**: HTTP-only cookies
## 🎯 Project Highlights & Architecture Decisions

### **Security-First Development**
- **Email Verification**: Complete OTP-based registration system with nodemailer
- **Authorization Layers**: Multiple levels of access control (route-level, component-level, API-level)
- **Token Management**: Automatic refresh with secure HTTP-only cookies
- **Input Validation**: Comprehensive validation at both client and server levels
- **SQL Injection Prevention**: Parameterized queries throughout the application

### **User Experience Excellence**
- **Smart UI Behavior**: Pagination and count text hidden when not needed
- **Authentication Flow**: Seamless redirects for authenticated users accessing auth pages
- **Loading States**: Professional loading indicators during all async operations
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Responsive Design**: Mobile-first approach with elegant desktop scaling

### **Performance Optimizations**
- **Server-Side Pagination**: Efficient data loading with configurable page sizes
- **Database Indexing**: Optimized queries for search and filtering operations
- **Component Reusability**: Custom component library for consistent UI and reduced bundle size
- **Lazy Loading**: Strategic code splitting for optimal initial load times

### **Scalability Considerations**
- **Modular Architecture**: Feature-based organization for easy maintenance and expansion
- **Migration System**: Database schema versioning for safe production deployments
- **Environment Configuration**: Flexible configuration for different deployment environments
- **API Design**: RESTful endpoints designed for future mobile app integration

## 🚀 Getting Started



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

##  Application 

### **Authentication Flow**
- Clean, professional login/register pages with real-time validation
- Email verification with OTP system for secure account creation
- Automatic redirects for authenticated users

### **Event Management**
- Intuitive event creation form with rich validation
- Comprehensive event listing with advanced search and filtering
- Personal dashboard for managing your own events

### **User Experience**
- Responsive design that works beautifully on all devices
- Smart pagination that appears only when needed
- Toast notifications for all user actions

## 🔮 Future Enhancements

- **🎫 RSVP System**: Event attendance management
- **💬 Event Comments**: Community interaction features
- **📧 Email Notifications**: Event reminders and updates


## 👨‍💻 Author

**Divya Shrestha**
- GitHub: [@divyaSht04](https://github.com/divyaSht04)
- Project: [Event-planner](https://github.com/divyaSht04/Event-planner)

