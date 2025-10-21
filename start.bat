@echo off
echo 🚀 Starting Analytics Dashboard...
echo.

echo 📋 Starting Backend Server...
start "Backend Server" cmd /k "cd backend_dash && npm run dev"

echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo 📋 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend_dash && npm run dev"

echo.
echo 🎉 Both servers are starting!
echo.
echo 📖 Access your application:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
echo 💡 Check the opened terminal windows for logs
echo 💡 Press Ctrl+C in each terminal to stop the servers
echo.
pause