@echo off
echo "Please indicate the Youtube URL"
set /p Input=URL: 
echo.
node index.js -url "%Input%" -mp3
echo.