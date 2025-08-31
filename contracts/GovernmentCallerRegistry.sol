// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title GovernmentCallerRegistry
 * @dev A contract that registers government agencies with their phone numbers for verification
 */
contract GovernmentCallerRegistry {
    address public owner;
    
    // Mapping of phone numbers to agency names
    mapping(string => string) public phoneToAgencyName;
    
    // Mapping of agency addresses to phone numbers
    mapping(address => string) public agencyToPhone;
    
    // Events
    event PhoneNumberRegistered(address indexed agency, string phoneNumber, string agencyName);
    event PhoneNumberRevoked(address indexed agency, string phoneNumber);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    
    /**
     * @dev Registers a phone number for a government agency
     * @param agency Address of the government agency
     * @param phoneNumber Phone number of the agency (e.g., +61000000)
     * @param agencyName Name of the government agency (e.g., Department of Example)
     */
    function registerPhoneNumber(address agency, string calldata phoneNumber, string calldata agencyName) external onlyOwner {
        require(bytes(phoneNumber).length > 0, "Phone number cannot be empty");
        require(bytes(agencyName).length > 0, "Agency name cannot be empty");
        require(bytes(phoneToAgencyName[phoneNumber]).length == 0, "Phone number already registered");
        require(bytes(agencyToPhone[agency]).length == 0, "Agency already has a registered phone number");
        require(bytes(agencyToPhone[agency]).length == 0, "Agency already has a registered phone number");
        
        phoneToAgencyName[phoneNumber] = agencyName;
        agencyToPhone[agency] = phoneNumber;
        
        emit PhoneNumberRegistered(agency, phoneNumber, agencyName);
    }
    
    /**
     * @dev Gets the name of an agency by phone number
     * @param phoneNumber Phone number to query
     * @return The name of the government agency
     */
    function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string memory) {
        string memory agencyName = phoneToAgencyName[phoneNumber];
        require(bytes(agencyName).length > 0, "Phone number not registered");
        return agencyName;
    }
    
    /**
     * @dev Gets the phone number of an agency
     * @param agency Address of the government agency
     * @return The phone number of the agency
     */
    function getAgencyPhone(address agency) external view returns (string memory) {
        string memory phoneNumber = agencyToPhone[agency];
        require(bytes(phoneNumber).length > 0, "Phone number not registered for this agency");
        return phoneNumber;
    }
    
    /**
     * @dev Verify if a phone number and agency address match
     * @param agency Address of the government agency
     * @param phoneNumber Phone number to verify
     * @return bool True if the phone number is registered to the agency, false otherwise
     */
    function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool) {
        string memory agencyPhone = agencyToPhone[agency];
        if (bytes(agencyPhone).length == 0) {
            return false;
        }
        
        // Compare strings by comparing their keccak256 hashes
        return keccak256(bytes(agencyPhone)) == keccak256(bytes(phoneNumber));
    }
    
    /**
     * @dev Revokes a phone number from an agency
     * @param agency Address of the government agency
     */
    function revokePhoneNumber(address agency) external onlyOwner {
        string memory phoneNumber = agencyToPhone[agency];
        require(bytes(phoneNumber).length > 0, "Phone number not registered for this agency");
        
        // Clear mappings
        delete phoneToAgencyName[phoneNumber];
        delete agencyToPhone[agency];
        
        emit PhoneNumberRevoked(agency, phoneNumber);
    }
    
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
