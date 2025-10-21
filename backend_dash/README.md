# Backend Setup Instructions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://...` |
| `NEON_DATABASE_URL` | Neon PostgreSQL URL | `postgres://...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Website Management
- `GET /api/dashboard/websites` - List user websites
- `POST /api/dashboard/websites` - Create website
- `PUT /api/dashboard/websites/:id` - Update website
- `DELETE /api/dashboard/websites/:id` - Delete website

### Analytics Endpoints
- `GET /api/dashboard/:websiteId/overview` - Overview stats
- `GET /api/dashboard/:websiteId/chart` - Chart data
- `GET /api/dashboard/:websiteId/top-pages` - Top pages
- `GET /api/dashboard/:websiteId/realtime` - Real-time data

### Event Collection
- `POST /api/collect` - Single event
- `POST /api/collect/batch` - Batch events

## Database Schema

### PostgreSQL Tables (Neon)
- `users` - User accounts
- `websites` - Website configurations  
- `daily_stats` - Aggregated daily statistics

### MongoDB Collections (Atlas)
- `events` - Raw event data

## Development Commands

```bash
npm run dev     # Start development server
npm start       # Start production server
npm test        # Run tests (when implemented)
```

## Database Initialization

Tables and collections are created automatically when the server starts. You can also manually initialize:

```bash
# Visit these endpoints to create tables:
GET /api/auth/init
GET /api/collect/init  
GET /api/dashboard/init
```