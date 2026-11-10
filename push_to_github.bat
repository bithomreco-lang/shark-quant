@echo off
title Push Shark Quant to GitHub
cd /d "%~dp0"
echo ========================================================
echo   SHARK QUANT AI - Push Repository to GitHub
echo ========================================================
echo.
git config user.name "bithomreco-lang"
git config user.email "bithomreco@gmail.com"
git status
echo.
echo Pushing branch 'main' to https://github.com/bithomreco-lang/shark-quant.git ...
git push -f origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Your repository is now fully uploaded to GitHub!
    echo Next step: Go to https://vercel.com/dashboard and watch your deployment go live!
) else (
    echo [NOTE] If prompted, please complete GitHub sign-in in your browser window.
)
pause
