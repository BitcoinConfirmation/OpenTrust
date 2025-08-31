import { ethers } from "ethers";

/**
 * GovernmentCallerVerifier SDK
 * 
 * This SDK provides an easy way to interact with the GovernmentCallerRegistry contract
 * for verifying government agency phone numbers on the blockchain.
 */
export class GovernmentCallerVerifier {
  private contract: ethers.Contract;
  
  /**
   * Constructor
   * 
   * @param provider An ethers.js provider
   * @param contractAddress The address of the GovernmentCallerRegistry contract
   */
  constructor(
    provider: ethers.providers.Provider,
    contractAddress: string
  ) {
    const abi = [
      "function owner() external view returns (address)",
      "function registerPhoneNumber(address agency, string calldata phoneNumber, string calldata agencyName) external",
      "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)",
      "function getAgencyPhone(address agency) external view returns (string)",
      "function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool)",
      "function phoneToAgencyName(string) external view returns (string)",
      "function agencyToPhone(address) external view returns (string)"
    ];
    
    this.contract = new ethers.Contract(contractAddress, abi, provider);
  }
  
  /**
   * Connect with a signer to perform write operations
   * 
   * @param signer An ethers.js signer
   * @returns A new instance of GovernmentCallerVerifier connected to the signer
   */
  connect(signer: ethers.Signer): GovernmentCallerVerifier {
    const contractWithSigner = this.contract.connect(signer);
    const verifier = new GovernmentCallerVerifier(signer.provider as ethers.providers.Provider, this.contract.address);
    verifier.contract = contractWithSigner;
    return verifier;
  }
  
  /**
   * Get the owner of the contract
   * 
   * @returns A promise that resolves to the owner's address
   */
  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }
  
  /**
   * Register a phone number for a government agency
   * 
   * @param agency Address of the government agency
   * @param phoneNumber Phone number to register (e.g., +61000000)
   * @param agencyName Name of the government agency (e.g., Department of Example)
   * @returns A transaction response
   */
  async registerPhoneNumber(
    agency: string, 
    phoneNumber: string, 
    agencyName: string
  ): Promise<ethers.ContractTransaction> {
    return await this.contract.registerPhoneNumber(agency, phoneNumber, agencyName);
  }
  
  /**
   * Get the name of an agency by its phone number
   * 
   * @param phoneNumber The phone number to query
   * @returns A promise that resolves to the agency name
   */
  async getAgencyNameByPhone(phoneNumber: string): Promise<string> {
    return await this.contract.getAgencyNameByPhone(phoneNumber);
  }
  
  /**
   * Get the phone number of a government agency
   * 
   * @param agency Address of the government agency
   * @returns A promise that resolves to the phone number
   */
  async getAgencyPhone(agency: string): Promise<string> {
    return await this.contract.getAgencyPhone(agency);
  }
  
  /**
   * Verify if a phone number is registered to a specific agency
   * 
   * @param agency Address of the government agency
   * @param phoneNumber Phone number to verify
   * @returns A promise that resolves to a boolean indicating if the phone is registered to the agency
   */
  async verifyAgencyPhone(agency: string, phoneNumber: string): Promise<boolean> {
    return await this.contract.verifyAgencyPhone(agency, phoneNumber);
  }
}
