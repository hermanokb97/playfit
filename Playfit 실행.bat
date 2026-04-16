@echo off
chcp 65001 >nul
title Playfit - 함께 놀아요!

echo.
echo  ========================================
echo    🎮  Playfit - 함께 놀아요!
echo  ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo  📦  처음 실행이라 준비 중이에요... 잠시만 기다려주세요!
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  ❌  설치에 실패했어요. Node.js가 설치되어 있는지 확인해주세요.
        echo     https://nodejs.org 에서 다운로드할 수 있어요.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  ✅  준비 완료!
    echo.
)

echo  🚀  Playfit을 시작합니다...
echo  🌐  브라우저가 자동으로 열릴 거예요!
echo.
echo  ⚠️  이 창을 닫으면 Playfit이 종료됩니다.
echo  ========================================
echo.

call npx vite --open
