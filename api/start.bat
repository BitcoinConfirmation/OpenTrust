@echo off
echo Starting Government Caller Registry API...

REM Start a new terminal with Hardhat node
start powershell.exe -Command "cd .. ; npx hardhat node"

REM Wait for node to start
echo Waiting for Hardhat node to start...
timeout /t 5 /nobreak > nul

REM Deploy the contract
echo Deploying the contract...
node deploy.js

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  npm install
)

REM Start the API server
echo Starting API server...
npm start
