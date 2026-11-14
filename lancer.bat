@echo off
chcp 65001 >nul
cd /d "%~dp0"
title TunEngineers

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n'est pas installe. Installez-le depuis https://nodejs.org puis relancez ce fichier.
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo [1/2] Premiere installation des dependances, patientez quelques minutes...
  call npm run install:all
  if errorlevel 1 goto erreur
)

if not exist "frontend\dist" (
  echo [2/2] Compilation du site...
  call npm run build
  if errorlevel 1 goto erreur
)

echo.
echo TunEngineers demarre : http://localhost:3000
echo Pour arreter le serveur : fermez cette fenetre ou appuyez sur Ctrl+C.
echo.
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm start
goto fin

:erreur
echo.
echo Une erreur est survenue. Copiez le message ci-dessus pour obtenir de l'aide.

:fin
pause
