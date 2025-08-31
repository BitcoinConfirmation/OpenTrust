const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const API_URL = 'http://localhost:3001/api';

// Sample agency addresses (using Hardhat's default accounts)
const agencies = {
  agency1: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  agency2: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  nonRegistered: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
};

// Sample phone numbers and agency names
const agencies_data = [
  {
    agency: agencies.agency1,
    phoneNumber: '+61000000',
    agencyName: 'Department of Example'
  },
  {
    agency: agencies.agency2,
    phoneNumber: '+61111111',
    agencyName: 'Ministry of Testing'
  }
];

async function testAPI() {
  try {
    console.log('Testing Government Caller Registry API...\n');
    
    // 1. Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('   Status:', healthResponse.data.status);
    console.log('   Message:', healthResponse.data.message);
    console.log('   ✅ Health Check Successful\n');
    
    // 2. Register Phone Numbers
    console.log('2. Testing Phone Number Registration...');
    for (const data of agencies_data) {
      console.log(`   Registering ${data.phoneNumber} for ${data.agencyName}...`);
      const registerResponse = await axios.post(`${API_URL}/register`, data);
      console.log('   ✅ Registration Successful');
      console.log('   Transaction Hash:', registerResponse.data.data.transactionHash);
    }
    console.log('');
    
    // 3. Verify Phone Numbers
    console.log('3. Testing Phone Number Verification...');
    
    // Valid verification
    const valid = agencies_data[0];
    console.log(`   Verifying ${valid.phoneNumber} for ${valid.agency}...`);
    const validVerifyResponse = await axios.get(`${API_URL}/verify/${valid.agency}/${valid.phoneNumber}`);
    console.log('   Is Valid:', validVerifyResponse.data.data.isValid);
    console.log('   Agency Name:', validVerifyResponse.data.data.agencyName);
    
    // Invalid verification (wrong phone)
    console.log(`   Verifying ${agencies_data[1].phoneNumber} for ${valid.agency}...`);
    const invalidVerifyResponse = await axios.get(`${API_URL}/verify/${valid.agency}/${agencies_data[1].phoneNumber}`);
    console.log('   Is Valid:', invalidVerifyResponse.data.data.isValid);
    
    // Unregistered agency verification
    console.log(`   Verifying ${valid.phoneNumber} for non-registered agency...`);
    const unregisteredVerifyResponse = await axios.get(`${API_URL}/verify/${agencies.nonRegistered}/${valid.phoneNumber}`);
    console.log('   Is Valid:', unregisteredVerifyResponse.data.data.isValid);
    console.log('   ✅ Verification Tests Successful\n');
    
    // 4. Get Agency by Phone
    console.log('4. Testing Get Agency by Phone...');
    const agencyResponse = await axios.get(`${API_URL}/agency/${valid.phoneNumber}`);
    console.log(`   Phone Number: ${agencyResponse.data.data.phoneNumber}`);
    console.log(`   Agency Name: ${agencyResponse.data.data.agencyName}`);
    console.log('   ✅ Get Agency Successful\n');
    
    // 5. Get Phone by Agency
    console.log('5. Testing Get Phone by Agency...');
    const phoneResponse = await axios.get(`${API_URL}/phone/${valid.agency}`);
    console.log(`   Agency: ${phoneResponse.data.data.agency}`);
    console.log(`   Phone Number: ${phoneResponse.data.data.phoneNumber}`);
    console.log('   ✅ Get Phone Successful\n');
    
    // 6. Revoke Phone Number
    console.log('6. Testing Phone Number Revocation...');
    console.log(`   Revoking phone for ${valid.agency}...`);
    const revokeResponse = await axios.post(`${API_URL}/revoke`, { agency: valid.agency });
    console.log('   ✅ Revocation Successful');
    console.log('   Transaction Hash:', revokeResponse.data.data.transactionHash);
    
    // Verify revocation
    console.log('   Verifying revocation...');
    try {
      await axios.get(`${API_URL}/phone/${valid.agency}`);
      console.log('   ❌ Revocation Failed: Phone still registered');
    } catch (error) {
      console.log('   ✅ Revocation Verified: Phone no longer registered');
    }
    console.log('');
    
    console.log('All API tests completed successfully!');
  } catch (error) {
    console.error('Error during API test:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testAPI();
