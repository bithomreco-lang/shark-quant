@echo off
title SHARK QUANT AI - Desktop Terminal Launcher
color 0A
cls
echo ==============================================================
echo           SHARK QUANT AI - INSTITUTIONAL DESKTOP TERMINAL
echo ==============================================================
echo.
echo Launching standalone trading engine in dedicated native window...
echo.

:: Detect target host (localhost vs live production)
set TARGET_URL=http://localhost:3000/app

:: Check if Microsoft Edge is available (installed on all Windows 10/11)
where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge --app="%TARGET_URL%" --window-size=1280,820 --user-data-dir="%LOCALAPPDATA%\SharkQuantApp"
    goto done
)

:: Fallback to Google Chrome
where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start chrome --app="%TARGET_URL%" --window-size=1280,820 --user-data-dir="%LOCALAPPDATA%\SharkQuantApp"
    goto done
)

:: Default browser fallback
start "" "%TARGET_URL%"

:done
echo [OK] Shark Quant Desktop App is active.
timeout /t 2 >nul
exit

