# Start-Environment.ps1 - Run the entire blockchain environment and API server
# This script starts the local Hardhat node, deploys the contract, and starts the API server

# Function to check if a process is running on a given port
function Test-PortInUse {
    param (
        [int] $Port
    )
    
    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port.*LISTENING"
    return ($connections -ne $null)
}

# Function to create a new PowerShell window and run a command
function Start-ProcessInNewWindow {
    param (
        [string] $WorkingDirectory,
        [string] $Command,
        [string] $WindowTitle
    )
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-NoExit -Command `"cd '$WorkingDirectory'; Write-Host 'Running: $Command' -ForegroundColor Cyan; $Command`""
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    $process = [System.Diagnostics.Process]::Start($psi)
    return $process
}

# Set the project root directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if hardhat node is already running
if (Test-PortInUse -Port 8545) {
    Write-Host "A process is already running on port 8545. Hardhat node may already be running." -ForegroundColor Yellow
} else {
    # Start the hardhat node in a new window
    Write-Host "Starting Hardhat node in a new window..." -ForegroundColor Green
    $hardhatProcess = Start-ProcessInNewWindow -WorkingDirectory $projectRoot -Command "npx hardhat node" -WindowTitle "Hardhat Node"
    
    # Wait for the hardhat node to start
    Write-Host "Waiting for Hardhat node to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Deploy the contract
Write-Host "Deploying the contract..." -ForegroundColor Green
Push-Location $projectRoot
npx hardhat run --network localhost scripts/deploy.ts
Pop-Location

# Check if API server is already running
if (Test-PortInUse -Port 3001) {
    Write-Host "A process is already running on port 3001. API server may already be running." -ForegroundColor Yellow
} else {
    # Start the API server in a new window
    Write-Host "Starting API server in a new window..." -ForegroundColor Green
    $apiProcess = Start-ProcessInNewWindow -WorkingDirectory "$projectRoot\api" -Command "npm start" -WindowTitle "API Server"
}

Write-Host ""
Write-Host "=========================================================================================" -ForegroundColor Cyan
Write-Host "Environment is running!" -ForegroundColor Green
Write-Host "- Hardhat Node: http://localhost:8545" -ForegroundColor Cyan
Write-Host "- API Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "=========================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now test the API using the test-cli.ps1 script:" -ForegroundColor Yellow
Write-Host "  .\test-cli.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or use individual commands from MANUAL_CLI_COMMANDS.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop this script (Note: the other windows will remain running)" -ForegroundColor Red
Write-Host ""

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
} finally {
    Write-Host "Script stopped. The Hardhat node and API server are still running in their own windows." -ForegroundColor Yellow
    Write-Host "To stop them, close their respective windows or use Task Manager." -ForegroundColor Yellow
}
