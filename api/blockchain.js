const { ethers } = require('ethers');
require('dotenv').config();

// ABI for the GovernmentCallerRegistry contract
const contractABI = [
  "function owner() external view returns (address)",
  "function registerPhoneNumber(address agency, string calldata phoneNumber, string calldata agencyName) external",
  "function revokePhoneNumber(address agency) external",
  "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)",
  "function getAgencyPhone(address agency) external view returns (string)",
  "function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool)",
  "function phoneToAgencyName(string) external view returns (string)",
  "function agencyToPhone(address) external view returns (string)",
  "event PhoneNumberRegistered(address indexed agency, string phoneNumber, string agencyName)",
  "event PhoneNumberRevoked(address indexed agency, string phoneNumber)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

// Get provider and signer
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Connect to the contract
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS, 
  contractABI,
  signer
);

module.exports = {
  provider,
  signer,
  contract
};
