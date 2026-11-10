#!/bin/bash
# -------------------------------------------------------------
# SHARK QUANT AI - macOS Standalone Desktop Terminal Launcher
# -------------------------------------------------------------
clear
echo "=============================================================="
echo "          SHARK QUANT AI - MACOS DESKTOP TERMINAL             "
echo "=============================================================="
echo ""
echo "Launching standalone window..."

TARGET_URL="https://shark-quant-backend-auw2-blue.vercel.app/app"

# Try opening in Chrome App Mode
if [ -d "/Applications/Google Chrome.app" ]; then
    open -n -a "Google Chrome" --args --app="$TARGET_URL" --window-size=1280,820
elif [ -d "/Applications/Brave Browser.app" ]; then
    open -n -a "Brave Browser" --args --app="$TARGET_URL" --window-size=1280,820
elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -n -a "Microsoft Edge" --args --app="$TARGET_URL" --window-size=1280,820
else
    open "$TARGET_URL"
fi

echo "[OK] Standalone window launched."
osascript -e 'tell application "Terminal" to close (every window whose name contains "SharkTradersAI-Mac")' & exit

