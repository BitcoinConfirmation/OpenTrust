document.addEventListener('DOMContentLoaded', async () => {
    // Contract information
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
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
        "event PhoneNumberRevoked(address indexed agency, string phoneNumber)"
    ];

    // DOM elements
    const registerButton = document.getElementById('registerButton');
    const revokeButton = document.getElementById('revokeButton');
    const verifyButton = document.getElementById('verifyButton');
    const statusDiv = document.getElementById('status');

    // Mock data for simulating blockchain
    const mockRegistry = new Map();
    
    // Initialize provider and contract
    let provider, signer, contract;

    try {
        // Connect to local blockchain
        provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        
        // Get the owner account
        const accounts = await provider.listAccounts();
        signer = provider.getSigner(accounts[0]);
        
        // Connect to the contract
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        statusDiv.textContent = 'Connected to blockchain';
    } catch (error) {
        console.error('Failed to connect to blockchain:', error);
        setStatus('Running in simulation mode (no blockchain connection)', 'error');
    }

    // Register phone number
    registerButton.addEventListener('click', async () => {
        const phoneNumber = document.getElementById('registerPhoneNumber').value;
        const agencyName = document.getElementById('registerAgencyName').value;

        if (!phoneNumber || !agencyName) {
            setStatus('Please fill in all fields', 'error');
            return;
        }

        setStatus('Registering phone number...', 'loading');

        try {
            if (contract) {
                // Use a default agency address since we're not collecting it in the UI
                const defaultAgency = await signer.getAddress();
                
                const tx = await contract.registerPhoneNumber(defaultAgency, phoneNumber, agencyName);
                setStatus('Transaction submitted. Waiting for confirmation...', 'loading');
                
                await tx.wait();
                setStatus(`Successfully registered ${agencyName} with phone number ${phoneNumber}`, 'success');
            } else {
                // Simulation mode
                setTimeout(() => {
                    mockRegistry.set(phoneNumber, agencyName);
                    setStatus(`Successfully registered ${agencyName} with phone number ${phoneNumber}`, 'success');
                }, 1500);
            }
        } catch (error) {
            console.error('Error registering phone number:', error);
            setStatus(`Error: ${error.reason || error.message}`, 'error');
        }
    });

    // Revoke phone number
    revokeButton.addEventListener('click', async () => {
        const phoneNumber = document.getElementById('revokePhoneNumber').value;

        if (!phoneNumber) {
            setStatus('Please enter a phone number', 'error');
            return;
        }

        setStatus('Revoking phone number...', 'loading');

        try {
            if (contract) {
                // We need to find the agency address for this phone number
                try {
                    // First check if the phone number exists
                    const agencyName = await contract.phoneToAgencyName(phoneNumber);
                    
                    // Find an agency that has this phone number
                    // Note: In a real app, we'd need a better way to find the agency address
                    const accounts = await provider.listAccounts();
                    let agencyAddress;
                    
                    for (const account of accounts) {
                        try {
                            const phone = await contract.agencyToPhone(account);
                            if (phone === phoneNumber) {
                                agencyAddress = account;
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!agencyAddress) {
                        throw new Error("Could not find agency for this phone number");
                    }
                    
                    const tx = await contract.revokePhoneNumber(agencyAddress);
                    setStatus('Transaction submitted. Waiting for confirmation...', 'loading');
                    
                    await tx.wait();
                    setStatus(`Successfully revoked phone number ${phoneNumber}`, 'success');
                } catch (error) {
                    throw new Error("Phone number not found in registry");
                }
            } else {
                // Simulation mode
                setTimeout(() => {
                    if (mockRegistry.has(phoneNumber)) {
                        mockRegistry.delete(phoneNumber);
                        setStatus(`Successfully revoked phone number ${phoneNumber}`, 'success');
                    } else {
                        setStatus(`Error: Phone number not found in registry`, 'error');
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Error revoking phone number:', error);
            setStatus(`Error: ${error.reason || error.message}`, 'error');
        }
    });

    // Verify phone number
    verifyButton.addEventListener('click', async () => {
        const phoneNumber = document.getElementById('verifyPhoneNumber').value;

        if (!phoneNumber) {
            setStatus('Please enter a phone number', 'error');
            return;
        }

        setStatus('Verifying phone number...', 'loading');

        try {
            if (contract) {
                try {
                    const agencyName = await contract.getAgencyNameByPhone(phoneNumber);
                    setStatus(`Verification successful! Phone number ${phoneNumber} is registered to "${agencyName}"`, 'success');
                } catch (error) {
                    setStatus(`Verification failed. Phone number ${phoneNumber} is not registered.`, 'error');
                }
            } else {
                // Simulation mode
                setTimeout(() => {
                    if (mockRegistry.has(phoneNumber)) {
                        const agencyName = mockRegistry.get(phoneNumber);
                        setStatus(`Verification successful! Phone number ${phoneNumber} is registered to "${agencyName}"`, 'success');
                    } else {
                        setStatus(`Verification failed. Phone number ${phoneNumber} is not registered.`, 'error');
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Error verifying phone number:', error);
            setStatus(`Error: ${error.reason || error.message}`, 'error');
        }
    });

    // Helper function to set status with appropriate styling
    function setStatus(message, type = '') {
        statusDiv.textContent = message;
        statusDiv.className = type;
        
        if (type === 'loading') {
            const loader = document.createElement('span');
            loader.className = 'loader';
            statusDiv.prepend(loader);
        }
    }
});
