document.addEventListener('DOMContentLoaded', async () => {
    // Contract information - Updated with new deployment address
    const contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    
    // Complete contract ABI based on the Solidity contract
    const contractABI = [
        "function owner() external view returns (address)",
        "function registerPhoneNumber(address agency, string calldata phoneNumber, string calldata agencyName) external",
        "function revokePhoneNumber(address agency) external",
        "function phoneToAgencyName(string) external view returns (string)",
        "function agencyToPhone(address) external view returns (string)",
        "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)",
        "function getAgencyPhone(address agency) external view returns (string)",
        "function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool)",
        "function transferOwnership(address newOwner) external",
        "event PhoneNumberRegistered(address indexed agency, string phoneNumber, string agencyName)",
        "event PhoneNumberRevoked(address indexed agency, string phoneNumber)",
        "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
    ];

    // DOM elements
    const registerButton = document.getElementById('registerButton');
    const revokeButton = document.getElementById('revokeButton');
    const statusDiv = document.getElementById('status');
    
    // Initialize provider and contract
    let provider, signer, contract;
    let isConnected = false;
    let currentAccount = null;
    let availableAccounts = [];

    // Helper function to set status with appropriate styling
    function setStatus(message, type = '') {
        if (!statusDiv) return;
        
        statusDiv.textContent = message;
        statusDiv.className = type;
        
        if (type === 'loading') {
            statusDiv.innerHTML = `<span class="loader"></span> ${message}`;
        }
        
        console.log(`Status: ${message} (${type})`);
    }



    // Check if ethers is available
    if (typeof ethers === 'undefined') {
        setStatus('❌ Ethers.js library not loaded. Check your internet connection.', 'error');
        return;
    }

    // Initialize blockchain connection
    async function initializeBlockchain() {
        try {
            setStatus('Connecting to blockchain...', 'loading');
            
            // Try multiple provider options with fallbacks
            const providerOptions = [
                { url: 'http://localhost:8545', name: 'HTTP RPC' },
                { url: 'http://127.0.0.1:8545', name: 'HTTP Loopback' }
            ];
            
            let connected = false;
            let lastError = null;
            
            for (const option of providerOptions) {
                if (connected) break;
                
                try {
                    console.log(`Trying provider: ${option.name} (${option.url})`);
                    provider = new ethers.providers.JsonRpcProvider(option.url);
                    
                    // Test connection with timeout
                    const blockNumber = await Promise.race([
                        provider.getBlockNumber(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error(`Connection timeout after 5 seconds for ${option.name}`)), 5000)
                        )
                    ]);
                    
                    console.log(`✅ Connected via ${option.name}! Block number: ${blockNumber}`);
                    connected = true;
                    break;
                    
                } catch (error) {
                    console.log(`❌ Failed to connect via ${option.name}:`, error.message);
                    lastError = error;
                    continue;
                }
            }
            
            if (!connected) {
                throw new Error(`All connection attempts failed. Last error: ${lastError?.message}`);
            }
            
            // Get accounts from Hardhat
            availableAccounts = await provider.listAccounts();
            console.log(`Found ${availableAccounts.length} accounts:`, availableAccounts);
            
            if (availableAccounts && availableAccounts.length > 0) {
                signer = provider.getSigner(availableAccounts[0]);
                currentAccount = availableAccounts[0];
                console.log(`Using signer: ${currentAccount}`);
                
                // Connect to the contract
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                
                // Test contract connection and verify ownership
                try {
                    const owner = await contract.owner();
                    console.log(`✅ Contract owner: ${owner}`);
                    console.log(`Current account: ${currentAccount}`);
                    
                    const isOwner = owner.toLowerCase() === currentAccount.toLowerCase();
                    
                    if (isOwner) {
                        isConnected = true;
                        setStatus('✅ Connected to blockchain - Ready to manage phone numbers', 'success');
                    } else {
                        setStatus(`⚠️ Connected but not contract owner. Owner: ${owner.substring(0,10)}...`, 'warning');
                        isConnected = true; // Still connected, just not owner
                    }
                    
                } catch (contractError) {
                    console.error('Contract error:', contractError);
                    throw new Error(`Contract connection failed: ${contractError.message}`);
                }
            } else {
                throw new Error("No accounts available. Make sure Hardhat node is running with accounts.");
            }
            
        } catch (error) {
            console.error('Failed to connect to blockchain:', error);
            setStatus(`❌ Connection failed: ${error.message}`, 'error');
            
            // Add troubleshooting info after a delay
            setTimeout(() => {
                if (statusDiv && statusDiv.textContent.includes('Connection failed')) {
                    statusDiv.innerHTML += `<br><small><strong>Troubleshooting:</strong><br>
                    1. Make sure Hardhat node is running: <code>npx hardhat node</code><br>
                    2. Check browser console for detailed errors<br>
                    3. Verify contract is deployed to: ${contractAddress}<br>
                    4. Try refreshing the page</small>`;
                }
            }, 2000);
        }
    }

    // Register phone number function
    async function registerPhoneNumber() {
        console.log('Register button clicked');
        
        const phoneNumber = document.getElementById('registerPhoneNumber')?.value?.trim();
        const agencyName = document.getElementById('registerAgencyName')?.value?.trim();

        console.log(`Phone: "${phoneNumber}", Agency: "${agencyName}"`);

        // Basic checks only
        if (!phoneNumber || !agencyName) {
            setStatus('❌ Please fill in both phone number and agency name', 'error');
            return;
        }

        if (!isConnected) {
            setStatus('❌ Not connected to blockchain. Cannot register.', 'error');
            return;
        }

        setStatus('Registering phone number to blockchain...', 'loading');

        try {
            // Check if we're the contract owner
            const contractOwner = await contract.owner();
            const currentSigner = await signer.getAddress();
            
            console.log(`Contract owner: ${contractOwner}, Current signer: ${currentSigner}`);
            
            if (contractOwner.toLowerCase() !== currentSigner.toLowerCase()) {
                setStatus('❌ Error: Only the contract owner can register phone numbers.', 'error');
                return;
            }
            
            // Check if phone number is already registered
            try {
                const existingAgency = await contract.phoneToAgencyName(phoneNumber);
                if (existingAgency && existingAgency.length > 0) {
                    setStatus(`❌ Phone number ${phoneNumber} is already registered to: ${existingAgency}`, 'error');
                    return;
                }
            } catch (e) {
                // Phone number not found, which is good
                console.log('Phone number not found in registry (expected)');
            }
            
            // Find an available agency address (skip index 0 which is the owner)
            let agencyAddress = null;
            
            for (let i = 1; i < availableAccounts.length; i++) {
                try {
                    const existingPhone = await contract.agencyToPhone(availableAccounts[i]);
                    if (!existingPhone || existingPhone === '') {
                        agencyAddress = availableAccounts[i];
                        console.log(`Using agency address: ${agencyAddress} (account ${i})`);
                        break;
                    }
                } catch (error) {
                    // This account is available
                    agencyAddress = availableAccounts[i];
                    console.log(`Using agency address (from catch): ${agencyAddress} (account ${i})`);
                    break;
                }
            }
            
            if (!agencyAddress) {
                setStatus('❌ No available agency addresses. All accounts are in use.', 'error');
                return;
            }
            
            // Register the phone number
            console.log(`Calling contract.registerPhoneNumber("${agencyAddress}", "${phoneNumber}", "${agencyName}")`);
            
            const tx = await contract.registerPhoneNumber(agencyAddress, phoneNumber, agencyName);
            setStatus('Transaction submitted. Waiting for confirmation...', 'loading');
            
            console.log(`Transaction hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            
            setStatus(`✅ Successfully registered ${agencyName} with phone number ${phoneNumber}`, 'success');
            
            // Clear the form
            document.getElementById('registerPhoneNumber').value = '';
            document.getElementById('registerAgencyName').value = '';
            
        } catch (error) {
            console.error('Error registering phone number:', error);
            
            let errorMessage = error.reason || error.message || 'Unknown error occurred';
            
            if (errorMessage.includes('already registered')) {
                setStatus('❌ Error: Phone number or agency already registered', 'error');
            } else if (errorMessage.includes('not the owner')) {
                setStatus('❌ Error: Only the contract owner can register phone numbers', 'error');
            } else if (errorMessage.includes('cannot be empty')) {
                setStatus('❌ Error: Phone number and agency name cannot be empty', 'error');
            } else {
                setStatus(`❌ Error: ${errorMessage}`, 'error');
            }
        }
    }

    // Revoke phone number function
    async function revokePhoneNumber() {
        console.log('Revoke button clicked');
        
        const phoneNumber = document.getElementById('revokePhoneNumber')?.value?.trim();

        if (!phoneNumber) {
            setStatus('❌ Please enter a phone number to revoke', 'error');
            return;
        }

        if (!isConnected) {
            setStatus('❌ Not connected to blockchain. Cannot revoke.', 'error');
            return;
        }

        setStatus('Revoking phone number from blockchain...', 'loading');

        try {
            // Check if we're the contract owner
            const contractOwner = await contract.owner();
            const currentSigner = await signer.getAddress();
            
            if (contractOwner.toLowerCase() !== currentSigner.toLowerCase()) {
                setStatus('❌ Error: Only the contract owner can revoke phone numbers.', 'error');
                return;
            }
            
            // Find the agency address for this phone number
            let agencyAddress = null;
            
            for (const account of availableAccounts) {
                try {
                    const phone = await contract.agencyToPhone(account);
                    if (phone === phoneNumber) {
                        agencyAddress = account;
                        console.log(`Found agency address for phone ${phoneNumber}: ${agencyAddress}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!agencyAddress) {
                setStatus('❌ Error: Phone number not found in registry', 'error');
                return;
            }
            
            console.log(`Revoking phone number for agency: ${agencyAddress}`);
            const tx = await contract.revokePhoneNumber(agencyAddress);
            setStatus('Transaction submitted. Waiting for confirmation...', 'loading');
            
            console.log(`Transaction hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            
            setStatus(`✅ Successfully revoked phone number ${phoneNumber}`, 'success');
            
            // Clear the form
            document.getElementById('revokePhoneNumber').value = '';
            
        } catch (error) {
            console.error('Error revoking phone number:', error);
            
            let errorMessage = error.reason || error.message || 'Unknown error occurred';
            
            if (errorMessage.includes('not registered')) {
                setStatus('❌ Error: Phone number not found in registry', 'error');
            } else if (errorMessage.includes('not the owner')) {
                setStatus('❌ Error: Only the contract owner can revoke phone numbers', 'error');
            } else {
                setStatus(`❌ Error: ${errorMessage}`, 'error');
            }
        }
    }

    // Event listeners
    if (registerButton) {
        registerButton.addEventListener('click', registerPhoneNumber);
    } else {
        console.error('Register button not found');
    }

    if (revokeButton) {
        revokeButton.addEventListener('click', revokePhoneNumber);
    } else {
        console.error('Revoke button not found');
    }

    // Initialize blockchain connection
    await initializeBlockchain();
});
