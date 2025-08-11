@echo off
echo Starting BantayBarangay Malagutay Development Environment
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking MongoDB connection...
echo If MongoDB is not running, please start it first.
echo.

echo Starting the server...
cd server
start cmd /k "npm run dev"

echo.
echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak

echo Starting the client...
cd ..\client
start cmd /k "npm run dev"

echo.
echo Both server and client are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo Press any key to exit...
pause
