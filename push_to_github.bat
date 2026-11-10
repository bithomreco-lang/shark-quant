@echo off
title Push Shark Quant to GitHub
cd /d "%~dp0"
echo ========================================================
echo   SHARK QUANT AI - Push Repository to GitHub
echo ========================================================
echo.
git status
echo.
echo Pushing branch 'main' to https://github.com/bithomreco-lang/shark-quant.git ...
git push -f origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Your repository is now fully uploaded to GitHub!
    echo Next step: Go to https://vercel.com/new and import bithomreco-lang/shark-quant
) else (
    echo [NOTE] If prompted, please complete GitHub sign-in in your browser window.
)
pause

