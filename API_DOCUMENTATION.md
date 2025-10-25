# 📊 Analytics Dashboard - Complete API Documentation

## 🚀 Overview

This comprehensive API documentation covers all 23 endpoints available in the Analytics Dashboard backend. The APIs are organized into three main categories: Authentication, Data Collection, and Dashboard Analytics.

### **API Summary**
- **Total Endpoints**: 23 APIs
- **Authentication Required**: 16 endpoints
- **Public Endpoints**: 7 endpoints
- **Base URL**: `http://localhost:3001/api`

---

## 🔐 Authentication System

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📚 API Categories

### 🔑 **1. AUTH ROUTES** (`/api/auth`) - 5 APIs
### 📈 **2. COLLECT ROUTES** (`/api/collect`) - 3 APIs  
### 🎯 **3. DASHBOARD ROUTES** (`/api/dashboard`) - 16 APIs

---

## 🔑 AUTH ROUTES (`/api/auth`)

### 1. **Initialize User Table**
```http
GET /api/auth/init
```
**Purpose**: Initialize user table in database  
**Auth Required**: ❌ No  
**Request Body**: None  

**Response**:
```json
{
  "message": "User table initialized successfully"
}
```

---

### 2. **User Registration**
```http
POST /api/auth/register
```
**Purpose**: Create new user account  
**Auth Required**: ❌ No  

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",        // optional
  "firstName": "John",       // optional
  "lastName": "Doe"          // optional
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
```json
{
  "error": "User already exists with this email"
}
```

---

### 3. **User Login**
```http
POST /api/auth/login
```
**Purpose**: Authenticate user and get JWT token  
**Auth Required**: ❌ No  

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses**:
```json
{
  "error": "Invalid email or password"
}
```

---

### 4. **Get User Profile**
```http
GET /api/auth/profile
```
**Purpose**: Get current user profile information  
**Auth Required**: ✅ Yes  

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. **Update User Profile**
```http
PUT /api/auth/profile
```
**Purpose**: Update user profile information  
**Auth Required**: ✅ Yes  

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com"
}
```

**Response**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "name": "John Doe"
  }
}
```

---

## 📈 COLLECT ROUTES (`/api/collect`)

These endpoints are used by the tracking script to collect analytics data.

### 1. **Initialize Website Table**
```http
GET /api/collect/init
```
**Purpose**: Initialize website table in database  
**Auth Required**: ❌ No  

**Response**:
```json
{
  "message": "Website table initialized successfully"
}
```

---

### 2. **Collect Single Event**
```http
POST /api/collect
```
**Purpose**: Collect single analytics event from tracking script  
**Auth Required**: ❌ No  

**Request Body**:
```json
{
  "websiteId": "abc123",
  "eventType": "page_view",              // Required: page_view, click, scroll, etc.
  "url": "https://example.com/page",     // Required
  "referrer": "https://google.com",      // Optional
  "userAgent": "Mozilla/5.0...",         // Required
  "sessionId": "sess_123",               // Optional
  "userId": null,                        // Optional
  "duration": 45,                        // Optional, seconds on page
  "viewport": {                          // Optional
    "width": 1920,
    "height": 1080
  },
  "customData": {},                      // Optional custom event data
  "timestamp": "2024-01-15T10:30:00Z"    // Optional, defaults to server time
}
```

**Response**:
```json
{
  "message": "Event collected successfully",
  "eventId": "507f1f77bcf86cd799439011",
  "sessionId": "sess_123"
}
```

**Error Responses**:
```json
{
  "error": "Website ID is required"
}
```

---

### 3. **Collect Batch Events**
```http
POST /api/collect/batch
```
**Purpose**: Collect multiple analytics events in a single request  
**Auth Required**: ❌ No  

**Request Body**:
```json
{
  "events": [
    {
      "websiteId": "abc123",
      "eventType": "page_view",
      "url": "https://example.com/page1",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "websiteId": "abc123",
      "eventType": "click",
      "url": "https://example.com/page2",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

**Response**:
```json
{
  "message": "Processed 2 events successfully",
  "processedEvents": [
    {
      "eventId": "507f1f77bcf86cd799439011",
      "sessionId": "sess_123"
    },
    {
      "eventId": "507f1f77bcf86cd799439012",
      "sessionId": "sess_124"
    }
  ],
  "failedEvents": [],
  "stats": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

---

## 🎯 DASHBOARD ROUTES (`/api/dashboard`)

All dashboard routes require authentication.

### 1. **Initialize Daily Stats Table**
```http
GET /api/dashboard/init
```
**Purpose**: Initialize daily stats aggregation table  
**Auth Required**: ✅ Yes  

**Response**:
```json
{
  "message": "DailyStats table initialized successfully"
}
```

---

### 2. **Get User Websites**
```http
GET /api/dashboard/websites
```
**Purpose**: Get all websites belonging to the authenticated user  
**Auth Required**: ✅ Yes  

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "website_id": "abc123",
      "domain": "example.com",
      "name": "My Website",
      "description": "My awesome website",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "tracking_code": "<script src=\"http://localhost:3001/tracking/script.js?id=abc123\"></script>"
    }
  ]
}
```

---

### 3. **Create New Website**
```http
POST /api/dashboard/websites
```
**Purpose**: Create a new website for tracking  
**Auth Required**: ✅ Yes  

**Request Body**:
```json
{
  "domain": "example.com",                // Required
  "name": "My Website",                   // Required
  "description": "Website description"    // Optional
}
```

**Response**:
```json
{
  "message": "Website created successfully",
  "website": {
    "id": 1,
    "website_id": "generated_unique_id",
    "domain": "example.com",
    "name": "My Website",
    "description": "Website description",
    "tracking_code": "<script src=\"http://localhost:3001/tracking/script.js?id=generated_unique_id\"></script>"
  }
}
```

**Error Responses**:
```json
{
  "error": "Domain and name are required"
}
```

---

### 4. **Update Website**
```http
PUT /api/dashboard/websites/:id
```
**Purpose**: Update website details  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `id`: Website ID (integer)

**Request Body**:
```json
{
  "name": "Updated Website Name",
  "description": "Updated description"
}
```

**Response**:
```json
{
  "message": "Website updated successfully",
  "website": {
    "id": 1,
    "name": "Updated Website Name",
    "description": "Updated description"
  }
}
```

---

### 5. **Delete Website**
```http
DELETE /api/dashboard/websites/:id
```
**Purpose**: Deactivate/delete a website  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `id`: Website ID (integer)

**Response**:
```json
{
  "message": "Website deleted successfully"
}
```

---

### 6. **Get Website Overview**
```http
GET /api/dashboard/:websiteId/overview
```
**Purpose**: Get comprehensive analytics overview for a website  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `websiteId`: Website ID (string)

**Query Parameters**:
- `days`: Number of days to include (default: 30)

**Example**: `GET /api/dashboard/abc123/overview?days=30`

**Response**:
```json
{
  "websiteId": "abc123",
  "period": "30 days",
  "stats": {
    "totalVisits": 1234,
    "uniqueVisitors": 856,
    "totalPageViews": 2456,
    "avgDuration": 145.6,
    "avgBounceRate": 32.5,
    "daysWithData": 25
  }
}
```

---

### 7. **Get Chart Data**
```http
GET /api/dashboard/:websiteId/chart
```
**Purpose**: Get time-series data for charts and graphs  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `websiteId`: Website ID (string)

**Query Parameters**:
- `days`: Number of days to include (default: 30)

**Example**: `GET /api/dashboard/abc123/chart?days=7`

**Response**:
```json
{
  "websiteId": "abc123",
  "period": "7 days",
  "chartData": [
    {
      "date": "2024-01-15",
      "visits": 45,
      "unique_visitors": 32,
      "page_views": 67,
      "avg_duration": 125.5,
      "bounce_rate": 28.5
    },
    {
      "date": "2024-01-16",
      "visits": 52,
      "unique_visitors": 38,
      "page_views": 78,
      "avg_duration": 142.3,
      "bounce_rate": 31.2
    }
  ]
}
```

---

### 8. **Get Top Pages**
```http
GET /api/dashboard/:websiteId/top-pages
```
**Purpose**: Get most visited pages and their statistics  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `websiteId`: Website ID (string)

**Query Parameters**:
- `days`: Number of days to include (default: 30)

**Response**:
```json
{
  "websiteId": "abc123",
  "period": "30 days",
  "topPages": [
    {
      "url": "/home",
      "visits": 450,
      "page_views": 678,
      "avg_duration": 145.2,
      "bounce_rate": 25.3
    },
    {
      "url": "/about",
      "visits": 320,
      "page_views": 445,
      "avg_duration": 189.7,
      "bounce_rate": 18.9
    }
  ]
}
```

---

### 9. **Get Real-time Data**
```http
GET /api/dashboard/:websiteId/realtime
```
**Purpose**: Get current real-time visitor activity  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `websiteId`: Website ID (string)

**Response**:
```json
{
  "websiteId": "abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "realtimeStats": {
    "activeVisitors": 12,
    "recentPageViews": 8,
    "recentEvents": [
      {
        "eventType": "page_view",
        "url": "/home",
        "timestamp": "2024-01-15T10:29:45Z",
        "userAgent": "Mozilla/5.0...",
        "device": "desktop",
        "location": "New York, US"
      },
      {
        "eventType": "click",
        "url": "/products",
        "timestamp": "2024-01-15T10:29:30Z",
        "userAgent": "Mozilla/5.0...",
        "device": "mobile",
        "location": "London, UK"
      }
    ]
  }
}
```

---

### 10. **Trigger Manual Aggregation**
```http
POST /api/dashboard/:websiteId/aggregate
```
**Purpose**: Manually trigger data aggregation for a specific website  
**Auth Required**: ✅ Yes  

**URL Parameters**:
- `websiteId`: Website ID (string)

**Response**:
```json
{
  "message": "Data aggregation completed",
  "processedDates": [
    "2024-01-15",
    "2024-01-14",
    "2024-01-13"
  ],
  "stats": {
    "datesProcessed": 3,
    "eventsAggregated": 1547
  }
}
```

---

## 🏥 Health & Utility Endpoints

### **Health Check**
```http
GET /health
```
**Purpose**: Check server and database connectivity  
**Auth Required**: ❌ No  

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "databases": {
    "mongodb": "Connected",
    "neon_postgresql": "Connected"
  },
  "version": "1.0.0"
}
```

### **Tracking Script**
```http
GET /tracking/script.js
```
**Purpose**: Serve the JavaScript tracking script  
**Auth Required**: ❌ No  
**Response**: JavaScript file content

---

## 🚨 Error Handling

All APIs return appropriate HTTP status codes and error messages:

### Common Error Responses

**400 Bad Request**:
```json
{
  "error": "Validation error message",
  "details": {
    "field": "Specific field error"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": "Access denied. Please login."
}
```

**403 Forbidden**:
```json
{
  "error": "You don't have permission to access this resource"
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```

---

## 🔌 Frontend Integration Status

### ✅ **Already Integrated APIs** (12/16 critical APIs):

1. **Authentication** (3/5):
   - ✅ `POST /api/auth/register`
   - ✅ `POST /api/auth/login`
   - ✅ `GET /api/auth/profile`
   - ❌ `PUT /api/auth/profile` (missing)

2. **Website Management** (3/5):
   - ✅ `GET /api/dashboard/websites`
   - ✅ `POST /api/dashboard/websites`
   - ❌ `PUT /api/dashboard/websites/:id` (missing)
   - ✅ `DELETE /api/dashboard/websites/:id`

3. **Analytics Data** (4/4):
   - ✅ `GET /api/dashboard/:websiteId/overview`
   - ✅ `GET /api/dashboard/:websiteId/chart`
   - ✅ `GET /api/dashboard/:websiteId/top-pages`
   - ✅ `GET /api/dashboard/:websiteId/realtime`

4. **Utilities** (2/3):
   - ✅ `GET /health`
   - ❌ `POST /api/dashboard/:websiteId/aggregate` (missing)

### 📁 **Frontend API Files**:

The frontend API integration is located in:
- `frontend_dash/utils/api.js` - Main API client
- `frontend_dash/context/AuthContext.js` - Authentication context

---

## 🚀 Quick Start Integration

### Authentication Example:
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Use token for authenticated requests
const token = response.data.token;
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Dashboard Data Example:
```javascript
// Get website overview
const overview = await fetch(`/api/dashboard/${websiteId}/overview?days=30`, {
  headers: authHeaders
});

// Get chart data
const chartData = await fetch(`/api/dashboard/${websiteId}/chart?days=7`, {
  headers: authHeaders
});
```

---

## 📊 API Testing

### Recommended Testing Tools:
- **Postman** - API testing and documentation
- **Thunder Client** - VS Code extension
- **curl** - Command line testing

### Sample curl Commands:

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get websites (with token)
curl -X GET http://localhost:3001/api/dashboard/websites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Development Notes

### Database Schema:
- **MongoDB**: Raw events storage
- **PostgreSQL**: Aggregated analytics data, user accounts, website configuration

### Environment Variables Required:
```env
# Database
MONGODB_URI=mongodb+srv://...
NEON_DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your_secret_key

# Server
PORT=3001
NODE_ENV=development
```

### CORS Configuration:
Frontend URL (`http://localhost:3000`) is whitelisted for development.

---

## 📞 Support

For API support and questions:
- Check the error responses for specific error details
- Review the frontend integration in `utils/api.js`
- Ensure proper JWT token usage for authenticated endpoints
- Verify database connections for any persistent issues

---

**Last Updated**: October 25, 2024  
**API Version**: 1.0.0  
**Backend Port**: 3001  
**Frontend Port**: 3000