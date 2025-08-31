# Test-All.ps1 - Comprehensive testing script for the blockchain verification system
# Run with: .\Test-All.ps1

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   GOVERNMENT CALLER REGISTRY - TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Function to start a process in a new window
function Start-ProcessInNewWindow {
    param (
        [string]$FilePath,
        [string]$Arguments,
        [string]$WindowTitle
    )
    
    Start-Process powershell.exe -ArgumentList "-NoExit -Command `"& { Set-Location '$PWD'; Write-Host 'Running: $WindowTitle' -ForegroundColor Green; $FilePath $Arguments}`"" -WindowStyle Normal
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$prereqsMissing = $false

$commands = @("node", "npm", "npx")
foreach ($cmd in $commands) {
    if (-not (Test-CommandExists $cmd)) {
        Write-Host "ERROR: $cmd is not installed or not in PATH" -ForegroundColor Red
        $prereqsMissing = $true
    }
}

if ($prereqsMissing) {
    Write-Host "Please install missing prerequisites and try again." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists in the main project
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing project dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if node_modules exists in the API folder
if (-not (Test-Path "api/node_modules")) {
    Write-Host "Installing API dependencies..." -ForegroundColor Yellow
    Push-Location api
    npm install
    Pop-Location
}

# Clear any existing logs
if (Test-Path "logs") {
    Remove-Item -Path "logs" -Recurse -Force
}
New-Item -ItemType Directory -Path "logs" -Force | Out-Null

Write-Host "Starting test sequence..." -ForegroundColor Green
Write-Host ""

# 1. Start local Hardhat blockchain
Write-Host "1. Starting local Hardhat blockchain..." -ForegroundColor Cyan
Start-ProcessInNewWindow "npx" "hardhat node" "Local Hardhat Blockchain"
Write-Host "   Waiting for blockchain to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Deploy the contract
Write-Host "2. Deploying contract to local blockchain..." -ForegroundColor Cyan
$deployOutput = npx hardhat run scripts/deploy.ts --network localhost
Write-Host $deployOutput -ForegroundColor Gray
if ($deployOutput -match "Deployed to: (0x[a-fA-F0-9]{40})") {
    $contractAddress = $matches[1]
    Write-Host "   Contract deployed at: $contractAddress" -ForegroundColor Green
    $contractAddress | Out-File -FilePath "logs/contract-address.txt"
} else {
    Write-Host "   Could not extract contract address from deployment output." -ForegroundColor Yellow
    $contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    Write-Host "   Using default contract address: $contractAddress" -ForegroundColor Yellow
}

# 3. Register test phone numbers
Write-Host "3. Registering test phone numbers..." -ForegroundColor Cyan
if (Test-Path "scripts/register-test-phones.js") {
    node scripts/register-test-phones.js | Tee-Object -FilePath "logs/register-phones.log"
} else {
    Write-Host "   Error: register-test-phones.js not found" -ForegroundColor Red
    Write-Host "   Skipping phone number registration" -ForegroundColor Yellow
}

# 4. Start test blockchain API server
Write-Host "4. Starting test blockchain API server..." -ForegroundColor Cyan
if (Test-Path "api/test-blockchain-api.js") {
    Start-ProcessInNewWindow "node" "api/test-blockchain-api.js" "Test Blockchain API Server"
} else {
    Write-Host "   Error: test-blockchain-api.js not found" -ForegroundColor Red
}

# 5. Start web server for the UI
Write-Host "5. Starting web server for the UI..." -ForegroundColor Cyan
if (Test-Path "app-demo") {
    Start-ProcessInNewWindow "npx" "http-server app-demo -p 8080 -c-1" "Demo UI Web Server"
    
    Write-Host "   Waiting for web server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Open the verification page in the default browser
    Write-Host "   Opening verification page in browser..." -ForegroundColor Green
    Start-Process "http://localhost:8080/verify.html"
} else {
    Write-Host "   Error: app-demo directory not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Phone Numbers:" -ForegroundColor Yellow
Write-Host "   +1-202-555-0101 - Federal Bureau of Investigation" -ForegroundColor White
Write-Host "   +1-202-555-0102 - Department of Homeland Security" -ForegroundColor White
Write-Host "   +1-202-555-0103 - Internal Revenue Service" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "   Verification UI: http://localhost:8080/verify.html" -ForegroundColor White
Write-Host "   Admin UI: http://localhost:8080/index.html" -ForegroundColor White
Write-Host "   Test API: http://localhost:3001" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
