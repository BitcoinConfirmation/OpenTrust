// Simple test to check blockchain connection
const { ethers } = require('ethers');

async function testConnection() {
    try {
        console.log('Testing blockchain connection...');
        
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Connected! Block number: ${blockNumber}`);
        
        const accounts = await provider.listAccounts();
        console.log(`✅ Found ${accounts.length} accounts`);
        console.log(`First account: ${accounts[0]}`);
        
        // Test contract
        const contractAddress = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
        const contractABI = [
            "function owner() external view returns (address)"
        ];
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const owner = await contract.owner();
        console.log(`✅ Contract owner: ${owner}`);
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
