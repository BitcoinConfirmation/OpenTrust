document.addEventListener('DOMContentLoaded', async () => {
    // Contract information - Same as other files
    const contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    const contractABI = [
        "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)",
        "function phoneToAgencyName(string) external view returns (string)",
        "function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool)",
        "function owner() external view returns (address)"
    ];

    // DOM elements
    const callScreen = document.getElementById('callScreen');
    const callerDisplayName = document.getElementById('callerDisplayName');
    const callerPhoneNumber = document.getElementById('callerPhoneNumber');
    const avatarImage = document.getElementById('avatarImage');
    const verificationBadge = document.getElementById('verificationBadge');
    const verificationText = document.getElementById('verificationText');
    const verificationDetails = document.getElementById('verificationDetails');
    const spamRating = document.getElementById('spamRating');
    const callDuration = document.getElementById('callDuration');
    const currentTime = document.getElementById('currentTime');
    
    // Action buttons
    const answerCall = document.getElementById('answerCall');
    const declineCall = document.getElementById('declineCall');
    const simulateCall = document.getElementById('simulateCall');
    const phoneSelect = document.getElementById('phoneSelect');
    
    // Auto-start demo call after 3 seconds
    setTimeout(() => {
        // Start with test verified number
        const testNumber = '+1-777-TEST-555';
        if (phoneSelect) phoneSelect.value = testNumber;
        simulateIncomingCall(testNumber);
    }, 3000);
    
    // Demo panel
    const demoPanel = document.getElementById('demoPanel');
    const togglePanel = document.getElementById('togglePanel');
    
    // Status indicators
    const blockchainDot = document.getElementById('blockchainDot');
    const blockchainStatusText = document.getElementById('blockchainStatusText');
    const verificationDot = document.getElementById('verificationDot');
    const lastVerificationText = document.getElementById('lastVerificationText');

    // Blockchain connection
    let provider, contract;
    let isConnected = false;

    // Call state
    let isCallActive = false;
    let callTimer = null;
    let callStartTime = null;
    let lastUsedPhoneNumber = null;
    let shouldUseVerifiedNumber = true; // Alternating flag for verified/unverified calls

    // Known verified agencies with TrueCaller-style data
    const agencyDatabase = {
        // Test number - always verified
        "+1-777-TEST-555": {
            name: "Test Verified Number",
            organization: "Test Organization",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%2300e676'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='30' text-anchor='middle' fill='white' font-weight='bold'%3E✓%3C/text%3E%3C/svg%3E",
            verified: true,
            trustScore: 100,
            category: "Test - Always Verified",
            spamReports: 0,
            userReports: 0
        },
        "+1-202-555-0101": {
            name: "Federal Bureau of Investigation",
            organization: "U.S. Department of Justice",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23003d82'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='30' text-anchor='middle' fill='white' font-weight='bold'%3EFBI%3C/text%3E%3C/svg%3E",
            verified: true,
            trustScore: 100,
            category: "Official - Law Enforcement",
            spamReports: 0,
            userReports: 0
        },
        "+1-202-555-0102": {
            name: "Department of Homeland Security",
            organization: "U.S. Department of Homeland Security",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23004d9f'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='25' text-anchor='middle' fill='white' font-weight='bold'%3EDHS%3C/text%3E%3C/svg%3E",
            verified: true,
            trustScore: 100,
            category: "Official - Security",
            spamReports: 0,
            userReports: 0
        },
        "+1-202-555-0103": {
            name: "Internal Revenue Service",
            organization: "U.S. Department of Treasury",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23006b3c'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='30' text-anchor='middle' fill='white' font-weight='bold'%3EIRS%3C/text%3E%3C/svg%3E",
            verified: true,
            trustScore: 100,
            category: "Official - Tax Authority",
            spamReports: 0,
            userReports: 0
        },
        "+1-555-123-4567": {
            name: "Unknown Number",
            organization: "Not identified",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23666666'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='40' text-anchor='middle' fill='white'%3E%3F%3C/text%3E%3C/svg%3E",
            verified: false,
            trustScore: 0,
            category: "Unknown",
            spamReports: 0,
            userReports: 0
        },
        "+1-800-SCAMMER": {
            name: "Suspected Scam Call",
            organization: "Potential Fraud",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23dc3545'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='35' text-anchor='middle' fill='white'%3E⚠%3C/text%3E%3C/svg%3E",
            verified: false,
            trustScore: 0,
            category: "Spam/Scam",
            spamReports: 247,
            userReports: 1563
        },
        "+1-900-TELEMARKETER": {
            name: "Telemarketing Call",
            organization: "Marketing Services",
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ffc107'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='30' text-anchor='middle' fill='black'%3E📢%3C/text%3E%3C/svg%3E",
            verified: false,
            trustScore: 25,
            category: "Telemarketing",
            spamReports: 89,
            userReports: 432
        }
    };

    // Get the next phone number in the alternating sequence
    function getNextPhoneNumber() {
        // Arrays of verified and non-verified numbers
        const verifiedNumbers = ['+1-202-555-0101', '+1-202-555-0102', '+1-202-555-0103'];
        const nonVerifiedNumbers = ['+1-555-123-4567', '+1-800-SCAMMER', '+1-900-TELEMARKETER'];
        
        // Choose category based on alternating flag
        const candidateNumbers = shouldUseVerifiedNumber ? verifiedNumbers : nonVerifiedNumbers;
        
        // Filter out the last used number if it's in this category
        const availableNumbers = candidateNumbers.filter(num => num !== lastUsedPhoneNumber);
        
        // Pick a random number from the available ones
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const nextNumber = availableNumbers.length > 0 ? 
                           availableNumbers[randomIndex] : 
                           candidateNumbers[Math.floor(Math.random() * candidateNumbers.length)];
        
        // Update last used number and flip the flag for next time
        lastUsedPhoneNumber = nextNumber;
        shouldUseVerifiedNumber = !shouldUseVerifiedNumber;
        
        // Update the phone select dropdown to match
        if (phoneSelect) {
            phoneSelect.value = nextNumber;
        }
        
        console.log(`Selected ${shouldUseVerifiedNumber ? 'non-verified' : 'verified'} number for next call: ${nextNumber}`);
        return nextNumber;
    }

    // Initialize real-time clock
    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
        if (currentTime) {
            currentTime.textContent = timeString;
        }
    }

            const providerOptions = [
                'http://localhost:8545',
                'http://127.0.0.1:8545'
            ];

            let connected = false;
            
            for (const url of providerOptions) {
                if (connected) break;
                
                try {
                    provider = new ethers.providers.JsonRpcProvider(url);
                    
                    await Promise.race([
                        provider.getBlockNumber(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), 3000)
                        )
                    ]);
                    
                    contract = new ethers.Contract(contractAddress, contractABI, provider);
                    await contract.owner();
                    
                    connected = true;
                    isConnected = true;
                    setBlockchainStatus('connected', 'Connected');
                    console.log('✅ Blockchain connected successfully');
                    break;
                    
                } catch (error) {
                    console.log(`Failed to connect via ${url}:`, error.message);
                    continue;
                }
            }
            
            if (!connected) {
                throw new Error('All connection attempts failed');
            }
            
        } catch (error) {
            console.error('Blockchain connection failed:', error);
            isConnected = false;
            setBlockchainStatus('error', 'Offline (Using Local Data)');
        }
    }
    
    // Get the next phone number in the alternating sequence
    function getNextPhoneNumber() {
        // Arrays of verified and non-verified numbers
        const verifiedNumbers = ['+1-202-555-0101', '+1-202-555-0102', '+1-202-555-0103'];
        const nonVerifiedNumbers = ['+1-555-123-4567', '+1-800-SCAMMER', '+1-900-TELEMARKETER'];
        
        // Choose category based on alternating flag
        const candidateNumbers = shouldUseVerifiedNumber ? verifiedNumbers : nonVerifiedNumbers;
        
        // Filter out the last used number if it's in this category
        const availableNumbers = candidateNumbers.filter(num => num !== lastUsedPhoneNumber);
        
        // Pick a random number from the available ones
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const nextNumber = availableNumbers.length > 0 ? 
                           availableNumbers[randomIndex] : 
                           candidateNumbers[Math.floor(Math.random() * candidateNumbers.length)];
        
        // Update last used number and flip the flag for next time
        lastUsedPhoneNumber = nextNumber;
        shouldUseVerifiedNumber = !shouldUseVerifiedNumber;
        
        // Update the phone select dropdown to match
        if (phoneSelect) {
            phoneSelect.value = nextNumber;
        }
        
        console.log(`Selected ${shouldUseVerifiedNumber ? 'non-verified' : 'verified'} number for next call: ${nextNumber}`);
        return nextNumber;
    }

    // Set blockchain status
    function setBlockchainStatus(status, text) {
        if (blockchainDot && blockchainStatusText) {
            blockchainDot.className = `status-dot ${status}`;
            blockchainStatusText.textContent = `Blockchain: ${text}`;
        }
    }

    // Set verification status
    function setVerificationStatus(status, text) {
        if (verificationDot && lastVerificationText) {
            verificationDot.className = `status-dot ${status}`;
            lastVerificationText.textContent = `Last check: ${text}`;
        }
    }

    // Verify phone number against blockchain and local database
    async function verifyPhoneNumber(phoneNumber) {
        console.log(`🔍 Verifying phone number: ${phoneNumber}`);
        
        // Get agency data from local database
        const agencyData = agencyDatabase[phoneNumber];
        let source = 'local';
        let isBlockchainVerified = false;
        
        try {
            if (isConnected && contract) {
                const agencyName = await contract.getAgencyNameByPhone(phoneNumber);
                isBlockchainVerified = agencyName && agencyName.length > 0;
                if (isBlockchainVerified) {
                    source = 'blockchain';
                }
            }
        } catch (error) {
            console.log('Blockchain verification failed:', error);
        }
        
        if (!agencyData && !isBlockchainVerified) {
            return {
                name: "Unknown Caller",
                organization: "Unidentified Number",
                verified: false,
                trustScore: 0,
                source: 'none'
            };
        }

        const finalData = {
            name: agencyData ? agencyData.name : "Unknown Caller",
            organization: agencyData?.organization || (isBlockchainVerified ? 'OpenTrust Verified' : 'Unidentified Number'),
            avatar: agencyData?.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23666666'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='40' text-anchor='middle' fill='white'%3E%3F%3C/text%3E%3C/svg%3E",
            verified: isBlockchainVerified || agencyData?.verified || false,
            trustScore: agencyData?.trustScore || (isBlockchainVerified ? 100 : 0),
            category: agencyData?.category || 'Unknown',
            spamReports: agencyData?.spamReports || 0,
            userReports: agencyData?.userReports || 0,
            source: source
        };

        setVerificationStatus(
            finalData.verified ? 'connected' : 'error',
            `${finalData.name} (${source})`
        );

        return finalData;
    }

    // Update caller display with verification results
    function updateCallerDisplay(callerData, phoneNumber) {
        if (!callerData) return;
        
        // Update caller info
        callerDisplayName.textContent = callerData.name;
        callerPhoneNumber.textContent = phoneNumber;
        
        // Update call screen class for verified status
        if (callScreen) {
            if (callerData.verified) {
                callScreen.classList.add('verified-caller');
            } else {
                callScreen.classList.remove('verified-caller');
            }
        }
        
        // Update avatar and verification badge
        if (avatarImage) {
            avatarImage.src = callerData.avatar;
        }
        if (verificationBadge) {
            verificationBadge.style.display = callerData.verified ? 'flex' : 'none';
        }
        
        // Update verification banners
        const verifiedBanner = document.getElementById('verifiedBanner');
        const unverifiedBanner = document.getElementById('unverifiedBanner');
        if (verifiedBanner && unverifiedBanner) {
            verifiedBanner.style.display = callerData.verified ? 'block' : 'none';
            unverifiedBanner.style.display = callerData.verified ? 'none' : 'block';
        }
        
        // Update TrueCaller card
        if (verificationText) {
            verificationText.innerHTML = callerData.verified ? 
                `<img src="images/blockchain-logo.svg" class="verification-status-icon" alt="Verified">
                <span>OpenTrust Verified</span>` :
                `<i class="fas fa-exclamation-triangle"></i>
                <span>Unverified Number</span>`;
        }
        
        if (verificationDetails) {
            verificationDetails.innerHTML = `<i class="fas ${callerData.verified ? 'fa-building' : 'fa-question-circle'}"></i>
                <span>${callerData.organization}</span>`;
        }
        
        // Update spam rating with trust score indicator
        if (spamRating && callerData.trustScore !== undefined) {
            const stars = '★'.repeat(Math.round(callerData.trustScore / 20));
            const emptyStars = '☆'.repeat(5 - Math.round(callerData.trustScore / 20));
            spamRating.innerHTML = `<div class="trust-score" style="color: ${callerData.verified ? '#4CAF50' : '#FFA726'}">
                ${stars}${emptyStars}
            </div>`;
        }
        console.log('Updating display with:', callerData);
        
        // Update basic info
        if (callerDisplayName) {
            callerDisplayName.textContent = callerData.name;
        }
        
        if (callerPhoneNumber) {
            // Format phone number nicely
            const formatted = phoneNumber.replace(/^\+1-?/, '+1 ').replace(/-/g, ' ');
            callerPhoneNumber.textContent = formatted;
        }

        // Update avatar
        if (avatarImage && callerData.avatar) {
            avatarImage.src = callerData.avatar;
        }

        // Update verification badge
        if (verificationBadge) {
            verificationBadge.style.display = callerData.verified ? 'flex' : 'none';
            // Use our blockchain logo instead of font-awesome icon
            verificationBadge.innerHTML = callerData.verified ? '<img src="images/blockchain-logo.svg" class="verification-icon" alt="Blockchain Verified">' : '';
        }

        // Update verification text
        if (verificationText) {
            const icon = callerData.verified ? 'fas fa-shield-check' : 
                        callerData.spamReports > 50 ? 'fas fa-exclamation-triangle' : 'fas fa-question-circle';
            const text = callerData.verified ? 'Blockchain Verified' :
                        callerData.spamReports > 50 ? 'Potential Spam/Scam' : 'Unknown Caller';
            const className = callerData.verified ? 'verified' :
                             callerData.spamReports > 50 ? 'danger' : 'warning';
            
            // Use blockchain logo for verified status, icons for other statuses
            if (callerData.verified) {
                verificationText.innerHTML = `<img src="images/blockchain-logo.svg" class="verification-status-icon" alt="Blockchain Verified"><span>${text}</span>`;
            } else {
                verificationText.innerHTML = `<i class="${icon}"></i><span>${text}</span>`;
            }
            verificationText.className = `verification-status ${className}`;
        }

        // Update verification details
        if (verificationDetails) {
            verificationDetails.innerHTML = `<i class="fas fa-building"></i><span>${callerData.organization}</span>`;
        }

        // Update spam rating - completely reworked to fix 5-star issue
        if (spamRating) {
            // Clear all stars first to avoid any flashing
            spamRating.innerHTML = '';
            spamRating.style.display = 'block';
            
            console.log(`Spam rating update - verified: ${callerData.verified}, isLoading: ${callerData.isLoading}`);
            
            // Clear rating during verification and for verified calls
            if (callerData.verified === true || callerData.verified === null || callerData.isLoading) {
                // For verified agencies or during verification, show no rating info
                spamRating.style.display = 'none';
                console.log('✅ Verified or verifying - hiding stars');
            } else {
                // For unverified numbers, show spam info if available
                const stars = Math.max(1, Math.min(5, Math.floor((callerData.trustScore || 0) / 20)));
                const starsHtml = Array(5).fill(0).map((_, i) => 
                    `<i class="fas fa-star${i < stars ? '' : ' text-gray'}"></i>`
                ).join('');
                
                const ratingText = callerData.spamReports > 0 ? 
                    `${callerData.spamReports} reports` :
                    'No verification available';

                setTimeout(() => {
                    // Add a small delay to ensure stars never appear during transition
                    spamRating.innerHTML = `
                        <div class="rating-stars">${starsHtml}</div>
                        <span class="rating-text">${ratingText}</span>
                    `;
                    console.log('❌ Not verified - showing stars');
                }, 100);
            }
            }
        }

        // Update screen background based on verification
        if (callScreen) {
            // Get banner elements
            const verifiedBanner = document.getElementById('verifiedBanner');
            const unverifiedBanner = document.getElementById('unverifiedBanner');
            
            // Reset all classes first
            document.body.classList.remove('verified-caller', 'spam-caller', 'unknown-caller');
            callScreen.classList.remove('verified-caller', 'spam-caller', 'unknown-caller');
            
            if (verifiedBanner) verifiedBanner.style.display = 'none';
            if (unverifiedBanner) unverifiedBanner.style.display = 'none';
            
            if (callerData.verified === true) {
                // Verified call styling
                document.body.classList.add('verified-caller');
                callScreen.classList.add('verified-caller');
                if (verifiedBanner) verifiedBanner.style.display = 'block';
            } else if (callerData.verified === false) {
                // Specifically unverified (not loading)
                if (callerData.spamReports > 50) {
                    callScreen.classList.add('spam-caller');
                } else {
                    callScreen.classList.add('unknown-caller');
                }
                if (unverifiedBanner) unverifiedBanner.style.display = 'block';
            } else {
                // Loading state - neutral styling
                callScreen.classList.add('unknown-caller');
            }
        }
    }

    // Start call timer
    function startCallTimer() {
        callStartTime = Date.now();
        callTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            if (callDuration) {
                callDuration.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    // Stop call timer
    function stopCallTimer() {
        if (callTimer) {
            clearInterval(callTimer);
            callTimer = null;
        }
        if (callDuration) {
            callDuration.textContent = '00:00';
        }
    }

    // Simulate incoming call
    async function simulateIncomingCall(phoneNumber) {
        if (isCallActive) return;
        
        console.log(`📞 Simulating call from: ${phoneNumber}`);
        
        isCallActive = true;
        
        // Add ringing animation
        const phoneMockup = document.querySelector('.phone-mockup');
        if (phoneMockup) {
            phoneMockup.classList.add('ringing');
        }
        
        // Start call timer
        startCallTimer();
        
        // Show initial loading state
        updateCallerDisplay({
            name: 'Unknown Caller',
            organization: 'Verifying...',
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23666666'/%3E%3Ctext x='50' y='65' font-family='Arial' font-size='40' text-anchor='middle' fill='white'%3E%3F%3C/text%3E%3C/svg%3E",
            verified: null, // Use null for loading state
            trustScore: null, // Use null to ensure no stars are shown
            spamReports: 0,
            userReports: 0,
            isLoading: true // Explicit loading flag
        }, phoneNumber);
        
        // Verify the number (with realistic delay)
        setTimeout(async () => {
            const callerData = await verifyPhoneNumber(phoneNumber);
            updateCallerDisplay(callerData, phoneNumber);
            
            // Remove ringing animation after verification
            setTimeout(() => {
                if (phoneMockup) {
                    phoneMockup.classList.remove('ringing');
                }
            }, 1000);
        }, 1500);
    }

    // End call
    function endCall() {
        isCallActive = false;
        stopCallTimer();
        
        const phoneMockup = document.querySelector('.phone-mockup');
        if (phoneMockup) {
            phoneMockup.classList.remove('ringing');
        }
        
        // Reset screen background
        if (callScreen) {
            callScreen.style.background = 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)';
        }
        
        console.log('📞 Call ended');
    }

    // Event listeners
    if (simulateCall) {
        simulateCall.addEventListener('click', () => {
            // Get the next number in the alternating sequence
            const nextNumber = getNextPhoneNumber();
            simulateIncomingCall(nextNumber);
        });
    }

    if (answerCall) {
        answerCall.addEventListener('click', () => {
            console.log('✅ Call answered');
            endCall();
        });
    }

    if (declineCall) {
        declineCall.addEventListener('click', () => {
            console.log('❌ Call declined');
            endCall();
        });
    }

    // Demo panel toggle
    if (togglePanel && demoPanel) {
        togglePanel.addEventListener('click', () => {
            demoPanel.classList.toggle('expanded');
            const icon = togglePanel.querySelector('i');
            if (icon) {
                icon.className = demoPanel.classList.contains('expanded') ? 
                    'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
        });
    }

    // Initialize
    updateClock();
    setInterval(updateClock, 1000);
    
    // Start with our test verified number
    setTimeout(() => {
        simulateIncomingCall('+1-777-TEST-555');
    }, 2000);
    await initializeBlockchain();
    
    // Auto-start demo call after 3 seconds
    setTimeout(() => {
        // Start with a verified number (shouldUseVerifiedNumber is initially true)
        const nextNumber = getNextPhoneNumber();
        simulateIncomingCall(nextNumber);
    }, 3000);
    
    console.log('📱 TrueCaller interface initialized');
});
