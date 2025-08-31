# Government Caller Registry Demo

This project demonstrates a blockchain-based verification system for government phone numbers. It allows users to verify if a phone number belongs to a registered government agency.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- PowerShell (for Windows) or Bash (for Linux/Mac)

## Quick Start

Run the all-in-one testing script:

### Windows (PowerShell)

```
.\Test-All.ps1
```

This script will:
1. Start a local Hardhat blockchain node
2. Deploy the Government Caller Registry contract
3. Register test phone numbers
4. Start the test blockchain API server
5. Start a web server for the demo UI
6. Open the verification page in your browser

## Test Phone Numbers

The following test phone numbers are pre-registered in the system:

- `+1-202-555-0101` - Federal Bureau of Investigation
- `+1-202-555-0102` - Department of Homeland Security
- `+1-202-555-0103` - Internal Revenue Service

## Manual Setup

If you prefer to set up each component manually:

1. **Start the local blockchain**:
   ```
   npx hardhat node
   ```

2. **Deploy the contract**:
   ```
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. **Register test phone numbers**:
   ```
   node scripts/register-test-phones.js
   ```

4. **Start the test blockchain API server** (optional fallback):
   ```
   node api/test-blockchain-api.js
   ```

5. **Start the web server for the UI**:
   ```
   npx http-server app-demo -p 8080 -c-1
   ```

6. Open your browser and navigate to:
   - Verification page: http://localhost:8080/verify.html
   - Admin page: http://localhost:8080/index.html

## Troubleshooting

If you encounter connectivity issues:

1. **Debug using the verification page**:
   - Click "Show Debug Information" on the verification page to see connection details
   - Check browser console for detailed error messages

2. **Contract deployment issues**:
   - Ensure your local blockchain is running
   - Check if your contract was deployed successfully by looking for the contract address in the console

3. **CORS issues**:
   - If you see CORS errors in the console, ensure the API server is running with CORS enabled
   - Try using the test blockchain API server as a fallback

4. **Verification not working**:
   - The system will automatically try multiple verification methods:
     1. Direct blockchain verification
     2. API server verification 
     3. Fallback test data

## Project Structure

- `contracts/` - Smart contract code
- `scripts/` - Deployment and testing scripts
- `app-demo/` - Web UI for verification and administration
- `api/` - API server and blockchain interaction code
- `test/` - Contract test cases
