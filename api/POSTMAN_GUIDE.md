# Government Caller Registry API - Postman Guide

This guide will help you test the Government Caller Registry API using Postman.

## Prerequisites

1. Make sure the API server is running
2. Make sure a local Hardhat node is running
3. The contract should be deployed with the address configured in the .env file

## Setting up Postman

1. Import a new collection in Postman
2. Set up a collection variable:
   - `baseUrl`: `http://localhost:3001/api`

## Endpoints to Test

### 1. Health Check

- **GET** `{{baseUrl}}/health`
- **Description**: Check if the API is running

### 2. Register Phone Number

- **POST** `{{baseUrl}}/register`
- **Body** (raw JSON):
  ```json
  {
    "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "phoneNumber": "+61000000",
    "agencyName": "Department of Example"
  }
  ```

### 3. Verify Phone Number

- **GET** `{{baseUrl}}/verify/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/+61000000`
- **Description**: Verify if the phone number belongs to the agency

### 4. Get Agency Name by Phone

- **GET** `{{baseUrl}}/agency/+61000000`
- **Description**: Get the name of the agency associated with a phone number

### 5. Get Phone Number by Agency

- **GET** `{{baseUrl}}/phone/0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Description**: Get the phone number associated with an agency address

### 6. Revoke Phone Number

- **POST** `{{baseUrl}}/revoke`
- **Body** (raw JSON):
  ```json
  {
    "agency": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
  ```

## Testing Flow

1. Start with the Health Check to ensure the API is running
2. Register a phone number for an agency
3. Verify the phone number was registered correctly
4. Get the agency name using the phone number
5. Get the phone number using the agency address
6. Revoke the phone number
7. Verify the phone number was successfully revoked

## Common Error Cases to Test

1. Try to register a phone number that's already registered
2. Try to get information for a non-registered phone number
3. Try to revoke a phone number from an agency that doesn't have one registered
4. Use invalid Ethereum addresses in your requests

## Response Format

All responses follow a consistent format:

- Success response:
  ```json
  {
    "success": true,
    "message": "Operation successful message",
    "data": {
      // Response data
    }
  }
  ```

- Error response:
  ```json
  {
    "success": false,
    "message": "Error message",
    "error": "Detailed error information"
  }
  ```
