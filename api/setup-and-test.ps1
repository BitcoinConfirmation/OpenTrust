# Government Caller Registry API Setup and Test Script
# This script sets up the environment and runs the API server

Write-Host "===== Setting up Government Caller Registry API Environment =====" -ForegroundColor Cyan

# Check if Hardhat is already running in another terminal
Write-Host "Checking if Hardhat node is already running..." -ForegroundColor Yellow
$hardhatRunning = $false
try {
    $hardhatCheck = Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ContentType "application/json" -ErrorAction SilentlyContinue
    if ($hardhatCheck) {
        Write-Host "Hardhat node is already running. Will use existing node." -ForegroundColor Green
        $hardhatRunning = $true
    }
} catch {
    Write-Host "Hardhat node not detected. Will start a new one." -ForegroundColor Yellow
}

# Start Hardhat node if not already running
if (-not $hardhatRunning) {
    Write-Host "Starting Hardhat node in a new terminal..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command cd ..; npx hardhat node"
    
    # Wait for node to start
    Write-Host "Waiting for Hardhat node to start (5 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Deploy contract
Write-Host "Deploying the contract to the local Hardhat node..." -ForegroundColor Yellow
node deploy.js

# Check if server dependencies are installed
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing API server dependencies..." -ForegroundColor Yellow
    npm install
}

# Offer to start the server
$startServer = Read-Host -Prompt "Do you want to start the API server now? (y/n)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host "Starting API server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-Command cd '$pwd'; npm start"
    
    # Wait for server to start
    Write-Host "Waiting for API server to start (3 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Offer to run CLI tests
    $runTests = Read-Host -Prompt "Do you want to run CLI tests against the API? (y/n)"
    if ($runTests -eq "y" -or $runTests -eq "Y") {
        Write-Host "Running CLI tests..." -ForegroundColor Green
        .\test-cli.ps1
    } else {
        Write-Host "You can run the tests manually with: .\test-cli.ps1" -ForegroundColor Cyan
    }
} else {
    Write-Host "You can start the server manually with: npm start" -ForegroundColor Cyan
    Write-Host "After starting the server, you can run tests with: .\test-cli.ps1" -ForegroundColor Cyan
}

Write-Host "===== Setup Complete =====" -ForegroundColor Cyan
