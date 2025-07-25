<p align="center">
  <img src="https://laravelvuespa.com/preview-dark.png" width="400" />
</p>

# Laravel & Vue SPA Starter Kit 
[![](https://img.shields.io/badge/vue.js-v3-04C690.svg)](https://vuejs.org/) 
[![](https://img.shields.io/badge/Laravel-v10.0-ff2e21.svg)](https://laravel.com) 
![Test PHP](https://github.com/fumeapp/laranuxt/workflows/Test%20PHP/badge.svg) 
[![Lint PHP](https://github.com/fumeapp/laranuxt/actions/workflows/lint-php.yml/badge.svg)](https://github.com/fumeapp/laranuxt/actions/workflows/lint-php.yml)

## Technology
- PHP-FPM 8.1
- Laravel 10
- Vue 3, Pinia
- Sanctum for Authentication (Bearer tokens)
- Fortify
- Docker & Docker Compose
- Nginx
- MySQL
- Redis
- Redis Queues
- Task Scheduling

## How it works
### Containers
1) **api**: serves the backend app (Laravel app)
2) **client**: serves the frontend app (Vue app)
3) **webserver**: services static content, storage, and passes traffic to api & client containers (proxy)
4) **mysql**: main database connection
5) **redis**: cache driver / queue connection
6) **worker**: runs queue workers & crontab

## Installation

### Development Environment
It includes compiling and hot-reloading for development

```bash
# Copy environment file
cp api/.env.dev.example api/.env.dev

# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Run migrations and seed database
docker-compose exec api php artisan migrate --seed
```

### Access URLs
- **API**: http://localhost:8000
- **Client**: http://localhost:3000

### Test User Credentials
For testing the authentication system, you can use these default credentials:

```
Email: test@leverbox.com
Password: password
```

## Project Structure

### Backend (Laravel API)
```
api/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php     # Authentication endpoints
│   │           ├── TaskController.php     # Task CRUD operations
│   │           ├── PriorityController.php # Priority management
│   │           └── TagController.php      # Tag management
│   └── Models/
│       ├── User.php                       # User model (simplified)
│       ├── Task.php                       # Task model
│       ├── Priority.php                   # Priority model
│       └── Tag.php                        # Tag model
├── routes/
│   └── api.php                           # API routes with Sanctum protection
└── database/
    └── migrations/                       # Database schema
```

### Frontend (Vue 3 SPA)
```
client/
├── src/
│   ├── components/                       # Reusable Vue components
│   ├── views/
│   │   ├── LoginView.vue                # Login page
│   │   ├── RegisterView.vue             # Registration page
│   │   ├── DashboardView.vue            # Main dashboard
│   │   └── TasksView.vue                # Task management
│   ├── composables/
│   │   └── useAuth.ts                   # Authentication logic
│   ├── services/
│   │   └── taskService.ts               # API service for tasks
│   ├── stores/
│   │   └── useTasksStore.ts             # Pinia store for state management
│   ├── types/
│   │   ├── auth.ts                      # TypeScript interfaces for auth
│   │   └── task.ts                      # TypeScript interfaces for tasks
│   └── plugins/
│       └── axios.ts                     # Centralized API configuration
```

## Features Implemented

### Authentication System
- ✅ **Login/Logout**: Sanctum Bearer token authentication
- ✅ **Registration**: User signup with validation
- ✅ **Protected Routes**: Router guards for authenticated pages
- ✅ **Token Management**: Automatic token refresh and cleanup

### Task Management
- ✅ **CRUD Operations**: Create, read, update, delete tasks
- ✅ **Status Management**: Pending, In Progress, Completed
- ✅ **Priority System**: Different priority levels with colors
- ✅ **Tag System**: Categorize tasks with tags
- ✅ **Search & Filters**: Advanced filtering and search capabilities
- ✅ **Bulk Operations**: Mass update and delete tasks

### Dashboard Features
- ✅ **Task Statistics**: Overview of task counts by status
- ✅ **Overdue Tasks**: Automatic detection and highlighting
- ✅ **Real-time Updates**: Reactive UI with Pinia state management

## API Endpoints

### Authentication
```http
POST   /api/login              # User login
POST   /api/register           # User registration
POST   /api/logout             # User logout (protected)
GET    /api/user               # Get user info (protected)
```

### Tasks (All Protected)
```http
GET    /api/tasks              # List tasks with filters
POST   /api/tasks              # Create new task
GET    /api/tasks/{id}          # Get specific task
PATCH  /api/tasks/{id}          # Update task
DELETE /api/tasks/{id}          # Delete task
PATCH  /api/tasks/{id}/status   # Update task status
GET    /api/tasks/search        # Search tasks
```

### Resources (All Protected)
```http
GET    /api/priorities          # List priorities
GET    /api/tags               # List tags
```

## Roadmap
- [x] Laravel, Sanctum, and Fortify installations
- [x] Vue 3 with Composition API
- [x] TypeScript integration
- [x] Login & Registration system
- [x] Task CRUD operations
- [x] Task status management
- [x] Priority and tag systems
- [x] Dashboard with statistics
- [x] Advanced filters and search
- [x] Authentication with route guards

## Contributing
Contributions are **welcome** and will be fully **credited**.

**Happy coding! 🚀**