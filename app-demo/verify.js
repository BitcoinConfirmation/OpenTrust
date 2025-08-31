document.addEventListener('DOMContentLoaded', async () => {
    // Contract information - Updated with new deployment address
    const contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    const contractABI = [
        "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)",
        "function phoneToAgencyName(string) external view returns (string)",
        "function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool)",
        "function owner() external view returns (address)"
    ];

    // DOM elements
    const verifyButton = document.getElementById('verifyButton');
    const statusDiv = document.getElementById('status');
    const resultContainer = document.getElementById('result');
    const resultMessage = document.getElementById('result-message');
    const agencyDetails = document.getElementById('agency-details');
    const agencyName = document.getElementById('agency-name');
    const agencyPhone = document.getElementById('agency-phone');
    const resultIcon = document.querySelector('.result-icon .icon');
    
    // Debug elements
    const debugToggle = document.getElementById('debug-toggle');
    const debugInfo = document.getElementById('debug-info');
    const debugProvider = document.getElementById('debug-provider');
    const debugNetwork = document.getElementById('debug-network');
    const debugContract = document.getElementById('debug-contract');
    const debugAccount = document.getElementById('debug-account');
    const debugError = document.getElementById('debug-error');

    // Pre-populated test data for demo purposes
    const testData = [
        "+1-202-555-0101",
        "+1-202-555-0102",
        "+1-202-555-0103"
    ];
    
    // Initialize provider and contract
    let provider, contract, networkInfo, signer;
    let connectedToBlockchain = false;
    let connectionErrorDetails = "";

    // Add test phone numbers to the suggestion datalist
    const datalist = document.getElementById('phone-suggestions');
    testData.forEach(phone => {
        const option = document.createElement('option');
        option.value = phone;
        datalist.appendChild(option);
    });

    // Test agency addresses to match phone numbers (from registration)
    const agencyAddresses = {
        "+1-202-555-0101": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // FBI
        "+1-202-555-0102": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // DHS
        "+1-202-555-0103": "0x90F79bf6EB2c4f870365E785982E1f101E93b906"  // IRS
    };

    // Fallback mode - if blockchain connection fails
    const fallbackRegistry = {
        "+1-202-555-0101": "Federal Bureau of Investigation",
        "+1-202-555-0102": "Department of Homeland Security",
        "+1-202-555-0103": "Internal Revenue Service"
    };

    // Toggle debug info visibility
    debugToggle.addEventListener('click', () => {
        debugInfo.classList.toggle('hidden');
        debugToggle.textContent = debugInfo.classList.contains('hidden') 
            ? 'Show Debug Information' 
            : 'Hide Debug Information';
    });

    // Update debug info
    function updateDebugInfo(key, value) {
        const element = document.getElementById(`debug-${key}`);
        if (element) {
            // Extract label from existing text
            const label = element.textContent.split(':')[0];
            element.textContent = `${label}: ${value}`;
        }
    }

    try {
        setStatus('Connecting to blockchain...', 'loading');
        updateDebugInfo('provider', 'Initializing...');
        
        // Try multiple provider options
        const providerOptions = [
            { url: 'http://localhost:8545', name: 'HTTP RPC' },
            { url: 'ws://localhost:8545', name: 'WebSocket' },
            { url: 'http://127.0.0.1:8545', name: 'HTTP Loopback' }
        ];
        
        // Try each provider option with timeout
        let connected = false;
        let lastError = null;
        
        for (const option of providerOptions) {
            if (connected) break;
            
            try {
                updateDebugInfo('provider', `Trying ${option.name}...`);
                console.log(`Attempting to connect via ${option.name}: ${option.url}`);
                
                if (option.url.startsWith('ws')) {
                    provider = new ethers.providers.WebSocketProvider(option.url);
                } else {
                    provider = new ethers.providers.JsonRpcProvider(option.url);
                }
                
                // Test the connection with a timeout
                const blockNumber = await Promise.race([
                    provider.getBlockNumber(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error(`Connection timeout to ${option.url}`)), 2000)
                    )
                ]);
                
                console.log(`Connected to blockchain via ${option.name}, block #${blockNumber}`);
                updateDebugInfo('provider', `Connected via ${option.name}`);
                connected = true;
                
                // Get network information
                networkInfo = await provider.getNetwork();
                updateDebugInfo('network', `${networkInfo.name} (chainId: ${networkInfo.chainId})`);
                
                // Try to get signer/account
                try {
                    signer = provider.getSigner();
                    const account = await signer.getAddress();
                    updateDebugInfo('account', account);
                } catch (signerError) {
                    updateDebugInfo('account', 'Read-only mode (no signer)');
                    console.log('No signer available:', signerError.message);
                }
            } catch (error) {
                console.log(`Failed to connect via ${option.name}:`, error.message);
                lastError = error;
            }
        }
        
        if (!connected) {
            throw lastError || new Error("Failed to connect to blockchain");
        }
        
        // Connect to the contract
        contract = new ethers.Contract(contractAddress, contractABI, provider);
        updateDebugInfo('contract', 'Initialized, checking deployment...');
        
        // Try to access the contract
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            throw new Error("No contract deployed at this address");
        }
        
        // Try to access a contract method
        try {
            const contractOwner = await contract.owner();
            updateDebugInfo('contract', `Valid contract (owner: ${contractOwner.substring(0, 8)}...)`);
        } catch (error) {
            console.log('Contract method test failed:', error.message);
            updateDebugInfo('contract', 'Contract exists but may have incorrect ABI');
        }
        
        setStatus('Connected to blockchain verification system', 'success');
        connectedToBlockchain = true;
    } catch (error) {
        console.error('Blockchain connection error:', error);
        connectionErrorDetails = error.message || "Unknown error";
        updateDebugInfo('provider', 'Connection failed');
        updateDebugInfo('error', error.message);
        
        // We'll continue to use the fallback mode but with a more positive message
        setStatus(`Using demo verification mode`, 'warning');
        
        // Show detailed error in console for debugging
        console.log('Connection error details:', {
            error: error,
            message: error.message,
            contractAddress: contractAddress,
            provider: provider ? 'Initialized' : 'Failed'
        });
    }

    // Verify phone number
    verifyButton.addEventListener('click', async () => {
        const phoneNumber = document.getElementById('verifyPhoneNumber').value;

        if (!phoneNumber) {
            setStatus('Please enter a phone number', 'error');
            return;
        }

        setStatus('Verifying phone number...', 'loading');
        resultContainer.classList.add('hidden');

        try {
            let isVerified = false;
            let agencyNameResult = null;
            let verificationSource = null;
            
            // Try blockchain verification first
                if (connectedToBlockchain) {
                    try {
                        // We need the agency address to verify
                        const agencyAddress = agencyAddresses[phoneNumber];
                        
                        if (agencyAddress) {
                            // First try the verifyAgencyPhone method with address
                            try {
                                isVerified = await contract.verifyAgencyPhone(agencyAddress, phoneNumber);
                                console.log(`Verification result from contract: ${isVerified}`);
                                verificationSource = "blockchain-verify";
                            } catch (verifyError) {
                                console.log("Could not use verifyAgencyPhone method:", verifyError.message);
                                // Fall back to checking if there's an agency name
                            }
                        } else {
                            console.log("No agency address for this phone number. Trying direct lookup.");
                        }
                        
                        // Try to get the agency name directly if verification hasn't succeeded
                        if (!isVerified) {
                            try {
                                // First try getAgencyNameByPhone method
                                agencyNameResult = await contract.getAgencyNameByPhone(phoneNumber);
                                verificationSource = "blockchain-name";
                                isVerified = true;
                            } catch (nameError) {
                                console.log("getAgencyNameByPhone failed:", nameError.message);
                                
                                // Fall back to phoneToAgencyName mapping
                                try {
                                    agencyNameResult = await contract.phoneToAgencyName(phoneNumber);
                                    if (agencyNameResult && agencyNameResult !== '') {
                                        isVerified = true;
                                        verificationSource = "blockchain-mapping";
                                    }
                                } catch (mappingError) {
                                    console.log("phoneToAgencyName failed:", mappingError.message);
                                    // If both methods fail, the phone is not verified
                                }
                            }
                        }
                    } catch (error) {
                        // Blockchain verification failed
                        console.log("Blockchain verification failed:", error.message);
                        updateDebugInfo('error', `Blockchain error: ${error.message}`);
                    }
                }            // If blockchain verification failed, try API server
            if (!verificationSource) {
                try {
                    console.log("Trying API server verification...");
                    // Try both localhost and 127.0.0.1
                    const apiUrls = [
                        `http://localhost:3002/agency/${encodeURIComponent(phoneNumber)}`,
                        `http://127.0.0.1:3002/agency/${encodeURIComponent(phoneNumber)}`
                    ];
                    
                    let apiResponse = null;
                    for (const apiUrl of apiUrls) {
                        try {
                            const response = await fetch(apiUrl, { method: 'GET' });
                            if (response.ok) {
                                apiResponse = await response.json();
                                console.log("API response:", apiResponse);
                                break;
                            }
                        } catch (fetchError) {
                            console.log(`API fetch error for ${apiUrl}:`, fetchError.message);
                        }
                    }
                    
                    if (apiResponse) {
                        isVerified = apiResponse.verified;
                        agencyNameResult = apiResponse.agencyName;
                        verificationSource = "api-server";
                    }
                } catch (apiError) {
                    console.log("API verification failed:", apiError.message);
                    updateDebugInfo('error', `API error: ${apiError.message}`);
                }
            }
            
            // If all else fails, use fallback data
            if (!verificationSource) {
                console.log("Using fallback verification...");
                // Fallback mode
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
                agencyNameResult = fallbackRegistry[phoneNumber];
                isVerified = !!agencyNameResult;
                verificationSource = "fallback";
            }
            
            console.log(`Verification result: ${isVerified ? 'Verified' : 'Not verified'} (source: ${verificationSource})`);
            updateDebugInfo('provider', `Verification source: ${verificationSource}`);
            
            // Show result
            resultContainer.classList.remove('hidden');
            
            if (isVerified) {
                resultIcon.className = 'icon valid';
                resultMessage.textContent = `This is a verified trusted phone number.`;
                agencyName.textContent = agencyNameResult || "Verified Official Agency";
                agencyPhone.textContent = phoneNumber;
                agencyDetails.classList.remove('hidden');
                setStatus('Verification completed successfully', 'success');
            } else {
                resultIcon.className = 'icon invalid';
                resultMessage.textContent = `This phone number is NOT registered with OpenTrust.`;
                agencyDetails.classList.add('hidden');
                setStatus('Verification completed - Number not found', 'error');
            }
        } catch (error) {
            console.error('Error verifying phone number:', error);
            updateDebugInfo('error', `Error: ${error.message}`);
            setStatus(`Error: ${error.reason || error.message}`, 'error');
            resultContainer.classList.add('hidden');
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
        
        // Update debug error if it's an error
        if (type === 'error' && message.includes('Error')) {
            updateDebugInfo('error', message);
        }
    }
});
