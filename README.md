# Analytics Dashboard - Complete Setup Guide

A full-stack analytics dashboard similar to Google Analytics, built with Next.js, Express.js, Neon PostgreSQL, and MongoDB Atlas.

## 🚀 Project Overview

This analytics dashboard allows you to:
- Track website visitors in real-time
- View beautiful charts and statistics
- Monitor user behavior and engagement
- Collect custom events and goals
- Export analytics data

### Architecture

- **Frontend**: Next.js with TailwindCSS and Recharts
- **Backend**: Express.js with JWT authentication
- **Raw Events Storage**: MongoDB Atlas (for high-volume event logs)
- **Aggregated Data**: Neon PostgreSQL (for fast dashboard queries)
- **Data Pipeline**: Automated aggregation from MongoDB to PostgreSQL

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **MongoDB Atlas account** (free tier available)
4. **Neon account** (free tier available)
5. **Git** for version control

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Backend setup
cd backend_dash
npm install

# Frontend setup
cd ../frontend_dash
npm install
```

### 2. Database Setup

#### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (choose free tier)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

#### Neon PostgreSQL Setup

1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from your dashboard

### 3. Environment Configuration

#### Backend Environment (.env)

Create `backend_dash/.env` file:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Generate a secure JWT secret (use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-here

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/analytics_dashboard?retryWrites=true&w=majority

# Neon PostgreSQL connection string  
NEON_DATABASE_URL=postgres://username:password@ep-example.us-east-2.aws.neon.tech/dbname?sslmode=require
```

#### Frontend Environment (.env.local)

Create `frontend_dash/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Analytics Dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Database Initialization

The application will automatically create the necessary tables and collections when you first run it. You can also manually initialize them:

```bash
# Start the backend server
cd backend_dash
npm run dev

# The server will automatically create MongoDB collections and PostgreSQL tables
```

### 5. Start the Application

#### Start Backend (Terminal 1)
```bash
cd backend_dash
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
cd frontend_dash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 How to Use

### 1. Create Account
1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Fill in your details and create account

### 2. Add a Website
1. Login to your dashboard
2. Click "Add Website"
3. Enter your website domain and name
4. Get your unique website ID

### 3. Install Tracking Script
Add this script to your website before the closing `</body>` tag:

```html
<script src="http://localhost:5000/track.js" data-website-id="your-website-id"></script>
```

### 4. View Analytics
- Real-time visitor tracking
- Daily/weekly/monthly charts
- Top pages and referrers
- Device and browser analytics
- Custom event tracking

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Website Management
- `GET /api/dashboard/websites` - Get user's websites
- `POST /api/dashboard/websites` - Create new website
- `PUT /api/dashboard/websites/:id` - Update website
- `DELETE /api/dashboard/websites/:id` - Delete website

### Analytics Data
- `GET /api/dashboard/:websiteId/overview` - Get overview stats
- `GET /api/dashboard/:websiteId/chart` - Get chart data
- `GET /api/dashboard/:websiteId/top-pages` - Get top pages
- `GET /api/dashboard/:websiteId/realtime` - Get real-time stats

### Event Collection
- `POST /api/collect` - Collect single event
- `POST /api/collect/batch` - Collect multiple events

## 🔧 Configuration Options

### Backend Configuration
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `RATE_LIMIT_MAX_REQUESTS`: Rate limiting

### Frontend Configuration
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name

### Tracking Script Configuration
Edit `tracking-script/track.js`:

```javascript
const CONFIG = {
  apiUrl: 'http://localhost:5000/api/collect',
  debug: false,
  batchSize: 10,
  batchTimeout: 5000,
  sessionTimeout: 1800000
};
```

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Push code to GitHub
2. Connect your GitHub repo to hosting platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Push frontend code to GitHub
2. Connect repo to Vercel/Netlify
3. Set environment variables
4. Deploy

### Environment Variables for Production

Backend:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-production-jwt-secret
MONGODB_URI=your-production-mongodb-uri
NEON_DATABASE_URL=your-production-neon-uri
```

Frontend:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_APP_NAME=Analytics Dashboard
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 🛡️ Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **Database Security**: Use environment variables for credentials
3. **CORS**: Configure allowed origins properly
4. **Rate Limiting**: Adjust limits based on your needs
5. **HTTPS**: Always use HTTPS in production
6. **Data Privacy**: Consider GDPR compliance

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your connection strings
   - Verify network access (IP whitelist)
   - Ensure database user has proper permissions

2. **CORS Errors**
   - Check `FRONTEND_URL` in backend .env
   - Verify API URL in frontend .env

3. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token expiration settings

4. **Tracking Not Working**
   - Check website ID in script tag
   - Verify API URL in tracking script
   - Check browser console for errors

### Debug Mode

Enable debug mode in tracking script:
```javascript
const CONFIG = {
  debug: true, // Set to true
  // ... other config
};
```

## 📈 Features Overview

### Implemented Features
✅ User authentication (JWT)
✅ Website management
✅ Real-time event collection
✅ Data aggregation pipeline
✅ Interactive dashboard
✅ Responsive design
✅ API rate limiting
✅ Error handling

### Potential Enhancements
- Geographic location tracking
- Email reports
- Data export functionality
- Team collaboration
- Custom dashboards
- A/B testing tools
- Goal conversion tracking
- SEO insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check this README first
2. Look at the troubleshooting section
3. Check the GitHub issues
4. Create a new issue if needed

---

**Built with ❤️ using Next.js, Express.js, Neon PostgreSQL, and MongoDB Atlas**