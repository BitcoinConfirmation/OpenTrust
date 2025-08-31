const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  // Get the provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  
  // Get the deployer wallet
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());
  
  // Read the compiled contract artifact
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'GovernmentCallerRegistry.sol', 'GovernmentCallerRegistry.json');
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath));
  
  // Create a contract factory
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    deployer
  );
  
  // Deploy the contract
  console.log('Deploying GovernmentCallerRegistry...');
  const contract = await factory.deploy();
  
  // Wait for deployment to finish
  await contract.deployed();
  
  console.log('GovernmentCallerRegistry deployed to:', contract.address);
  
  // Update the .env file with the new contract address
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the CONTRACT_ADDRESS line
  envContent = envContent.replace(
    /CONTRACT_ADDRESS=.*/,
    `CONTRACT_ADDRESS=${contract.address}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('.env file updated with new contract address');
  
  console.log('Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
