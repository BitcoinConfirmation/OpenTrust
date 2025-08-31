# Government Caller Registry API

This API provides a RESTful interface to interact with the GovernmentCallerRegistry smart contract on the blockchain. It allows for registering, revoking, and verifying government agency phone numbers.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file with the following variables:

```
# Blockchain Provider URL (Hardhat local node)
PROVIDER_URL=http://localhost:8545

# Contract Address (update after deployment)
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Private Key (this is the default hardhat development account)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# API Port
PORT=3001
```

3. Start the API server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### Health Check
- **GET /api/health**
  - Check if the API is running
  - Response: `{ "status": "OK", "message": "API is running" }`

### Register Phone Number
- **POST /api/register**
  - Register a phone number for an agency
  - Request Body:
    ```json
    {
      "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "phoneNumber": "+61000000",
      "agencyName": "Department of Example"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Phone number registered successfully",
      "data": {
        "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "phoneNumber": "+61000000",
        "agencyName": "Department of Example",
        "transactionHash": "0x..."
      }
    }
    ```

### Revoke Phone Number
- **POST /api/revoke**
  - Revoke a phone number from an agency
  - Request Body:
    ```json
    {
      "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Phone number revoked successfully",
      "data": {
        "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "phoneNumber": "+61000000",
        "transactionHash": "0x..."
      }
    }
    ```

### Verify Phone Number
- **GET /api/verify/:agency/:phoneNumber**
  - Verify if a phone number belongs to an agency
  - Example: `/api/verify/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/+61000000`
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "phoneNumber": "+61000000",
        "isValid": true,
        "agencyName": "Department of Example"
      }
    }
    ```

### Get Agency Name by Phone Number
- **GET /api/agency/:phoneNumber**
  - Get agency name by phone number
  - Example: `/api/agency/+61000000`
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "phoneNumber": "+61000000",
        "agencyName": "Department of Example"
      }
    }
    ```

### Get Phone Number by Agency Address
- **GET /api/phone/:agency**
  - Get phone number by agency address
  - Example: `/api/phone/0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "phoneNumber": "+61000000"
      }
    }
    ```

## Error Handling

All endpoints return appropriate error messages in case of failures:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Authorization

The API uses the blockchain's native authorization mechanism. Only the contract owner can register or revoke phone numbers. The owner's private key is used to sign transactions.
