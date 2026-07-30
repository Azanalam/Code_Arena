@echo off
cd /d C:\Users\Connect2Aryans\Documents\Workspace\Project\codearena
start "CodeArena-Next" cmd /c "npx next dev --port 3000"
start "CodeArena-Socket" cmd /c "npx tsx server.ts"
echo CodeArena is starting...
echo Next.js: http://localhost:3000
echo Socket.io: http://localhost:3002
pause