# Government Caller Registry API Manual CLI Commands

This document provides individual curl commands that you can run in your terminal to test the Government Caller Registry API.

## Prerequisites

1. Make sure the API server is running (`npm start` in the api directory)
2. Make sure a local Hardhat node is running (`npx hardhat node` in the project root)
3. The contract should be deployed to the local node

## Test Commands

### 1. Health Check
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get | ConvertTo-Json

# CMD (with curl)
curl -X GET http://localhost:3001/api/health
```

### 2. Register Phone Number
```powershell
# PowerShell
$registerData = @{
    agency = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    phoneNumber = "+61000000"
    agencyName = "Department of Example"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/register" -Method Post -Body $registerData -ContentType "application/json" | ConvertTo-Json

# CMD (with curl)
curl -X POST http://localhost:3001/api/register -H "Content-Type: application/json" -d "{\"agency\":\"0x70997970C51812dc3A010C7d01b50e0d17dc79C8\",\"phoneNumber\":\"+61000000\",\"agencyName\":\"Department of Example\"}"
```

### 3. Verify Phone Number
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/verify/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/+61000000" -Method Get | ConvertTo-Json

# CMD (with curl)
curl -X GET http://localhost:3001/api/verify/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/+61000000
```

### 4. Get Agency Name by Phone
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/agency/+61000000" -Method Get | ConvertTo-Json

# CMD (with curl)
curl -X GET http://localhost:3001/api/agency/+61000000
```

### 5. Get Phone Number by Agency
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/phone/0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -Method Get | ConvertTo-Json

# CMD (with curl)
curl -X GET http://localhost:3001/api/phone/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### 6. Revoke Phone Number
```powershell
# PowerShell
$revokeData = @{
    agency = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/revoke" -Method Post -Body $revokeData -ContentType "application/json" | ConvertTo-Json

# CMD (with curl)
curl -X POST http://localhost:3001/api/revoke -H "Content-Type: application/json" -d "{\"agency\":\"0x70997970C51812dc3A010C7d01b50e0d17dc79C8\"}"
```

## Testing Flow

1. Start with the Health Check to ensure the API is running
2. Register a phone number for an agency
3. Verify the phone number was registered correctly
4. Get the agency name using the phone number
5. Get the phone number using the agency address
6. Revoke the phone number
7. Try to get the phone number again (should fail)

## Example Test Session

```powershell
# 1. Health Check
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get

# 2. Register Phone Number
$registerData = @{
    agency = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    phoneNumber = "+61000000"
    agencyName = "Department of Example"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/register" -Method Post -Body $registerData -ContentType "application/json"

# 3. Verify Phone Number
Invoke-RestMethod -Uri "http://localhost:3001/api/verify/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/+61000000" -Method Get

# 4. Get Agency Name by Phone
Invoke-RestMethod -Uri "http://localhost:3001/api/agency/+61000000" -Method Get

# 5. Get Phone Number by Agency
Invoke-RestMethod -Uri "http://localhost:3001/api/phone/0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -Method Get

# 6. Revoke Phone Number
$revokeData = @{
    agency = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/revoke" -Method Post -Body $revokeData -ContentType "application/json"

# 7. Try to get phone number again (should fail)
try {
    Invoke-RestMethod -Uri "http://localhost:3001/api/phone/0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -Method Get
    Write-Host "This should have failed!"
} catch {
    Write-Host "Successfully verified phone number was revoked: $_"
}
```
