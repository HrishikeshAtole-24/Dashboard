# 🎯 Goals & Conversion Tracking API

## Overview

The Goals & Conversion Tracking system allows you to define and track specific user actions as conversions on your websites. This is essential for measuring the success of your marketing campaigns, user engagement, and business objectives.

## Features

- ✅ Multiple goal types (URL destination, events, page duration, clicks, form submissions)
- ✅ Automatic conversion detection from tracking events
- ✅ Manual conversion recording
- ✅ Conversion rate analytics
- ✅ Goal-specific conversion history
- ✅ Custom conversion values and metadata
- ✅ Real-time goal completion detection

---

## 📊 Database Schema

### Goals Table
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  website_id VARCHAR(50) NOT NULL,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL DEFAULT 'url_destination',
  conditions JSONB NOT NULL DEFAULT '{}',
  value DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Goal Conversions Table
```sql
CREATE TABLE goal_conversions (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL,
  website_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  referrer TEXT,
  page_url TEXT NOT NULL,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  custom_data JSONB DEFAULT '{}',
  converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 API Endpoints

### 1. Initialize Goals Table
```http
GET /api/dashboard/goals/init
```
**Auth Required:** ✅ Yes  
**Purpose:** Initialize the goals and goal_conversions tables

**Response:**
```json
{
  "message": "Goals table initialized successfully"
}
```

---

### 2. Create New Goal
```http
POST /api/dashboard/goals
```
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "website_id": "ws_abc123",
  "name": "Thank You Page Visit",
  "description": "User reaches thank you page after purchase",
  "goal_type": "url_destination",
  "conditions": {
    "url": "/thank-you",
    "match_type": "contains"
  },
  "value": 25.00
}
```

**Goal Types & Conditions:**

#### URL Destination Goal
```json
{
  "goal_type": "url_destination",
  "conditions": {
    "url": "/thank-you",
    "match_type": "exact|contains|regex"
  }
}
```

#### Event Goal
```json
{
  "goal_type": "event",
  "conditions": {
    "event_type": "click",
    "custom_data": {
      "button_id": "signup-btn"
    }
  }
}
```

#### Page Duration Goal
```json
{
  "goal_type": "page_duration",
  "conditions": {
    "duration": 120
  }
}
```

#### Form Submit Goal
```json
{
  "goal_type": "form_submit",
  "conditions": {
    "form_id": "contact-form"
  }
}
```

#### Click Goal
```json
{
  "goal_type": "click",
  "conditions": {
    "selector": "#signup-button",
    "element_id": "signup-btn"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "goal": {
    "id": 1,
    "website_id": "ws_abc123",
    "name": "Thank You Page Visit",
    "goal_type": "url_destination",
    "conditions": {
      "url": "/thank-you",
      "match_type": "contains"
    },
    "value": "25.00",
    "is_active": true,
    "created_at": "2025-10-25T10:00:00.000Z"
  }
}
```

---

### 3. List All Goals for Website
```http
GET /api/dashboard/goals?website_id=ws_abc123
```
**Auth Required:** ✅ Yes

**Query Parameters:**
- `website_id` (required): Website identifier

**Response:**
```json
{
  "success": true,
  "goals": [
    {
      "id": 1,
      "name": "Thank You Page Visit",
      "goal_type": "url_destination",
      "conditions": {...},
      "value": "25.00",
      "is_active": true,
      "created_at": "2025-10-25T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 4. Get Specific Goal
```http
GET /api/dashboard/goals/:id
```
**Auth Required:** ✅ Yes

**Response:**
```json
{
  "success": true,
  "goal": {
    "id": 1,
    "website_id": "ws_abc123",
    "name": "Thank You Page Visit",
    "description": "User reaches thank you page after purchase",
    "goal_type": "url_destination",
    "conditions": {
      "url": "/thank-you",
      "match_type": "contains"
    },
    "value": "25.00",
    "is_active": true,
    "created_at": "2025-10-25T10:00:00.000Z",
    "updated_at": "2025-10-25T10:00:00.000Z"
  }
}
```

---

### 5. Update Goal
```http
PUT /api/dashboard/goals/:id
```
**Auth Required:** ✅ Yes

**Request Body (all fields optional):**
```json
{
  "name": "Updated Goal Name",
  "description": "Updated description",
  "conditions": {
    "url": "/new-thank-you",
    "match_type": "exact"
  },
  "value": 30.00,
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goal updated successfully",
  "goal": {
    "id": 1,
    "name": "Updated Goal Name",
    "value": "30.00",
    "is_active": false,
    "updated_at": "2025-10-25T11:00:00.000Z"
  }
}
```

---

### 6. Delete Goal
```http
DELETE /api/dashboard/goals/:id
```
**Auth Required:** ✅ Yes

**Response:**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

---

### 7. Get Goal Conversions
```http
GET /api/dashboard/goals/:id/conversions
```
**Auth Required:** ✅ Yes

**Query Parameters:**
- `start_date` (optional): ISO 8601 date string
- `end_date` (optional): ISO 8601 date string
- `limit` (optional): Max results (1-1000, default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "goal": {
    "id": 1,
    "name": "Thank You Page Visit",
    "goal_type": "url_destination"
  },
  "conversions": [
    {
      "id": 1,
      "session_id": "sess_abc123",
      "event_id": "evt_xyz789",
      "page_url": "https://example.com/thank-you",
      "conversion_value": "25.00",
      "custom_data": {},
      "converted_at": "2025-10-25T12:00:00.000Z"
    }
  ],
  "stats": [
    {
      "conversion_date": "2025-10-25",
      "total_conversions": "5",
      "total_value": "125.00",
      "avg_value": "25.00",
      "unique_sessions": "5"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}
```

---

### 8. Manual Conversion Recording
```http
POST /api/dashboard/goals/:id/conversions
```
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "session_id": "sess_abc123",
  "page_url": "https://example.com/thank-you",
  "conversion_value": 25.00,
  "custom_data": {
    "source": "email_campaign",
    "campaign_id": "camp_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion recorded successfully",
  "conversion": {
    "id": 1,
    "goal_id": 1,
    "session_id": "sess_abc123",
    "page_url": "https://example.com/thank-you",
    "conversion_value": "25.00",
    "converted_at": "2025-10-25T12:00:00.000Z"
  }
}
```

---

### 9. Get Conversion Rates Analytics
```http
GET /api/dashboard/analytics/conversion-rates
```
**Auth Required:** ✅ Yes

**Query Parameters:**
- `website_id` (required): Website identifier
- `start_date` (optional): ISO 8601 date string
- `end_date` (optional): ISO 8601 date string
- `goal_id` (optional): Specific goal ID to analyze

**Response:**
```json
{
  "success": true,
  "website_id": "ws_abc123",
  "conversion_rates": [
    {
      "goal_id": 1,
      "goal_name": "Thank You Page Visit",
      "conversions": "25",
      "converting_sessions": "20",
      "total_value": "625.00",
      "conversion_rate": "4.50",
      "total_sessions": "445"
    },
    {
      "goal_id": 2,
      "goal_name": "Newsletter Signup",
      "conversions": "45",
      "converting_sessions": "43",
      "total_value": "0.00",
      "conversion_rate": "9.66",
      "total_sessions": "445"
    }
  ],
  "period": {
    "start_date": "2025-10-01",
    "end_date": "2025-10-25"
  }
}
```

---

## 🔄 Automatic Goal Completion

Goals are automatically checked when events are collected via the `/api/collect` endpoint. The system:

1. Receives an event (page view, click, etc.)
2. Checks all active goals for that website
3. Evaluates goal conditions against the event data
4. Records conversions for matching goals
5. Logs successful conversions

### Example Event That Triggers Goals:
```json
{
  "websiteId": "ws_abc123",
  "eventType": "page_view",
  "url": "https://example.com/thank-you",
  "sessionId": "sess_abc123",
  "userAgent": "Mozilla/5.0...",
  "customData": {}
}
```

This would automatically trigger any URL destination goals with conditions matching `/thank-you`.

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd backend_dash
node test-goals-api.js
```

The test script will:
1. Authenticate or create a test user
2. Set up a test website
3. Initialize the goals tables
4. Test all CRUD operations
5. Test conversion tracking
6. Test automatic goal completion
7. Clean up test data (optional)

---

## 📊 Usage Examples

### E-commerce Store
```javascript
// Purchase completion goal
{
  "name": "Purchase Completed",
  "goal_type": "url_destination",
  "conditions": {
    "url": "/order-confirmation",
    "match_type": "contains"
  },
  "value": 50.00
}

// Add to cart goal
{
  "name": "Add to Cart",
  "goal_type": "event",
  "conditions": {
    "event_type": "click",
    "custom_data": {
      "action": "add_to_cart"
    }
  },
  "value": 5.00
}
```

### SaaS Application
```javascript
// User signup goal
{
  "name": "User Registration",
  "goal_type": "form_submit",
  "conditions": {
    "form_id": "signup-form"
  },
  "value": 25.00
}

// Feature engagement goal
{
  "name": "Engaged User",
  "goal_type": "page_duration",
  "conditions": {
    "duration": 300
  },
  "value": 10.00
}
```

### Content Website
```javascript
// Newsletter subscription
{
  "name": "Newsletter Signup",
  "goal_type": "click",
  "conditions": {
    "selector": "#newsletter-button"
  },
  "value": 2.00
}

// Content engagement
{
  "name": "Article Read",
  "goal_type": "page_duration",
  "conditions": {
    "duration": 180
  },
  "value": 1.00
}
```

---

## 🔧 Integration Notes

1. **Automatic Detection**: Goals are checked automatically when events are collected
2. **Real-time**: Conversions are recorded in real-time as events come in
3. **Flexible Conditions**: Support for exact matches, contains, and regex patterns
4. **Custom Data**: Store additional metadata with each conversion
5. **Performance**: Indexed for fast queries and real-time processing
6. **Analytics Ready**: Built-in conversion rate calculations and trending

This Goals & Conversion Tracking system provides the foundation for advanced analytics features like funnel analysis, cohort analysis, and attribution modeling.

---

## 🔮 Next Steps

- Implement funnel analysis using goals as funnel steps
- Add A/B testing integration with goal completion tracking
- Create goal-based alerts and notifications
- Build conversion attribution across multiple touchpoints
- Add goal templates for common use cases