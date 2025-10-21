# 🔐 Database Setup Instructions

## Quick Setup Steps

### 1. 📝 Update MongoDB Password
Edit `backend_dash/.env` and replace `YOUR_PASSWORD` with your actual MongoDB password:

```env
MONGODB_URI=mongodb+srv://hrishikesh24:YOUR_ACTUAL_PASSWORD@ecommdashboard.q0gk1.mongodb.net/dashboard?retryWrites=true&w=majority
```

### 2. 🔍 Find Your MongoDB Password
- Go to [MongoDB Atlas](https://cloud.mongodb.com/)
- Login to your account
- Go to Database Access → Users
- Find user `hrishikesh24`
- If needed, edit user and set a new password

### 3. ✅ Test Connections
Run this command from the main Dashboard folder:
```bash
cd backend_dash
node test-connections.js
```

### 4. 🚀 Start the Application
Run the setup script:
```bash
setup.bat
```

Then start both servers:
```bash
start.bat
```

## 📋 Connection Details

### MongoDB Atlas ✅
- **Cluster**: ecommdashboard.q0gk1.mongodb.net
- **Username**: hrishikesh24
- **Database**: analytics_dashboard
- **Status**: Connection string configured

### Neon PostgreSQL ✅  
- **Host**: ep-holy-wave-a4ebo9ma-pooler.us-east-1.aws.neon.tech
- **Username**: neondb_owner
- **Database**: neondb
- **Status**: Connection string configured

## 🛠️ Manual Setup (Alternative)

If the batch files don't work:

### Backend:
```bash
cd backend_dash
npm install
npm run dev
```

### Frontend (new terminal):
```bash
cd frontend_dash  
npm install
npm run dev
```

## 🎯 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🔧 Troubleshooting

### MongoDB Connection Issues:
1. Check password in `.env` file
2. Verify IP whitelist in MongoDB Atlas
3. Check network access settings

### Neon PostgreSQL Issues:
1. Connection string should work as-is
2. Check firewall settings
3. Verify SSL settings

### Port Issues:
- Backend uses port 5000
- Frontend uses port 3000
- Make sure these ports are available

## 🆘 Need Help?

If you see any errors:
1. Check the terminal output for specific error messages
2. Verify environment variables in `.env` files
3. Check database credentials and network access
4. Run `node test-connections.js` to diagnose connection issues