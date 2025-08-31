# Government Caller Registry API CLI Test Script
# This script tests all API endpoints using PowerShell commands

$baseUrl = "http://localhost:3001/api"
$agency1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
$agency2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
$nonRegistered = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
$phone1 = "+61000000"
$phone2 = "+61111111"
$agencyName1 = "Department of Example"
$agencyName2 = "Ministry of Testing"

Write-Host "===== Government Caller Registry API CLI Test =====" -ForegroundColor Cyan
Write-Host "Testing all API endpoints using PowerShell..." -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Green
$healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Write-Host "   Status: $($healthResponse.status)"
Write-Host "   Message: $($healthResponse.message)"
Write-Host "   ✅ Health Check Successful"
Write-Host ""

# 2. Register Phone Numbers
Write-Host "2. Testing Phone Number Registration..." -ForegroundColor Green

# Register first agency
$registerData1 = @{
    agency = $agency1
    phoneNumber = $phone1
    agencyName = $agencyName1
} | ConvertTo-Json

Write-Host "   Registering $phone1 for $agencyName1..."
try {
    $registerResponse1 = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $registerData1 -ContentType "application/json"
    Write-Host "   ✅ Registration Successful"
    Write-Host "   Transaction Hash: $($registerResponse1.data.transactionHash)"
} catch {
    Write-Host "   ❌ Registration Failed: $_" -ForegroundColor Red
}

# Register second agency
$registerData2 = @{
    agency = $agency2
    phoneNumber = $phone2
    agencyName = $agencyName2
} | ConvertTo-Json

Write-Host "   Registering $phone2 for $agencyName2..."
try {
    $registerResponse2 = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $registerData2 -ContentType "application/json"
    Write-Host "   ✅ Registration Successful"
    Write-Host "   Transaction Hash: $($registerResponse2.data.transactionHash)"
} catch {
    Write-Host "   ❌ Registration Failed: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Verify Phone Numbers
Write-Host "3. Testing Phone Number Verification..." -ForegroundColor Green

# Valid verification
Write-Host "   Verifying $phone1 for $agency1..."
try {
    $validVerifyResponse = Invoke-RestMethod -Uri "$baseUrl/verify/$agency1/$phone1" -Method Get
    Write-Host "   Is Valid: $($validVerifyResponse.data.isValid)"
    Write-Host "   Agency Name: $($validVerifyResponse.data.agencyName)"
} catch {
    Write-Host "   ❌ Verification Failed: $_" -ForegroundColor Red
}

# Invalid verification (wrong phone)
Write-Host "   Verifying $phone2 for $agency1 (should be invalid)..."
try {
    $invalidVerifyResponse = Invoke-RestMethod -Uri "$baseUrl/verify/$agency1/$phone2" -Method Get
    Write-Host "   Is Valid: $($invalidVerifyResponse.data.isValid)"
} catch {
    Write-Host "   ❌ Verification Failed: $_" -ForegroundColor Red
}

# Unregistered agency verification
Write-Host "   Verifying $phone1 for non-registered agency (should be invalid)..."
try {
    $unregVerifyResponse = Invoke-RestMethod -Uri "$baseUrl/verify/$nonRegistered/$phone1" -Method Get
    Write-Host "   Is Valid: $($unregVerifyResponse.data.isValid)"
} catch {
    Write-Host "   ❌ Verification Failed: $_" -ForegroundColor Red
}
Write-Host "   ✅ Verification Tests Successful"
Write-Host ""

# 4. Get Agency by Phone
Write-Host "4. Testing Get Agency by Phone..." -ForegroundColor Green
try {
    $agencyResponse = Invoke-RestMethod -Uri "$baseUrl/agency/$phone1" -Method Get
    Write-Host "   Phone Number: $($agencyResponse.data.phoneNumber)"
    Write-Host "   Agency Name: $($agencyResponse.data.agencyName)"
    Write-Host "   ✅ Get Agency Successful"
} catch {
    Write-Host "   ❌ Get Agency Failed: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Get Phone by Agency
Write-Host "5. Testing Get Phone by Agency..." -ForegroundColor Green
try {
    $phoneResponse = Invoke-RestMethod -Uri "$baseUrl/phone/$agency1" -Method Get
    Write-Host "   Agency: $($phoneResponse.data.agency)"
    Write-Host "   Phone Number: $($phoneResponse.data.phoneNumber)"
    Write-Host "   ✅ Get Phone Successful"
} catch {
    Write-Host "   ❌ Get Phone Failed: $_" -ForegroundColor Red
}
Write-Host ""

# 6. Revoke Phone Number
Write-Host "6. Testing Phone Number Revocation..." -ForegroundColor Green

$revokeData = @{
    agency = $agency1
} | ConvertTo-Json

Write-Host "   Revoking phone for $agency1..."
try {
    $revokeResponse = Invoke-RestMethod -Uri "$baseUrl/revoke" -Method Post -Body $revokeData -ContentType "application/json"
    Write-Host "   ✅ Revocation Successful"
    Write-Host "   Transaction Hash: $($revokeResponse.data.transactionHash)"
} catch {
    Write-Host "   ❌ Revocation Failed: $_" -ForegroundColor Red
}

# Verify revocation
Write-Host "   Verifying revocation (should fail now)..."
try {
    $verifyRevokeResponse = Invoke-RestMethod -Uri "$baseUrl/phone/$agency1" -Method Get
    Write-Host "   ❌ Revocation Failed: Phone still registered" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Revocation Verified: Phone no longer registered"
}
Write-Host ""

Write-Host "===== All API tests completed! =====" -ForegroundColor Cyan
