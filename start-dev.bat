@echo off
cd /d C:\Users\Connect2Aryans\Documents\Workspace\Project\codearena
start "CodeArena" cmd /c "npx tsx server.ts"
echo CodeArena is starting...
echo App + Socket.io: http://localhost:3000
pause