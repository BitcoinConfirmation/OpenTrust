# Government Caller Registry

A blockchain-based system for registering and verifying government agency phone numbers.

## Project Overview

This project provides a solution for government agencies to register their phone numbers on the blockchain, allowing citizens to verify the authenticity of calls they receive from government agencies. The system consists of:

1. **Smart Contract**: A Solidity contract that stores and manages phone number registrations
2. **REST API**: An Express.js server that provides endpoints for interacting with the contract
3. **SDK**: A TypeScript SDK for developers to integrate with the system
4. **CLI Tools**: PowerShell scripts for testing and interacting with the API

## Project Structure

- `contracts/`: Smart contracts
  - `GovernmentCallerRegistry.sol`: Main contract for phone number registration and verification
- `scripts/`: Hardhat scripts
  - `deploy.ts`: Deploy the contract
  - `demo.ts`: Run a demo of the contract
- `test/`: Tests
  - `GovernmentCallerRegistry.test.ts`: Contract tests
- `sdk/`: TypeScript SDK
  - `GovernmentCallerVerifier.ts`: SDK for contract interaction
- `api/`: REST API
  - `server.js`: Express server
  - `blockchain.js`: Blockchain interaction utilities
  - `test-cli.ps1`: PowerShell CLI testing script
  - `MANUAL_CLI_COMMANDS.md`: Individual CLI commands for testing
- `Start-Environment.ps1`: Script to start the entire environment

## Prerequisites

- Node.js (v16+)
- npm (v8+)
- PowerShell v5.1 or later (for Windows users)
- Hardhat

## Installation

1. Clone the repository
2. Install project dependencies:

```bash
npm install
```

3. Install API dependencies:

```bash
cd api
npm install
cd ..
```

## Quick Start

The easiest way to get everything running is to use the provided `Start-Environment.ps1` script:

```powershell
.\Start-Environment.ps1
```

This script will:
1. Start a local Hardhat blockchain node
2. Deploy the GovernmentCallerRegistry contract
3. Start the API server
4. Display connection information

Once everything is running, you can test the API using the test-cli.ps1 script:

```powershell
cd api
.\test-cli.ps1
```

## Manual Setup

If you prefer to start the components manually:

1. Start a local Hardhat node:
   ```
   npx hardhat node
   ```

2. In a new terminal, deploy the contract:
   ```
   npx hardhat run --network localhost scripts/deploy.ts
   ```

3. In a new terminal, start the API server:
   ```
   cd api
   npm start
   ```

## Smart Contract

The `GovernmentCallerRegistry` contract provides the following functionality:

- Register phone numbers for government agencies
- Revoke phone numbers
- Verify if a phone number belongs to a specific agency
- Query agency information by phone number or address

### Deployment

To deploy the contract:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Testing

To run tests:

```bash
npx hardhat test
```

### Demo

To run a demo:

```bash
npx hardhat run scripts/demo.ts --network localhost
```

## API

The API provides a RESTful interface to interact with the smart contract.

### API Endpoints

The API server runs on http://localhost:3001 and provides the following endpoints:

- `GET /api/health`: API health check
- `POST /api/register`: Register a phone number
- `POST /api/revoke`: Revoke a phone number
- `GET /api/verify/:agency/:phoneNumber`: Verify if a phone number belongs to an agency
- `GET /api/agency/:phoneNumber`: Get agency name by phone number
- `GET /api/phone/:agency`: Get phone number by agency address

### Testing the API

#### Using the CLI Test Script

```powershell
cd api
.\test-cli.ps1
```

This script will run through all API endpoints and verify that they work as expected.

#### Using Individual Commands

Refer to `api/MANUAL_CLI_COMMANDS.md` for individual PowerShell and curl commands you can use to test each endpoint.

## Development

### Modifying the Smart Contract

1. Edit the contract in `contracts/GovernmentCallerRegistry.sol`
2. Compile the contract: `npx hardhat compile`
3. Run tests: `npx hardhat test`
4. Deploy the contract: `npx hardhat run --network localhost scripts/deploy.ts`

### Modifying the API

1. Edit the API server in `api/server.js`
2. Restart the API server to apply changes

## License

MIT
