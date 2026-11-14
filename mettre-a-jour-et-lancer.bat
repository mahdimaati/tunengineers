@echo off
chcp 65001 >nul
cd /d "%~dp0"
title TunEngineers - mise a jour
echo Recompilation du site (a faire apres une modification du dossier frontend)...
call npm run build
if errorlevel 1 (
  echo.
  echo Erreur de compilation. Copiez le message ci-dessus pour obtenir de l'aide.
  pause
  exit /b 1
)
echo.
echo Compilation terminee. Lancement du serveur...
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm start
pause
