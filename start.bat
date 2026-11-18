@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installation des dependances...
  call npm install
)
echo Demarrage de la blockchain locale...
start "Blockchain locale (ne pas fermer)" cmd /k npx hardhat node
timeout /t 12 /nobreak >nul
echo Deploiement du contrat...
call npx hardhat run scripts/deploy.js --network localhost
echo Demarrage du site...
start "Site Vote (ne pas fermer)" cmd /k "cd frontend && npx --yes serve -l 5174 ."
timeout /t 6 /nobreak >nul
start http://localhost:5174
echo.
echo Pret : http://localhost:5174  (MetaMask : reseau http://127.0.0.1:8545, chain id 31337)
pause
