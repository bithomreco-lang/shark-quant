@echo off
title SHARK QUANT AI - Windows Desktop Installer v1.0.0
color 0B
cls
echo ==============================================================
echo           SHARK QUANT AI - OFFICIAL DESKTOP INSTALLER
echo ==============================================================
echo.
echo [1/3] Setting up installation directories...
set INSTALL_DIR=%LOCALAPPDATA%\SharkTradersAI
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/3] Registering Windows Desktop and Start Menu Shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$startMenu = [Environment]::GetFolderPath('StartMenu') + '\Programs'; " ^
  "$target = 'msedge.exe'; " ^
  "$args = '--app=https://shark-quant-backend-auw2-blue.vercel.app/app --window-size=430,890'; " ^
  "$s1 = $ws.CreateShortcut($desktop + '\Shark Traders AI.lnk'); " ^
  "$s1.TargetPath = $target; " ^
  "$s1.Arguments = $args; " ^
  "$s1.WindowStyle = 1; " ^
  "$s1.Description = 'Shark Quant AI Mobile Terminal on Desktop'; " ^
  "$s1.Save(); " ^
  "$s2 = $ws.CreateShortcut($startMenu + '\Shark Traders AI.lnk'); " ^
  "$s2.TargetPath = $target; " ^
  "$s2.Arguments = $args; " ^
  "$s2.Description = 'Shark Quant AI Mobile Terminal on Desktop'; " ^
  "$s2.Save();"

echo [3/3] Installation Complete!
echo.
echo ==============================================================
echo    SUCCESS! Shark Traders AI Desktop Icon has been placed 
echo    on your Windows Desktop and Start Menu.
echo ==============================================================
echo.
echo Launching tall phone terminal now...
timeout /t 1 >nul

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge --app="http://localhost:3000/app" --window-size=430,890 --user-data-dir="%LOCALAPPDATA%\SharkQuantProfile"
    exit
)

where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start chrome --app="http://localhost:3000/app" --window-size=430,890 --user-data-dir="%LOCALAPPDATA%\SharkQuantProfile"
    exit
)

start "" "http://localhost:3000/app"
exit
