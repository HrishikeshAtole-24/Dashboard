@echo off
echo 🚀 Starting Analytics Dashboard Setup...
echo.

echo 📋 Step 1: Installing Backend Dependencies...
cd backend_dash
call npm install
if errorlevel 1 (
    echo ❌ Backend installation failed!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed!
echo.

echo 📋 Step 2: Testing Database Connections...
cd backend_dash
node test-connections.js
if errorlevel 1 (
    echo ❌ Database connection test failed!
    echo 💡 Please check your .env file and database credentials
    pause
    exit /b 1
)
echo ✅ Database connections working!
echo.

echo 📋 Step 3: Installing Frontend Dependencies...
cd ..\frontend_dash
call npm install
if errorlevel 1 (
    echo ❌ Frontend installation failed!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed!
echo.

echo 🎉 Setup completed successfully!
echo.
echo 📖 Next steps:
echo 1. Start backend: cd backend_dash && npm run dev
echo 2. Start frontend: cd frontend_dash && npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
pause