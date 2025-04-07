document.addEventListener('DOMContentLoaded', function() {





    const bundleMessageElement = document.getElementById('bundleDistMessage');

    // Hide the message div immediately when the extension loads
    if (bundleMessageElement) {
        bundleMessageElement.style.display = 'none'; // Hide the message div at the start
    }






function resetFields() {





    // Reset text fields
    document.getElementById('tickerValue').textContent = 'Loading....';
    document.getElementById('tokenAge').textContent = '..';
    document.getElementById('holdersCount').textContent = '..';
    document.getElementById('marketCap').textContent = 'Loading....';

    // Reset the Mint, Freeze, Locked, and DEX statuses
    const resetStatus = (id, iconClass, statusText) => {
        const element = document.getElementById(id);
        if (element) {
            element.querySelector('i').className = iconClass;
            element.querySelector('span').textContent = statusText;
        }
    };

    resetStatus('mintStatus', 'fas fa-check-circle success', 'Mint');
    resetStatus('freezeStatus', 'fas fa-check-circle success', 'Freeze');
    resetStatus('lockedStatus', 'fas fa-check-circle success', 'Locked');
    resetStatus('dexStatus', 'fas fa-check-circle success', 'DEX');

    // Reset platform links
    const platformLinks = document.querySelectorAll('.platform-link');
    platformLinks.forEach((link) => {
        link.href = '#';
        link.classList.add('inactive');
    });

    // Reset stats in the Bundle Analysis
    document.querySelector('.bundle-stats div:nth-child(1) strong').textContent = 'Loading....';
    document.querySelector('.bundle-stats div:nth-child(2) strong').textContent = 'Loading....';

    // Reset stats in Sniper Analysis
    document.querySelector('.timeline-stats .stat-item:nth-child(1) strong').textContent = 'Loading....';
    document.querySelector('.timeline-stats .stat-item:nth-child(2) strong').textContent = 'Loading....';

    // Reset stats in Holders Analysis
    document.querySelector('#clustersView .chart-stat strong').textContent = 'Loading..';
    document.querySelector('#topHoldersView .chart-stat strong').textContent = 'Loading...';

    console.log('[INFO] Fields reset to placeholders.');
}







function resetCharts() {



    const bundleChartContainer = document.querySelector('.bundle-chart-container');
    const bundleMessageElement = document.getElementById('bundleDistMessage');

if (bundleChartContainer) {
    // Clear out previous canvases
    bundleChartContainer.innerHTML = ''; 

    // Create an empty placeholder div with a set height
    const emptyContainer = document.createElement('div');
    emptyContainer.style.width = '853.2px';  // Set desired width here
emptyContainer.style.height = '158.2px';  // Set desired height here
    emptyContainer.style.backgroundColor = '#FFFFFF0D';  // Optional: Add a background color for visibility
    // emptyContainer.style.boxShadow = '0 4px 5px grey';  
    bundleChartContainer.appendChild(emptyContainer); // Add the placeholder div
}



if (bundleMessageElement) {
    // Clear out previous canvases
    bundleMessageElement.innerHTML = ''; 
    bundleMessageElement.style.boxShadow = 'none';

}



    if (clusterChart instanceof Chart) {
        console.log('Destroying existing Cluster chart instance');
        clusterChart.destroy();
        clusterChart = null; // Reset the reference
    }

    if (timelineChart instanceof Chart) {
        console.log('Destroying existing Timeline chart instance');
        timelineChart.destroy();
        timelineChart = null; // Reset the reference
    }

    if (topHoldersChartInstance instanceof Chart) {
        topHoldersChartInstance.destroy();
        topHoldersChartInstance = null;
    }

    console.log('[INFO] All charts reset to empty state.');
}





    
// Function to fetch data from the API
const fetchData = async () => {
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/fetchData');
        const response = await fetch('http://localhost:3000/fetchData');
        
        
        const data = await response.json();
        console.log("Fetched the data !");
        console.log(data);
        
        if (Array.isArray(data) && data.length > 0) {
            const latestData = data[data.length - 1];
            
            updateTicker(latestData);         // Update the Ticker
            // Update working components
            updateSidepanel(latestData);
            updateDexStatus(latestData);
            updateLockedStatus(latestData);
            updateFreezeStatus(latestData);
            updateMintStatus(latestData);

            updateFreshWalletData(latestData); // Add Fresh Wallet update
             // Update platform links
            updatePlatformLinks(latestData);
            updateHoldersCount();
        }
    } catch (error) {
        console.error('[ERROR] Error in fetchData:', error);
    }
};


// Function to send contract address to the Telegram bot
const sendContractAddressToBot = async (contractAddress) => {
    try {
        // const apiEndpoint = 'http://ec2-3-80-88-97.compute-1.amazonaws.com:3001/sendContractAddress'; // Backend endpoint
        const apiEndpoint = 'http://localhost:3001/sendContractAddress'; // Backend endpoint
       
        
        // Log the payload for debugging
        console.log('[DEBUG] Payload being sent:', JSON.stringify({ contractAddress }));

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contractAddress }), // Correct key for backend
        });

        if (response.ok) {
            console.log('[INFO] Contract address sent successfully:', contractAddress);
        } else {
            console.error('[ERROR] Failed to send contract address. Response:', response.status);
        }
    } catch (error) {
        console.error('[ERROR] Error while sending contract address:', error.message);
    }
};




// Function to clear API data
const clearAPIData = async () => {
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/clearData', {
        const response = await fetch('http://localhost:3000/clearData', {
            method: 'POST',
        });

        if (response.ok) {
            console.log('[INFO] API data cleared successfully.');
        } else {
            console.error('[ERROR] Failed to clear API data:', response.statusText);
        }
    } catch (error) {
        console.error('[ERROR] Error clearing API data:', error);
    }
};


const updateHoldersCount = () => {
    const holdersCountElement = document.getElementById('holdersCount');
    if (holdersCountElement) {
        holdersCountElement.textContent = '>150';
    }
};

// Function to update the Ticker value dynamically
// const updateTicker = (latestData) => {
//     const tickerElement = document.getElementById('tickerValue'); // Target the ticker element
//     const tickerValue = latestData?.bundleData?.leftPanelData?.Ticker; // Get ticker value from API

//     if (tickerElement && tickerValue) {
//         tickerElement.textContent = `$${tickerValue}`; // Update the ticker value
//         console.log('[INFO] Ticker updated:', tickerValue);
//     } else {
//         console.warn('[WARN] Ticker data missing or element not found.');
//     }
// };
const updateTicker = (latestData) => {
    const tickerElement = document.getElementById('tickerValue');
    const tickerName = latestData?.tickerName;
    if (tickerElement && tickerName) {
        // Extract the text within parentheses (e.g., "$JAMES")
        const match = tickerName.match(/\(([^)]+)\)/);
        let visibleTicker = match ? match[1] : tickerName;
        // Remove the '$' character if present
        visibleTicker = visibleTicker.replace('$', '');
        tickerElement.textContent = visibleTicker;
        console.log('[INFO] Ticker updated:', visibleTicker);
    } else {
        console.warn('[WARN] Ticker data missing or element not found.');
    }
};


// Function to update Fresh Wallet data dynamically
const updateFreshWalletData = (latestData) => {
    const freshWalletData = latestData['🎯 First 20'];
    if (!freshWalletData) {
        console.warn('[INFO] No Fresh Wallet data found in API response.');
        return;
    }

    // Extract Fresh Wallet count and percentage using regex
    const match = freshWalletData.match(/(\d+)\sFresh\s•\s([\d.]+)%/);

    if (!match) {
        console.error('[ERROR] Invalid Fresh Wallet data format:', freshWalletData);
        return;
    }

    const freshCount = match[1]; // Number of fresh wallets
    const freshPercentage = match[2]; // Percentage of fresh wallets

    // Update the Fresh Wallet count
    const statCountElement = document.querySelector('.stat-values .stat-count');
    if (statCountElement) {
        statCountElement.textContent = `[${freshCount}]`;
        console.log('[INFO] Fresh Wallet Count updated:', freshCount);
    }

    // Update the Fresh Wallet percentage
    const statPercentageElement = document.querySelector('.stat-values .stat-percentage');
    if (statPercentageElement) {
        statPercentageElement.textContent = `${freshPercentage}%`;
        console.log('[INFO] Fresh Wallet Percentage updated:', freshPercentage);
    }
};





const updatePlatformLinks = (latestData) => {
    const pumpFunLink = latestData.pumpFunLink;
    const solscanLink = latestData.solscanLinks?.[0]; // First Solscan link
    const dexscreenerLink = latestData.dexscreenerLink;

    // Extract the Twitter link from the latest data
    const twitterLink = latestData.twitterLinks?.[0]; // First Twitter link

    // Extract the Telegram link from the latest data
    const telegramLink = latestData.telegramLinks?.[0]; // First Telegram link

    // Dynamically handle the Website link
    let websiteLink = '';
    if (latestData.websiteLinks && latestData.websiteLinks.length > 0) {
        // If there's only 1 link, use that one
        websiteLink = latestData.websiteLinks[0];

        // If there are 2 or more links, use the 2nd one
        if (latestData.websiteLinks.length > 1) {
            websiteLink = latestData.websiteLinks[1];
        }
    }

    // Update Pump Fun Link
    const pumpLinkElement = document.querySelector("a[title='Pump']");
    if (pumpLinkElement && pumpFunLink) {
        pumpLinkElement.href = pumpFunLink;
        pumpLinkElement.classList.remove('inactive');
        console.log('[INFO] Pump Fun link updated:', pumpFunLink);
    } else {
        pumpLinkElement.classList.add('inactive');
        pumpLinkElement.removeAttribute('href');
        console.log('[INFO] Pump Fun link inactive');
    }

    // Update Solscan Link
    const solscanLinkElement = document.querySelector("a[title='Solscan']");
    if (solscanLinkElement && solscanLink) {
        solscanLinkElement.href = solscanLink;
        solscanLinkElement.classList.remove('inactive');
        console.log('[INFO] Solscan link updated:', solscanLink);
    } else {
        solscanLinkElement.classList.add('inactive');
        solscanLinkElement.removeAttribute('href');
        console.log('[INFO] Solscan link inactive');
    }

    // Update DexScreener Link
    const dexscreenerLinkElement = document.querySelector("a[title='DexScreener']");
    if (dexscreenerLinkElement && dexscreenerLink) {
        dexscreenerLinkElement.href = dexscreenerLink;
        dexscreenerLinkElement.classList.remove('inactive');
        console.log('[INFO] DexScreener link updated:', dexscreenerLink);
    } else {
        dexscreenerLinkElement.classList.add('inactive');
        dexscreenerLinkElement.removeAttribute('href');
        console.log('[INFO] DexScreener link inactive');
    }

    // Update Twitter Link
    const twitterLinkElement = document.querySelector("a[title='Twitter']");
    if (twitterLinkElement && twitterLink) {
        twitterLinkElement.href = twitterLink;
        twitterLinkElement.classList.remove('inactive');
        console.log('[INFO] Twitter link updated:', twitterLink);
    } else {
        twitterLinkElement.classList.add('inactive');
        twitterLinkElement.removeAttribute('href');
        console.log('[INFO] Twitter link inactive');
    }

    // Update Telegram Link
    const telegramLinkElement = document.querySelector("a[title='Telegram']");
    if (telegramLinkElement && telegramLink) {
        telegramLinkElement.href = telegramLink;
        telegramLinkElement.classList.remove('inactive');
        console.log('[INFO] Telegram link updated:', telegramLink);
    } else {
        telegramLinkElement.classList.add('inactive');
        telegramLinkElement.removeAttribute('href');
        console.log('[INFO] Telegram link inactive');
    }

    // Update Website Link
    const websiteLinkElement = document.querySelector("a[title='Website']");
    if (websiteLinkElement && websiteLink) {
        websiteLinkElement.href = websiteLink;
        websiteLinkElement.classList.remove('inactive');
        console.log('[INFO] Website link updated:', websiteLink);
    } else {
        websiteLinkElement.classList.add('inactive');
        websiteLinkElement.removeAttribute('href');
        console.log('[INFO] Website link inactive');
    }
};





// Function to update the side panel dynamically
const updateSidepanel = (latestData) => {
    // Update Market Cap
    const marketCapElement = document.getElementById('marketCap');
    let marketCapValue = null;

    if (latestData['💰 MC']) {
        marketCapValue = latestData['💰 MC'];
    } else if (latestData['🦅 Dexscreener'] && Array.isArray(latestData['🦅 Dexscreener'])) {
        const marketCapLine = latestData['🦅 Dexscreener'].find(line => line.includes('💰 MC:'));
        if (marketCapLine) {
            marketCapValue = marketCapLine.split(': ')[1];
        }
    }

    if (marketCapElement) {
        marketCapElement.textContent = marketCapValue || 'N/A';
        console.log('[INFO] Market Cap updated:', marketCapValue);
    }



// Update Age
const ageValue = latestData['🕒 Age'] || latestData['⏳ Age'];
const ageElement = document.getElementById('tokenAge');

if (ageElement) {
    if (ageValue) {
        // Regex to match "years", "months", "days", and "hours"
        const yearsMatch = ageValue.match(/(\d+)\s?yrs?/); // Match years
        const monthsMatch = ageValue.match(/(\d+)\s?months?/); // Match months
        const daysMatch = ageValue.match(/(\d+)\s?days?/); // Match days
        const hoursMatch = ageValue.match(/(\d+)\s?hrs?/); // Match hours

        // Determine which value to display based on priority
        let formattedAge = '';
        if (yearsMatch) {
            formattedAge = `${yearsMatch[1]} y`;
        } else if (monthsMatch) {
            formattedAge = `${monthsMatch[1]} m`;
        } else if (daysMatch) {
            formattedAge = `${daysMatch[1]} d`;
        } else if (hoursMatch) {
            formattedAge = `${hoursMatch[1]} h`;
        }

        // Update the age element
        ageElement.textContent = formattedAge || 'N/A';
        console.log('[INFO] Token Age updated:', formattedAge);
    } else {
        ageElement.textContent = 'N/A';
        console.warn('[WARN] Age data missing.');
    }
}


};

// Function to update the Freeze status dynamically
const updateFreezeStatus = (latestData) => {
    const freezeElement = document.getElementById('freezeStatus')?.querySelector('i');
    const freezeData = latestData['🥶 Freeze Auth'];

    if (freezeElement && freezeData) {
        const isFrozen = freezeData.includes('Revoked');
        freezeElement.className = isFrozen ? 'fas fa-check-circle success' : 'fas fa-times-circle danger';
        console.log('[INFO] Freeze status:', freezeData);
    }
};

// Function to update the Mint status dynamically
const updateMintStatus = (latestData) => {
    const mintElement = document.getElementById('mintStatus')?.querySelector('i');
    const mintData = latestData['🌿 Mint Auth'];

    if (mintElement && mintData) {
        const isMintDisabled = mintData.includes('Revoked');
        mintElement.className = isMintDisabled ? 'fas fa-check-circle success' : 'fas fa-times-circle danger';
        console.log('[INFO] Mint status:', mintData);
    }
};

const updateDexStatus = (latestData) => {
    const dexData = latestData['🦅 Dexscreener'] || [];
    const dexElement = document.getElementById('dexStatus')?.querySelector('i');

    if (dexElement) {
        // Find the line that contains "Paid:"
        const paidLine = dexData.find(line => line.includes('Paid:'));
        let statusSymbol = null;
        if (paidLine) {
            // Extract the status symbol (✅ or ❌) after "Paid:"
            const match = paidLine.match(/Paid:\s*(✅|❌)/);
            if (match) {
                statusSymbol = match[1];
            }
        }
        
        if (statusSymbol === '❌') {
            // Not paid -> danger icon
            dexElement.className = 'fas fa-times-circle danger';
            console.log('[INFO] DEX status: Not Paid');
        } else if (statusSymbol === '✅') {
            // Paid -> success icon
            dexElement.className = 'fas fa-check-circle success';
            console.log('[INFO] DEX status: Paid');
        } else {
            console.warn('[WARN] DEX Paid status not found. Leaving default icon.');
        }
    }
};

// Function to update the Locked status dynamically
const updateLockedStatus = (latestData) => {
    const lockedData = latestData['💧 Liq'] || latestData['💧 LIQ'];
    const lockedElement = document.getElementById('lockedStatus')?.querySelector('i');

    if (lockedElement) {
        const isLocked = lockedData?.includes('Raydium') || lockedData?.includes('SOL') || lockedData?.includes('PumpFun');
        lockedElement.className = isLocked ? 'fas fa-check-circle success' : 'fas fa-times-circle danger';
        console.log('[INFO] Locked status:', isLocked ? 'Enabled' : 'Disabled');
    }
};




// Event listener for the contract address input
document.querySelector('.address-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') { // Trigger on "Enter" key press
        const contractAddress = e.target.value.trim();

        if (!contractAddress) {
            console.warn('[WARNING] Contract address is empty!');
            return;
        }

        console.log('[INFO] New contract address entered. Resetting fields and charts:', contractAddress);

        try {
            // Reset charts and fields
            resetFields();
            resetCharts();
        } catch (error) {
            console.error('[ERROR] An error occurred while resetting fields or charts:', error);
            return; // Exit if resetting fails
        }
 // Clear API data before sending a new contract address
 try {
    await clearAPIData();
    console.log('[INFO] API data cleared successfully.');
} catch (error) {
    console.error('[ERROR] Failed to clear API data:', error);
    return; // Exit if clearing API data fails
}

        console.log('[INFO] Sending contract address to Telegram bot:', contractAddress);

        try {
            // Send the contract address to the bot
            await sendContractAddressToBot(contractAddress);
            // if contractAddress is present in db then we have to update time-stamp only
            await checkAndUpdateContractAddress(contractAddress)
            // await saveContractAddressToDB(contractAddress)
            
        } catch (error) {
            console.error('[ERROR] An error occurred while sending contract address to the bot:', error);
        }
    }
});

// async function saveContractAddressToDB(contractAddress) {
//     try {
//         const uid = localStorage.getItem('extension_uid');
//         if (!uid) {
//             console.warn('[WARNING] UID not found in localStorage.');
//             return;
//         }

//         const response = await fetch('http://localhost:3000/api/uid/add-contractaddress', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ uid, contractAddress })
//         });

//         if (response.ok) {
//             console.log('[INFO] Contract address saved to DB successfully.');
//         } else {
//             console.error('[ERROR] Failed to save contract address. Status:', response.status);
//         }
//     } catch (err) {
//         console.error('[ERROR] Exception while saving contract address to DB:', err);
//     }
// }  

async function checkAndUpdateContractAddress(contractAddress) {
    try {
        const uid = localStorage.getItem('extension_uid');
        if (!uid) {
            console.warn('[WARNING] UID not found in localStorage.');
            return;
        }

        const response = await fetch('http://localhost:3000/api/contract/check-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, contractAddress })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('[INFO]', result.message);
        } else {
            console.error('[ERROR]', result.error || 'Unknown error occurred');
        }
    } catch (err) {
        console.error('[ERROR] Exception during contract check/update:', err);
    }
}



// Initial data fetch
fetchData();

// Fetch data every 5 seconds
setInterval(fetchData, 10000);





//Above is the logic of script.js (parameters like MarketCap,Age,Holders,Freeze,Mint,Dex etc).







let bundleUpdateInterval = null;

// Function to update Bundle Stats
async function updateBundleStats(data) {
    const secondItem = data[0];
    const bundleData = secondItem?.bundleData?.bundleData;
    console.log('Data passed to updateBundleStats:', data);
    console.log('Bundle Data Array:', bundleData);

    const activeBundlesElement = document.querySelector('.bundle-stats div:nth-child(1) strong');

    // Check if bundleData exists and is an array
    const activeBundlesCount = (Array.isArray(bundleData)) ? bundleData.length : 0;

    if (activeBundlesElement) {
        // Update the Active Bundles count based on the length of bundleData array
        activeBundlesElement.textContent = activeBundlesCount || '0';
        // Change text color to red if Active Bundles > 5
        activeBundlesElement.style.color = (activeBundlesCount > 5) ? '#ff1b4e' : '';
    }
}

/**
 * [CHANGED FUNCTION] updateBundleDistChart
 *   - Dynamically create a canvas for each bundle.
 *   - Scale each canvas size or chart radius based on the bundle's percentage.
 */
function updateBundleDistChart(apiData) {
    const bundleMessageElement = document.getElementById('bundleDistMessage');
    const bundleChartContainer = document.querySelector('.bundle-chart-container');
    if (!bundleChartContainer) {
        console.error('[Bundle Chart] .bundle-chart-container not found. Clearing update interval.');
        if (bundleUpdateInterval) clearInterval(bundleUpdateInterval);
        return;
    }

    try {
        console.log('[Bundle Chart] Fetched API data:', apiData);

        // Validate API response structure
        if (!apiData || !Array.isArray(apiData) || apiData.length < 1) {
            console.error('[Bundle Chart] Invalid API data structure:', apiData);
            return;
        }

        // If the newest data is at the end:
        const bundleInfo = apiData[0]?.bundleData?.bundleData;
        const leftPanelData = apiData[0]?.bundleData?.leftPanelData;

        if (!leftPanelData) {
            console.error('[Bundle Chart] Missing left panel data:', { bundleInfo, leftPanelData });
            return;
        }

        // Dynamically update "Active Total" with left panel data
        const totalHoldingElement = document.querySelector('.bundle-stats div:nth-child(2) strong');
        if (totalHoldingElement) {
            let totalHoldingValue = parseFloat(leftPanelData['Held Percentage'] || '0');
            totalHoldingElement.textContent = `${totalHoldingValue.toFixed(1)}%`;
            // Change text color to red if Active Total % > 15
            totalHoldingElement.style.color = (totalHoldingValue > 15) ? '#ff1b4e' : '';
        }

        // If bundleInfo is empty, show the "everything has been sold" message
        if (!bundleInfo || !bundleInfo.length) {
            console.warn('[Bundle Chart] No bundles available. Displaying message.');
            bundleMessageElement.textContent = "It looks like everything held has been sold.";
            bundleMessageElement.style.display = 'block';
            bundleChartContainer.style.display = 'none';
            return;
        } else {
            bundleChartContainer.style.display = 'flex';
            if (bundleMessageElement) {
                bundleMessageElement.style.display = 'none';
            }
        }

        console.log('[Bundle Chart] Processed bundle data:', bundleInfo);

        // Convert each bundle's "percentage" string to a number for chart sizing
        const numericBundleData = bundleInfo.map((bundle) => {
            // e.g. "3.79%" => 3.79
            const rawPercent = parseFloat(bundle.percentage.replace('%', '')) || 0;
            // Extract Bundle ID from the 'title'
            const bundleID = bundle.title.match(/Bundle ID: (\d+)/)?.[1];
            // Extract Token % and Holding % from the 'title' field using regex
            const tokenPercentMatch = bundle.title.match(/Token %:\s([\d\.]+)%/);
            const holdingPercentMatch = bundle.title.match(/Holding %:\s([\d\.]+)%/);
            const tokenPercent = tokenPercentMatch ? parseFloat(tokenPercentMatch[1]) : 0;
            const holdingPercent = holdingPercentMatch ? parseFloat(holdingPercentMatch[1]) : 0;

            return {
                ...bundle,
                numericPercent: rawPercent,
                bundleID,
                tokenPercent,
                holdingPercent
            };
        });

        // Determine the maximum percentage for scaling
        const maxPercent = Math.max(...numericBundleData.map(b => b.numericPercent));

        // Clear out any previously created canvases
        bundleChartContainer.innerHTML = '';

        // Destroy old charts if they exist
        if (window.bundleChartsArray && window.bundleChartsArray.length) {
            window.bundleChartsArray.forEach(ch => ch.destroy());
        }
        window.bundleChartsArray = [];

        numericBundleData.forEach((bundle) => {
            // Create a canvas for this bundle
            const canvas = document.createElement('canvas');
            canvas.className = 'bundle-canvas';

            // Scale chart size based on percentage
            const minSize = 60;
            const maxSize = 220;
            let ratio = (bundle.numericPercent / maxPercent);
            ratio = Math.max(0, Math.min(1, ratio)); // Ensure ratio is between 0 and 1
            const canvasSize = minSize + ratio * (maxSize - minSize);
            canvas.style.width = canvasSize + 'px';
            canvas.style.height = canvasSize + 'px';

            // Append the canvas to the container
            bundleChartContainer.appendChild(canvas);

            // Adjust the slices based on "This Bundle %" (holdingPercent / tokenPercent) * 100
            const calcThisBundlePercent = bundle.tokenPercent !== 0
                ? Math.min((bundle.holdingPercent / bundle.tokenPercent) * 100, 100)
                : 0;

            const chartData = {
                labels: ['Active %', 'Remaining'],
                datasets: [{
                    parsing: { key: 'value' },
                    data: [
                        { value: calcThisBundlePercent, bundleID: bundle.bundleID },
                        { value: 100 - calcThisBundlePercent, bundleID: bundle.bundleID }
                    ],
                    backgroundColor: [
                        'rgba(255, 28, 77, 1)',
                        'rgba(128, 128, 128, 0.3)'
                    ],
                    borderColor: [
                        'rgba(255, 28, 77, 1)',
                        'rgba(128, 128, 128, 0.3)'
                    ],
                    borderWidth: 1
                }]
            };

            console.log('Creating chart for Bundle ID:', bundle.bundleID);
            console.log('numericBundleData:', numericBundleData);

            const chart = new Chart(canvas, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: false,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            size: 10,
                            titleFont: {
                                size: 8,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 12
                            },
                            position: 'nearest',
                            yAlign: 'bottom',
                            xAlign: 'center',
                            usePointStyle: true,
                            caretSize: 5,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            displayColors: false,
                            callbacks: {
                                title: function() {
                                    return '';
                                },
                                label: function(context) {
                                    const raw = context.raw;
                                    const foundBundle = numericBundleData.find(b => b.bundleID === raw.bundleID);
                                    if (foundBundle) {
                                        const holdingPercent = foundBundle.holdingPercent || 0;
                                        const tokenPercent = foundBundle.tokenPercent;
                                        return [
                                            `Active: ${holdingPercent.toFixed(2)}%`,
                                            `Bundled: ${tokenPercent.toFixed(2)}%`
                                        ];
                                    } else {
                                        return '';
                                    }
                                }
                            }
                        }
                    }
                }
            });
            window.bundleChartsArray.push(chart);
        });
    } catch (error) {
        console.error('[Bundle Chart] Error updating chart:', error);
    }
}

async function fetchAndUpdateBundleDistChart() {
    console.log('[DEBUG] Fetching data for bundle chart...');
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/fetchData');
        const response = await fetch('http://localhost:3000/fetchData');

        if (!response.ok) throw new Error(`[Bundle Chart] HTTP error! Status: ${response.status}`);
        const data = await response.json();
        console.log('[DEBUG] Bundle Chart API data:', data);
        updateBundleDistChart(data);
        updateBundleStats(data);
    } catch (error) {
        console.error('[Bundle Chart] Error fetching data:', error);
    }
}

// Initialize chart and set polling
(function initializeBundleChart() {
    console.log('[DEBUG] Initializing bundle chart...');
    fetchAndUpdateBundleDistChart();
    bundleUpdateInterval = setInterval(fetchAndUpdateBundleDistChart, 20000);
})();










let clusterChart = null; // Store the chart instance globally

function updateClusterChart(data) {
    console.log('Data passed to updateClusterChart:', data);

    const ctx = document.getElementById('clusterChart');
    const chartStatElement = document.querySelector('#clustersView .chart-stat strong');
    
    // Immediately update Cluster Holding text to "loading" or "no data"
    if (chartStatElement) {
        chartStatElement.textContent = 'Loading...'; // Display 'loading' while waiting for data
    }

    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }

    // Dynamically adjust canvas size based on parent container
    const container = ctx.parentNode; // Assuming the canvas is inside a container
    ctx.width = container.offsetWidth * 0.8; // 80% of the container's width
    ctx.height = ctx.width; // Make it square for a polar chart
    
    const tokenData = data.find(item => item.walletList);
    if (!tokenData || !Array.isArray(tokenData.walletList)) {
        console.error('Invalid data structure: walletList not found');
        // Immediately update to 'No Data Available'
        if (chartStatElement) {
            chartStatElement.textContent = 'No Data';
        }
        return;
    }

    // Group wallets by color and calculate total percentages
    const groupedData = tokenData.walletList.reduce((acc, wallet) => {
        if (!acc[wallet.color]) {
            acc[wallet.color] = {
                color: wallet.color || 'rgba(200, 200, 200, 0.5)', // Default color
                totalPercentage: 0,
                wallets: []
            };
        }
        acc[wallet.color].wallets.push(wallet);
        acc[wallet.color].totalPercentage += parseFloat(wallet.percentage) || 0;
        return acc;
    }, {});

    const chartData = Object.values(groupedData)
        .map(group => ({
            value: group.totalPercentage,
            color: group.color,
            wallets: group.wallets
        }))
        .sort((a, b) => b.value - a.value);

    const totalHoldingExcludingMax = chartData
        .slice(1) // Exclude the first (maximum percentage cluster)
        .reduce((sum, cluster) => sum + cluster.value, 0);

    // Check if there's valid data for clusters or wallets
    if (totalHoldingExcludingMax && totalHoldingExcludingMax > 0) {
        // Update the Cluster Holding value immediately
        if (chartStatElement) {
            chartStatElement.textContent = `${totalHoldingExcludingMax.toFixed(2)}%`;
            // Change the text color to red if value exceeds 15%
            if (totalHoldingExcludingMax > 15) {
                chartStatElement.style.color = '#ff1b4e';
            } else {
                chartStatElement.style.color = '';
            }
        }
    } else {
        // If no data is available, show 'No Data Available'
        if (chartStatElement) {
            chartStatElement.textContent = 'No Data';
        }
    }

    // Set "Others" as the label for the highest percentage cluster
    chartData[0].value = 100 - totalHoldingExcludingMax; // Update the value for "Others"
    chartData[0].wallets = [];
    chartData[0].label = 'Unclustered';

    // Dynamically label the remaining clusters as "Cluster 1", "Cluster 2", etc.
    for (let i = 1; i < chartData.length; i++) {
        chartData[i].label = `Cluster ${i}`;
    }

    const backgroundColors = chartData.map((item, index) => {
        if (index === 0) {
            return 'rgba(128, 128, 128, 1)'; // Grey for the "Others" cluster
        }
        const intensity = Math.max(0, 255 - index * 25); // Red intensity starts at 255 and decreases per index
        return `rgba(${intensity}, 28, 36, 1)`; 
    });

    // Create custom radius data for each arc
    const radiusData = chartData.map((item, index) => {
        return index === 0 ? 0.40 : 1 ; // "Others" gets 40% of the radius, others get full radius
    });

    if (clusterChart instanceof Chart) {
        console.log('Destroying existing Cluster chart instance');
        clusterChart.destroy();
    }

    clusterChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: chartData.map((item) => item.label || 'Others'),
            datasets: [
                {
                    data: chartData.map((item) => item.value),
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                bodyFont: {
                    size:12,
                    family: "'Inter', sans-serif",
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const group = chartData[context.dataIndex];
                            const walletCount = group.wallets.length;
                            return `${group.value.toFixed(2)}% ${walletCount > 0 ? `(${walletCount} wallets)` : ''}`;
                        },
                    },
                },
            },
            scales: {
                r: {
                    ticks: {
                        display: false, // Hide radial ticks
                        maxTicksLimit: 6, // Limit number of ticks
                    },
                    max: 100, // Set maximum scale value
                },
            },
            layout: {
                padding: 0, // Remove unnecessary padding
            },
        },
        plugins: [
            {
                id: 'customRadiusAndArc',
                beforeDraw(chart) {
                    const ctx = chart.ctx;
                    const dataset = chart.data.datasets[0];
                    const meta = chart.getDatasetMeta(0);

                    // Dynamically calculate radius based on canvas size
                    const maxRadius = Math.min(chart.width, chart.height) / 2; // Half of the smallest dimension
                    meta.data.forEach((arc, index) => {
                        const customRadius = radiusData[index] || 1; // Default radius multiplier is 1
                        arc.outerRadius = maxRadius * customRadius; // Scale each arc
                    });

                    let currentAngle = Math.PI / 2; // Start from the top

                    const totalValue = dataset.data.reduce((a, b) => a + b, 0); // Total value of all clusters

                    meta.data.forEach((arc, index) => {
                        const value = dataset.data[index];
                        const percentage = value / totalValue; // Calculate percentage for the current cluster

                        // Calculate the arc angle based on percentage of the total value
                        const angle = percentage * Math.PI * 2; // Full circle (360 degrees) is 2 * Math.PI

                        // Set the start and end angles for each arc
                        arc.startAngle = currentAngle;
                        arc.endAngle = currentAngle + angle;
                        currentAngle = arc.endAngle; // Update for next segment
                    });
                },
            },
        ],
    });
}


async function fetchClusterDataAndUpdateChart() {
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/fetchData');
        const response = await fetch('http://localhost:3000/fetchData');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        updateClusterChart(data);
    } catch (error) {
        console.error('Error fetching cluster data:', error);
    }
}

fetchClusterDataAndUpdateChart();
setInterval(fetchClusterDataAndUpdateChart, 10000);








// --------------------------------------------
//  TOP HOLDERS CHART
// --------------------------------------------

let topHoldersChartInstance = null;

// Function to fetch data
async function fetchTopHoldersData() {
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/fetchData');
        const response = await fetch('http://localhost:3000/fetchData');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        updateTopHoldersChart(data); // Update the chart with the fetched data
    } catch (error) {
        console.error('Error fetching holder data:', error);
        const totalHoldingsElement = document.getElementById('totalHoldingsValue');
        if (totalHoldingsElement) {
            totalHoldingsElement.textContent = 'Error loading data';
        }
    }
}

// Function to update the chart
function updateTopHoldersChart(data) {
    const holdersCtx = document.getElementById('holdersChart');
    const totalHoldingsElement = document.getElementById('totalHoldingsValue');
    
    if (!holdersCtx) {
        console.error('Canvas element not found');
        return;
    }

    if (data.length > 0 && data[data.length - 1].walletList) {
        const latestData = data[data.length - 1];

        // Extract top 10 wallets from walletList
        const topWallets = latestData.walletList
            .sort((a, b) => b.percentage - a.percentage) // Sort by percentage in descending order
            .slice(0, 10); // Take the top 10 wallets

        const top10HolderData = topWallets.map((wallet) => wallet.percentage || 0);
        const top10HolderLabels = topWallets.map((wallet) => wallet.name || 'Unknown');

        const totalHoldings = top10HolderData.reduce((sum, value) => sum + value, 0);

        if (totalHoldingsElement) {
            totalHoldingsElement.textContent = `${totalHoldings.toFixed(1)}%`;
            // Set text color to red if totalHoldings exceeds 25%
            if (totalHoldings > 25) {
                totalHoldingsElement.style.color = '#ff1b4e'; 
            } else {
                totalHoldingsElement.style.color = '';
            }
        }

        // Fill missing holders with 0 if fewer than 10 holders are present
        while (top10HolderData.length < 10) {
            top10HolderData.push(0);
            top10HolderLabels.push(`Holder #${top10HolderData.length}`);
        }

        // Destroy existing chart instance if it exists
        if (topHoldersChartInstance instanceof Chart) {
            console.log('[Top Holders Chart] Destroying existing chart instance.');
            topHoldersChartInstance.destroy();
        }

        // Create chart with actual data
        topHoldersChartInstance = new Chart(holdersCtx, {
            type: 'bar',
            data: {
                labels: top10HolderLabels,
                datasets: [
                    {
                        data: top10HolderData,
                        backgroundColor: top10HolderData.map((value) =>
                            value < 4 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 28, 77, 0.6)'
                        ),
                        borderRadius: 4,
                        hoverBackgroundColor: top10HolderData.map((value) =>
                            value < 4 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 28, 77, 0.8)'
                        ),
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        displayColors: false, // This removes the color box in the hover state
                        backgroundColor: 'rgba(20, 20, 20, 0.95)',
                        titleColor: (context) => {
                            const value = context.raw;
                            return value < 5 ? '#ffffff' : '#adacac'; // Dark grey for wallets ≥5%
                        },
                        padding: 8,
                        bodyFont: {
                            size: 12,
                            family: "'Inter', sans-serif",
                        },
                        callbacks: {
                            title: function (context) {
                                return `${context[0].label}`;
                            },
                            label: function (context) {
                                return `Holding: ${context.raw}%`;
                            },
                        },
                    },
                },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    } else {
        if (totalHoldingsElement) {
            totalHoldingsElement.textContent = 'No data';
        }
    }
}

// Fetch data and update the chart immediately
fetchTopHoldersData();

// Set an interval to fetch data and update the chart every 10 seconds
setInterval(fetchTopHoldersData, 10000); // Adjust the interval as needed




// --------------------------------------------
// TIMELINE CHART (Sniper Analysis) - UPDATED
// --------------------------------------------

let timelineChart = null; // Keep a global reference to the chart instance

// Function to fetch sniper data from your backend
async function fetchSniperData() {
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/fetchData');
        const response = await fetch('http://localhost:3000/fetchData');
        const data = await response.json();
        console.log('Raw API response:', data);

        // You might have multiple tokens in the array— find the first that has '🎯 Snipers & Early Buyers' or '🛠 Deployer'
        const tokenData = data.find(item => item['🎯 Snipers & Early Buyers'] || item['🛠 Deployer']);
        if (!tokenData) {
            console.warn('No token data found in response');
            return null;
        }

        return tokenData;
    } catch (error) {
        console.error('Error fetching sniper data:', error);
        return null;
    }
}

// Utility to extract a numeric percentage from lines like: "└ 🔫 Sniped 6.391% for 1.9 SOL"
function extractSnipedPercent(line) {
    const match = line.match(/🔫(?: Sniped)?\s+([\d.]+)%/);
    return match ? parseFloat(match[1]) : null;
}

// Utility to extract a numeric holds % from lines like: "└ ⚠️ Holds 0.001% | $5,358"
function extractHoldsPercent(line) {
    const match = line.match(/Holds\s+([\d.]+)%/);
    return match ? parseFloat(match[1]) : null;
}

// Utility to check if line indicates a new entity block: (👷, 👤, 🤖, etc.)
function isEntityLine(line) {
    return (
        line.trim().startsWith('└👷') ||
        line.trim().startsWith('└ 👷') ||
        line.trim().startsWith('└ 👤') ||
        line.trim().startsWith('└ 🤖')
    );
}

// Utility to extract a "timestamp label" from lines (⌚️ ... or ⚠️ Block 0 Snipe!)
function extractTimestampLabel(line) {
    // Examples we might see:
    //  - "└ ⌚️ 1min 7sec"
    //  - "└ ⌚️ 11 sec after block 0"
    //  - "└ ⚠️ Block 0 Snipe!"

    const block0Match = line.match(/Block\s*(\d+)\s*Snipe/);
    if (block0Match) {
        return `Block ${block0Match[1]}`;
    }

    if (line.includes('⌚️')) {
        return line.replace('└ ⌚️', '').trim();
    }

    return null;
}

// Helper function to convert various timestamp label formats to number of seconds,
// making sure we properly handle "1min 7sec" as 67 seconds.
function getSecondsFromLabel(label) {
    console.log("Parsing label:", label);

    // If it's "Block 0", treat as 0
    if (label.includes('Block 0')) {
        return 0;
    }

    // If label includes "Xmin Ysec"
    let minSecMatch = label.match(/(\d+)min\s*(\d*)sec?/);
    if (minSecMatch) {
        const minutes = parseInt(minSecMatch[1], 10) || 0;
        const seconds = parseInt(minSecMatch[2], 10) || 0;
        return minutes * 60 + seconds;
    }

    // If label looks like "X sec" or "X sec after block Y"
    let secMatch = label.match(/(\d+)\s*sec/);
    if (secMatch) {
        return parseInt(secMatch[1], 10);
    }

    // Fallback if we cannot parse
    return 999999;
}

// Main parser
function parseSniperData(tokenData) {
    // Prepare final result arrays
    let labels = [];
    let snipedValues = [];
    let holdsValues = [];

    // Defaults for developer
    let devSniped = 0;
    let devHolds = 0;

    // 1) Collect lines from "🛠 Deployer" and "🎯 Snipers & Early Buyers"
    const deployerLines = tokenData['🛠 Deployer'] || [];
    const sniperLines = tokenData['🎯 Snipers & Early Buyers'] || [];

    // --------------------------------------------
    // Step A: Parse the developer ("👷")
    // --------------------------------------------
    function parseDeveloperBlock(lines) {
        let capture = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if we hit an entity line
            if (isEntityLine(line)) {
                // If it's "👷", we begin capturing. If it's something else, we stop capturing
                if (line.includes('👷')) {
                    capture = true;
                } else {
                    capture = false;
                }
            } else if (capture) {
                const snipe = extractSnipedPercent(line);
                if (snipe !== null) {
                    devSniped = snipe;
                }
                const hold = extractHoldsPercent(line);
                if (hold !== null) {
                    devHolds = hold;
                }
            }
        }
    }

    // Parse developer from both sections
    parseDeveloperBlock(deployerLines);
    parseDeveloperBlock(sniperLines);

    // --------------------------------------------
    // Step B: Parse other participants (in "🎯 Snipers & Early Buyers")
    // --------------------------------------------
    let participants = []; // { timestampLabel, sniped, holds }

    let currentEntity = null;
    let currentBlockLines = [];

    // Finalize current block – parse out needed data
    function finalizeBlock() {
        if (!currentEntity || !currentBlockLines.length) return;

        // Skip if it's the developer block
        if (currentEntity.includes('👷')) {
            return;
        }

        let timestampLabel = null;
        let sniped = null;
        let holds = 0;

        for (const line of currentBlockLines) {
            if (!timestampLabel) {
                const ts = extractTimestampLabel(line);
                if (ts) {
                    timestampLabel = ts;
                }
            }
            if (sniped === null) {
                const snipeVal = extractSnipedPercent(line);
                if (snipeVal !== null) {
                    sniped = snipeVal;
                }
            }
            const holdVal = extractHoldsPercent(line);
            if (holdVal !== null) {
                holds = holdVal;
            }
        }

        if (timestampLabel && sniped !== null) {
            const secs = getSecondsFromLabel(timestampLabel);
            // Only push if <= 10 seconds
            if (secs <= 10) {
                // Convert final label to "Xs" to display
                const shortLabel = secs + 's';
                participants.push({
                    timestampLabel: shortLabel,
                    sniped,
                    holds
                });
            }
        }
    }

    for (let i = 0; i < sniperLines.length; i++) {
        const line = sniperLines[i];

        if (isEntityLine(line)) {
            finalizeBlock();
            currentEntity = line;
            currentBlockLines = [];
        } else {
            if (currentEntity) {
                currentBlockLines.push(line);
            }
        }
    }
    finalizeBlock();

    // --------------------------------------------
    // Step C: Build final arrays for Chart.js
    // --------------------------------------------
    labels.push('Dev');
    snipedValues.push(devSniped);
    holdsValues.push(devHolds);

    for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        labels.push(p.timestampLabel);
        snipedValues.push(p.sniped);
        holdsValues.push(p.holds);
    }

    console.log('[DEBUG] Final parse results:', {
        labels,
        snipedValues,
        holdsValues
    });

    return {
        labels,
        snipedValues,
        holdsValues
    };
}

// [CHANGED] - Updated to count the number of x-axis points (including 'Developer').
function updateActiveSnipes() {
    console.log('updateActiveSnipes called');
    const activeSnipesElement = document.querySelector('.timeline-stats .stat-item:nth-child(1) strong');
    if (!activeSnipesElement) return;

    try {
        // Get the "Active" dataset (assumed to be the first dataset in the chart)
        const activeDataset = timelineChart?.data?.datasets?.[0];
        if (!activeDataset || !activeDataset.data) {
            activeSnipesElement.textContent = '0';
            return;
        }

        // Count the number of non-zero values in the "Active" dataset
        const activeCount = activeDataset.data.filter(value => value > 0).length;
        console.log('[DEBUG] Active Snipes count (non-zero red bars):', activeCount);

        activeSnipesElement.textContent = activeCount;
        activeSnipesElement.style.color = activeCount > 5 ? '#ff1b4e' : 'inherit';
    } catch (error) {
        console.error('[ERROR] Failed to calculate active snipes:', error);
        activeSnipesElement.textContent = '0';
    }
}

function updateTotalSnipes() {
    console.log('updateTotalSnipes called');
    const totalHoldingElement = document.querySelector('.timeline-stats .stat-item:nth-child(2) strong');
    if (!totalHoldingElement) return;

    try {
        const holdsDataset = timelineChart?.data?.datasets?.[0];
        if (!holdsDataset) {
            totalHoldingElement.textContent = '0.000%';
            return;
        }

        let totalHolds = holdsDataset.data.reduce((acc, val) => acc + (val || 0), 0);
        totalHoldingElement.textContent = `${totalHolds.toFixed(3)}%`;
        totalHoldingElement.style.color = totalHolds > 15 ? '#ff1b4e' : 'inherit';
    } catch (error) {
        console.error('[ERROR] Failed to calculate total holds:', error);
        totalHoldingElement.textContent = '0.000%';
    }
}

async function renderSniperChart() {
    const timelineCtx = document.getElementById('timelineChart');
    if (!timelineCtx) {
        console.error('Timeline chart canvas not found!');
        return;
    }

    try {
        const sniperData = await fetchSniperData();
        if (!sniperData) {
            throw new Error('Failed to fetch sniper data');
        }

        const { labels, snipedValues, holdsValues } = parseSniperData(sniperData);
        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Active',
                    data: holdsValues,
                    backgroundColor: 'rgba(255, 0, 0, 0.8)', // Red
                    maxBarThickness: 30
                },
                {
                    label: 'Sniped',
                    data: snipedValues,
                    backgroundColor: 'rgba(128, 128, 128, 1)', // Gray
                    maxBarThickness: 30
                }
            ]
        };

        // Destroy old instance if it exists
        if (timelineChart instanceof Chart) {
            timelineChart.destroy();
        }

        // Create new bar chart
        timelineChart = new Chart(timelineCtx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 25  // Added top padding
                    }
                },
                interaction: {
                    mode: 'index',      // Force tooltip to show all datasets
                    intersect: false    // Show tooltip even when not directly intersecting a bar
                },
                plugins: {
                    // Disable legend keys
                    legend: {
                        display: false
                    },
                    tooltip: {
                        displayColors: false, // Remove color block in hover state
                        callbacks: {
                            label: function(context) {
                                const dataIndex = context.dataIndex;
                                const datasetLabel = context.dataset.label;
                                let value = context.parsed.y;
                                // For "Sniped", add the corresponding "Active" (holds) value to display combined value.
                                if (datasetLabel === 'Sniped') {
                                    const holdsValue = parseFloat(context.chart.data.datasets[0].data[dataIndex].toFixed(2));
                                    value = parseFloat((value + holdsValue).toFixed(2));
                                }
                                return `${datasetLabel}: ${value}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        stacked: true, 
                        maxTicksLimit: 5 
                    },
                    y: { 
                        beginAtZero: true, 
                        stacked: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%'; // Append % to the tick value
                            }
                        }
                    }
                },
                elements: {
                    bar: {
                        categoryPercentage: 0.5,  // Adjust space between bars in each category
                        barPercentage: 0.7,       // Adjust the width of each individual bar
                        maxBarThickness: 30,      // Prevent bars from exceeding 30px in width
                        minBarLength: 5           // Prevent bars from collapsing to zero width
                    }
                }
            }
        });

        // Update info boxes
        updateTotalSnipes();
        updateActiveSnipes();
    } catch (error) {
        console.error('Error rendering sniper chart:', error);
    }
}

// Initialize once, refresh every 10s
renderSniperChart();
setInterval(renderSniperChart, 10000);


    // --------------------------------------------
    //  WALLET RADIAL CHART
    // --------------------------------------------
    let walletRadialChart = null;

    function initWalletRadialChart(value, wallets) {
        const walletRadialCtx = document.getElementById('walletRadialChart');
        if (walletRadialCtx) {
            if (walletRadialChart) {
                walletRadialChart.destroy();
            }
            walletRadialChart = new Chart(walletRadialCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Remaining'],
                    datasets: [{
                        data: [value, 100 - value],
                        backgroundColor: [
                            'rgba(255, 107, 139, 0.8)',
                            'rgba(255, 255, 255, 0.05)'
                        ],
                        borderWidth: 0,
                        circumference: 270,
                        rotation: 225
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                },
                plugins: [{
                    id: 'centerText',
                    afterDraw: (chart) => {
                        const ctx = chart.ctx;
                        const centerX = chart.chartArea.left + chart.chartArea.width / 2;
                        const centerY = chart.chartArea.top + chart.chartArea.height / 2;

                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Draw number
                        ctx.fillStyle = '#fff';
                        ctx.font = '500 24px Inter';
                        ctx.fillText(wallets || '0', centerX, centerY - 8);

                        // Draw "Wallets" text
                        ctx.font = '12px Inter';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.fillText('Wallets', centerX, centerY + 10);

                        ctx.restore();
                    }
                }]
            });
        }
    }

    // Initialize chart when document loads
    const miniStats = document.querySelectorAll('.mini-stat.clickable');
    const walletSizeDisplay = document.querySelector('.wallet-size span');

    function updateActiveState(clickedElement) {
        miniStats.forEach(stat => stat.classList.remove('active'));
        clickedElement.classList.add('active');
    }

    function handleSelection(element) {
        const value = parseFloat(element.dataset.value);
        const wallets = parseInt(element.dataset.wallets);
        if (walletSizeDisplay) {
            walletSizeDisplay.textContent = `${value}%`;
        }
        initWalletRadialChart(value, wallets);
        updateActiveState(element);
    }

    miniStats.forEach(stat => {
        stat.addEventListener('click', function() {
            handleSelection(this);
        });
    });
    if (miniStats.length > 0) {
        handleSelection(miniStats[0]);
    }







    // --------------------------------------------
//  Function to Parse CTO Status from API Response
// --------------------------------------------
function getCTOStatusFromAPI(dexscreenerData) {
    if (!Array.isArray(dexscreenerData)) return false;

    // Find the line with "CTO:"
    const ctoLine = dexscreenerData.find((line) => line.includes('CTO:'));
    if (ctoLine) {
        // Check if the status is ✅ or ❌
        return ctoLine.includes('✅');
    }
    return false;
}

// --------------------------------------------
//  Function to Dynamically Update CTO or Dev Status
// --------------------------------------------
function updateCTOOrDevStatus(isCTO = true, devLink = null) {
    const communityStatus = document.querySelector('.community-status');
    if (communityStatus) {
        if (isCTO) {
            // Update for CTO
            communityStatus.innerHTML = `
                <div class="community-icons">
                    <i class="fas fa-users success"></i>
                </div>
                <span class="community-label success">CTO</span>`;
        } else {
            // Update for Dev with a clickable link
            communityStatus.innerHTML = `
                <div class="community-icons">
                    <i class="fas fa-user" style="color: rgba(255, 255, 255, 0.5);"></i>
                </div>
                <span class="community-label" style="color: rgba(255, 255, 255, 0.5); cursor: pointer;"
                      title="Dev wallet on Solscan">
                      <a href="${devLink}" target="_blank" style="color: rgba(255, 255, 255, 0.5); text-decoration: none;">Dev</a>
                </span>`;
        }
    }
}

// --------------------------------------------
//  Fetch Data and Update CTO or Dev Status
// --------------------------------------------
async function fetchAndUpdateCTOOrDevStatus() {
    try {
        // const response = await fetch('http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/fetchData'); // Replace with your API endpoint
        const response = await fetch('http://localhost:3000/fetchData'); // Replace with your API endpoint

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Parse the API response to find the "🦅 Dexscreener" field
        const dexscreenerData = data.find((item) => item['🦅 Dexscreener'])?.['🦅 Dexscreener'];
        const solscanLinks = data.find((item) => item.solscanLinks)?.solscanLinks;

        if (dexscreenerData) {
            const isCTO = getCTOStatusFromAPI(dexscreenerData);
            const devLink = solscanLinks?.[1] || null; // Get the second link from solscanLinks
            updateCTOOrDevStatus(isCTO, devLink);
        } else {
            console.warn('[CTO/Dev Status] Dexscreener data not found in the API response.');
        }
    } catch (error) {
        console.error('[CTO/Dev Status] Error fetching or updating status:', error);
    }
}

// --------------------------------------------
//  Initialize CTO or Dev Status Update
// --------------------------------------------
fetchAndUpdateCTOOrDevStatus();

// Optional: Periodically update status if needed
setInterval(fetchAndUpdateCTOOrDevStatus, 10000); // Update every 10 seconds









    // --------------------------------------------
    //  CAROUSEL LOGIC: 3 VIEWS, ONLY 2 VISIBLE
    // --------------------------------------------
    const views = ['clustersView', 'topHoldersView', 'walletAnalysisView'];
    let currentStartIndex = 0; // which index is the left-most in view

    // Show only 2 consecutive items in the list
    function showCarouselItems() {
        const carousel = document.querySelector('.holders-analysis-carousel');
    
        views.forEach((viewId, index) => {
            const element = document.getElementById(viewId);
            if (!element) return;
    
            // Determine if the current view is in the visible range
            const isVisible =
                index === currentStartIndex ||
                index === (currentStartIndex + 1) % views.length;
    
            // Show or hide the view based on visibility
            if (isVisible) {
                element.classList.remove('analysis-hidden');
            } else {
                element.classList.add('analysis-hidden');
            }
        });
    
        // Add or remove reverse-layout class for Page 3
        if (currentStartIndex === 2) {
            carousel.classList.add('reverse-layout'); // Wallet Analysis on the left
        } else {
            carousel.classList.remove('reverse-layout'); // Default order
        }
    }
   

    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentStartIndex = (currentStartIndex + 1) % views.length;
            showCarouselItems();
        });
    }

    // Prev button
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            // move startIndex backward
            currentStartIndex = (currentStartIndex - 1 + views.length) % views.length;
            showCarouselItems();
        });
    }

    // Initialize the carousel
    showCarouselItems();
});


