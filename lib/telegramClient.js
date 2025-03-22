import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import promptSync from 'prompt-sync';
import fs from 'fs';
import axios from 'axios';
import puppeteer from 'puppeteer';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import the CORS package

const app = express();
const port = 3001; // Choose an available port for the server

const corsOptions = {
  origin: '*', // Replace with your actual extension ID or domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};


app.use(cors(corsOptions)); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

// Declare the Telegram client globally
let client;

// Initialize prompt
const prompt = promptSync();

// Replace with your Telegram API credentials
const apiId = 21285747; // Replace with your API ID
const apiHash = '423a3dadc989d112adde791c1ace3b14'; // Replace with your API Hash

// Utility function to ensure the Telegram client is initialized
const ensureClientInitialized = async () => {
    if (!client) {
        console.log('[INFO] Waiting for Telegram client to initialize...');
        while (!client || !client.connected) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
        }
        console.log('[INFO] Telegram client is now initialized.');
    }
};




// API endpoint to serve data
app.get('/fetchData', (req, res) => {
    res.json(fetchedData);
});







// API endpoint to handle contract address
app.post('/sendContractAddress', async (req, res) => {
    console.log('[DEBUG] Received body:', req.body);

    const { contractAddress } = req.body;

    if (!contractAddress) {
        console.warn('[WARN] Missing contract address in request.');
        return res.status(400).json({ error: 'Contract address is required.' });
    }

    console.log(`[INFO] Received contract address: ${contractAddress}`);

    try {
        // Ensure the Telegram client is initialized
        await ensureClientInitialized();

        const botUsername = 'TrenchyBot'; // Replace with your bot's username
        await client.sendMessage(botUsername, { message: contractAddress });
        console.log('[INFO] Contract address sent successfully to Telegram.');

        res.status(200).json({ success: true, message: 'Contract address sent successfully.' });
    } catch (error) {
        console.error('[ERROR] Failed to send contract address:', error.message);
        res.status(500).json({ error: 'Failed to send contract address to Telegram.' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`[INFO] Server running on http://localhost:${port}`);
});

// Add bot usernames you want to listen to
const botUsernames = ['SyraxScannerBot', 'soul_scanner_bot', 'TrenchyBot'];

// Add this at the top of the file with other constants
const SOLSCAN_API_KEY = 'your_solsniffer_api_key';
function extractLinksFromEntities(msg) {
    if (!msg || !msg.message) return [];
    const links = [];

    // Extract links from message entities
    if (msg.entities) {
        for (const entity of msg.entities) {
            if (entity.className === 'MessageEntityTextUrl') {
                links.push(entity.url);
            } else if (entity.className === 'MessageEntityUrl') {
                const urlText = msg.message.slice(entity.offset, entity.offset + entity.length);
                links.push(urlText);
            }
        }
    }

    // Extract plain text links using regex
    const regex = /https?:\/\/[^\s]+/g;
    const plainTextLinks = msg.message.match(regex) || [];
    links.push(...plainTextLinks);

    // Filter and prioritize links
    const uniqueLinks = [...new Set(links)].map(link => link.trim()).filter(link => link.startsWith('http'));

    return uniqueLinks;
}

function parseMessageToJSON(senderUsername, message, links) {
    const lines = message.split('\n');
    const jsonData = {};
    let currentKey = null;
    let currentSubArray = [];

    // Extract tickerName from lines that start with the pill emoji (💊)
    for (const line of lines) {
        if (line.trim().startsWith('💊') && !jsonData.tickerName) {
            // Remove the emoji and trim the line
            jsonData.tickerName = line.replace('💊', '').trim();
        }
    }


    const linkData = {
        pumpFunLink: links.find(link => link.includes('pump.fun')),
        solscanLinks: links.filter(link => link.includes('solscan.io')),
        dexscreenerLink: links.find(link => link.includes('dexscreener.com')),
        // Extracting Telegram links (excluding '/enterthetrench')
        telegramLinks: links.filter(link => link.includes('t.me') && !link.includes('/enterthetrench')),
        
        // Extracting Twitter links (only 'x.com' links)
        twitterLinks: links.filter(link => link.includes('x.com')),
        
        // websiteLinks: links.filter(link => link.includes('https://www.')), // Collect all 'https://www.' links
        websiteLinks : links.filter(link => 
            (link.startsWith('https://www.') || link.endsWith('.com/')) && 
            !link.includes('/x.com')
        )
    };

    if (linkData.pumpFunLink) jsonData.pumpFunLink = linkData.pumpFunLink;
    if (linkData.solscanLinks.length > 0) jsonData.solscanLinks = linkData.solscanLinks;
    if (linkData.dexscreenerLink) jsonData.dexscreenerLink = linkData.dexscreenerLink;
     if (linkData.telegramLinks.length > 0) jsonData.telegramLinks = linkData.telegramLinks;  // Add Telegram links
    if (linkData.twitterLinks.length > 0) jsonData.twitterLinks = linkData.twitterLinks;      // Add Twitter links
    if (linkData.websiteLinks.length > 0) jsonData.websiteLinks = linkData.websiteLinks; // Store all website links

    lines.forEach(line => {
        if (!line.trim()) return;
        if (!line.startsWith(' ')) {
            if (currentKey && currentSubArray.length > 0) {
                jsonData[currentKey] = currentSubArray;
                currentSubArray = [];
            }
            const [key, value] = line.split(':').map(item => item.trim());
            if (key) {
                currentKey = key;
                if (value) {
                    jsonData[key] = value;
                    currentKey = null;
                }
            }
        } else {
            const nestedLine = line.trim();

            // Check for "Website" in Dexscreener links
            if (currentKey === '🦅 Dexscreener' && nestedLine.includes('Website')) {
                const websiteMatch = nestedLine.match(/https?:\/\/[^\s|]+/g);
                if (websiteMatch) {
                    jsonData.websiteLinks = (jsonData.websiteLinks || []).concat(websiteMatch); // Append to websiteLinks array
                }
            }

            if (nestedLine) currentSubArray.push(nestedLine);
        }
    });

    if (currentKey && currentSubArray.length > 0) jsonData[currentKey] = currentSubArray;
    jsonData['sourceBot'] = senderUsername;

    return jsonData;
}


// Function to process the bot's message
async function processBotMessage(event) {
    const message = event.message;
    if (!message) return;
    const sender = await message.getSender();
    const senderUsername = sender?.username || 'Unknown';

    if (!botUsernames.includes(senderUsername)) {
        console.warn(`[WARN] Message received from unknown sender: @${senderUsername}`);
        return;
    }

    console.log(`[INFO] Message received from @${senderUsername}:`, message.message);


    const links = extractLinksFromEntities(message);
    const parsedJSON = parseMessageToJSON(senderUsername, message.message, links);

    console.log('[INFO] Parsed message JSON:', JSON.stringify(parsedJSON, null, 2));

    // Add your own logic to handle the parsed JSON
    // e.g., fetchTopHolders(parsedJSON), fetchWalletListFromBubblemaps(parsedJSON), etc.
}

async function sendToAPI(data) {
    // Check if the data contains 'pumpFunLink'
    if (!data.pumpFunLink) {
        console.log('[INFO] Skipping data due to missing pumpFunLink.');
        return; // Skip sending the data if 'pumpFunLink' is not present
    }


    try {
        // const apiEndpoint = 'http://ec2-3-80-88-97.compute-1.amazonaws.com:3000/updateData'; // Use the correct endpoint
        const apiEndpoint = 'http://localhost:3000/updateData'; // Use the correct endpoint

        console.log('[INFO] Sending data to:', apiEndpoint);
        console.log('[INFO] Payload:', JSON.stringify(data, null, 2));

        const response = await axios.post(apiEndpoint, data, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('[INFO] Data successfully sent to API:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('[ERROR] API responded with error:', error.response.status);
            console.error('[ERROR] Response data:', error.response.data);
        } else if (error.request) {
            console.error('[ERROR] No response received from API:', error.request);
        } else {
            console.error('[ERROR] Failed to send data:', error.message);
        }
    }
}






async function fetchWalletListFromBubblemaps(parsedJSON) {
    let browser = null;
    let dataReceived = false; // Variable to track if data is received
    try {
      const pumpAddress = parsedJSON.pumpFunLink 
          ? parsedJSON.pumpFunLink.split('/').pop()
          : null;
  
      if (!pumpAddress) {
        console.log('[WARNING] No pump address found in message for Bubblemaps');
        return null;
      }
  
      const bubblemapUrl = `https://app.bubblemaps.io/sol/token/${pumpAddress}`;
      console.log('[INFO] Navigating to Bubblemaps:', bubblemapUrl);
  
      browser = await puppeteer.launch({
        headless: true,  // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
  
      const page = await browser.newPage();
  
      // Spoof user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      );
  
      // Go to Bubblemaps
      await page.goto(bubblemapUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  
      // A 5-second timer promise
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          if (!dataReceived) {
            console.log('[INFO] No data received in 5 seconds, returning immediately.');
            resolve(null);
          }
        }, 5000);
      });
  
      console.log('[INFO] Waiting for Wallet List button...');
      const walletListButtonSelector = '#app > div > div > div.graph-view > ' + 
          'div:nth-child(6) > div.buttons-row__right-side > div:nth-child(2)';
  
      // Race between waitForSelector (up to 45s) and our 5s timeout
      const buttonExists = await Promise.race([ 
        page.waitForSelector(walletListButtonSelector, { timeout: 45000 }), 
        timeoutPromise,
      ]);
  
      if (!buttonExists) {
        console.log('[ERROR] Wallet List button not found within 5s.');
        return null;
      }
  
      // Mark data as received so the timeout promise doesn’t trigger from now on
      dataReceived = true;
  
      // Click the Wallet List button
      console.log('[INFO] Clicking Wallet List button...');
      await page.click(walletListButtonSelector);
  
      // Next, wait for the wallet list to load
      console.log('[INFO] Waiting for wallet list...');
      const walletListItemSelector = '.wallets-list ul li';
  
      const walletListExists = await page.waitForSelector(walletListItemSelector, { timeout: 45000 });
  
      if (!walletListExists) {
        console.error('[ERROR] Wallet List data not found within 5s.');
        return null;
      }
  
      dataReceived = true;
  
      // Extract wallet list data
      console.log('[INFO] Extracting wallet list...');
      const walletsData = await page.evaluate(() => {
        const results = [];
        const walletItems = document.querySelectorAll('.wallets-list ul li');
  
        walletItems.forEach((item) => {
          const nameSpan = item.querySelector('.wallets-list__name');
          if (!nameSpan) return;
  
          const rankElem = nameSpan.querySelector('b');
          const rankText = rankElem ? rankElem.textContent.trim() : '';
          const rank = rankText.replace('#', '');
  
          const textParts = nameSpan.textContent.split(' - ').map((s) => s.trim());
          let name = textParts.length >= 2 ? textParts[1] : '';
  
          const percentElem = item.querySelector('b.wallets-list__percent');
          const percentageText = percentElem ? percentElem.textContent.trim() : '';
          const percentage = parseFloat(percentageText.replace('%', '') || 0);
  
          let color = '';
          const bubbleSpan = item.querySelector('.wallets-list__bubble');
          if (bubbleSpan) {
            const styleString = bubbleSpan.getAttribute('style') || '';
            const match = styleString.match(/background-color:\s*([^;]+)/i);
            if (match && match[1]) {
              color = match[1].trim();
            }
          }

          // Check for the exchange icon presence
          const isExchangeIconPresent = item.querySelector('.material-icons.wallets-list__special-icon') ? 'Yes' : 'No';

          // Only add wallets where "isExchangeIconPresent" is "No"
          if (isExchangeIconPresent === 'No') {
            results.push({
              rank,
              name,
              percentage,
              color,
              isExchangeIconPresent, // Add exchange icon status
            });
          }
        });
  
        return results;
      });
  
      console.log('[INFO] Fetched wallet list from Bubblemaps:', walletsData);

      // Group data by color and calculate cluster percentages
      const clusters = {};
      walletsData.forEach((wallet) => {
        const color = wallet.color || 'No Color';
        if (!clusters[color]) {
          clusters[color] = {
            color: color,
            totalPercentage: 0,
            wallets: [],
          };
        }
        clusters[color].totalPercentage += wallet.percentage;
        clusters[color].wallets.push(wallet);
      });
  
      // Convert clusters object to array and format percentages
      const clusterList = Object.values(clusters).map((cluster) => ({
        color: cluster.color,
        totalPercentage: `${cluster.totalPercentage.toFixed(2)}%`,
        wallets: cluster.wallets,
      }));
  
      console.log('[INFO] Clustered data:', clusterList);
  
      return {
        walletList: walletsData, // Returning only wallets that don't have the exchange icon
        clusters: clusterList, // Returning the clusters
      };
    } catch (error) {
      console.error('[ERROR] Failed to fetch wallet list data:', error.message);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
}









async function fetchBundleData(parsedJSON) {
    let browser = null;
    try {
        const pumpAddress = parsedJSON.pumpFunLink 
            ? parsedJSON.pumpFunLink.split('/').pop()
            : null;

        if (!pumpAddress) {
            console.log('[WARNING] No pump address found in message for Bundle data');
            return null;
        }

        const bundleUrl = `https://trench.bot/bundles/${pumpAddress}`;
        console.log('[INFO] Navigating to Bundle URL:', bundleUrl);

        browser = await puppeteer.launch({
            headless: true, // Set to false for debugging
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );

        await page.goto(bundleUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('[INFO] Waiting for the left panel data to load...');
        // Wait for left panel data to load
        await page.waitForSelector('.overall-info-overlay .info-item', { timeout: 60000 });

        // Fetch left panel data
        const leftPanelData = await page.evaluate(() => {
            const infoItems = document.querySelectorAll('.overall-info-overlay .info-item');
            const data = {};

            infoItems.forEach((item) => {
                const label = item.querySelector('.info-label')?.textContent?.replace(':', '').trim();
                const valueElement = item.querySelector('.info-value');

                if (label && valueElement) {
                    // Check if value contains SVG icon (for "Bonded" field)
                    if (valueElement.querySelector('svg')) {
                        data[label] = 'Yes';
                    } else {
                        data[label] = valueElement.textContent.trim();
                    }
                }
            });

            return data;
        });

        console.log('[INFO] Left panel data fetched:', leftPanelData);

        // Check if no-bundles message exists
        const isNoMessageDivPresent = await page.evaluate(() => {
            return !!document.querySelector('.no-bundles-message');
        });

        if (isNoMessageDivPresent) {
            console.log('[INFO] No bundles message detected. Returning left panel data only.');
            return {
                bundleData: [],
                leftPanelData,
            };
        }

        console.log('[INFO] Waiting for bundle bubbles...');
        await page.waitForSelector('.bubble', { timeout: 60000 });

        // Add a delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait an additional 5 seconds

        // Debugging screenshot
        await page.screenshot({ path: 'debug_bundle_data_loading.png' });
        console.log('[DEBUG] Screenshot taken before extracting bundle data');

        // Extract main bundle data
        const bundleData = await page.evaluate(() => {
            const results = [];
            const bubbles = document.querySelectorAll('.bubble');
            bubbles.forEach(bubble => {
                const title = bubble.getAttribute('title');
                const percentageElem = bubble.querySelector('.token-percentage');
                const percentage = percentageElem ? percentageElem.textContent.trim() : null;

                const data = {
                    title: title || 'No Title',
                    percentage: percentage || '0%',
                };

                if (title) {
              //                          const match = title.match(/Token %: ([\d.]+)%.*?Holding %: ([\d.]+)%/);


       			 const match = title.match(/Bundle ID: (\d+).*?Token %: ([\d.]+)%.*?Holding %: ([\d.]+)%/);
                    if (match) {
                        data.bundleId = match[1];
                        data.tokenPercentage = parseFloat(match[2]);
                        data.holdingPercentage = parseFloat(match[3]);
                    }
                }

                results.push(data);
            });
            return results;
        });

        console.log('[INFO] Fetched main bundle data:', bundleData);

        return {
            bundleData,
            leftPanelData,
        };
    } catch (error) {
        console.error('[ERROR] Failed to fetch bundle data:', error.message);
        if (browser) {
            const pages = await browser.pages();
            if (pages.length > 0) {
                await pages[0].screenshot({ path: 'debug_bundle_error.png' });
                console.log('[DEBUG] Screenshot saved as debug_bundle_error.png');
            }
        }
        return null;
    } finally {
        if (browser) await browser.close();
    }
}






//
// ──────────────────────────────────────────────────────────── IIFE START ─────
//

(async () => {
    console.log('[INFO] Initializing Telegram Client...');
    const savedSession = fs.existsSync('./telegram-session.txt') 
        ? fs.readFileSync('./telegram-session.txt', 'utf8') 
        : '';
    const stringSession = new StringSession(savedSession);

    // IMPORTANT: Use the *global* client here (remove const)
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        autoReconnect: true,
        useWSS: true
    });

    try {
        if (!savedSession) {
            console.log('[INFO] No saved session found. Logging in...');
            await client.start({
                phoneNumber: async () => prompt('[PROMPT] Enter phone number: '),
                password: async () => prompt('[PROMPT] Enter password (if enabled): '),
                phoneCode: async () => prompt('[PROMPT] Enter the code you received: '),
                onError: (error) => console.error('[ERROR]', error),
            });

            const sessionString = client.session.save();
            fs.writeFileSync('./telegram-session.txt', sessionString);
            console.log('[INFO] Session saved successfully.');
        } else {
            console.log('[INFO] Found saved session. Connecting...');
            await client.connect();
        }

        const me = await client.getMe();
        console.log(`[INFO] Connected successfully as ${me.username || me.id}`);

        // Listening for incoming messages
        client.addEventHandler(async (event) => {
            const message = event.message;
            if (!message) return;

            const sender = await message.getSender();
            const senderUsername = sender?.username || 'Unknown';

            // Only process messages from configured bots
            if (!botUsernames.includes(senderUsername)) return;

            console.log(`[INFO] Message received from @${senderUsername}`);
            console.log('[INFO] Message content:', message.message);

            // Extract links
            const links = extractLinksFromEntities(message);

            // Parse message into structured JSON
            const parsedJSON = parseMessageToJSON(senderUsername, message.message, links);

           

            // Fetch wallet list and clusters
            console.log('[INFO] Fetching wallet list and clusters from Bubblemaps...');
            const walletListData = await fetchWalletListFromBubblemaps(parsedJSON);
            if (walletListData) {
                parsedJSON.walletList = walletListData.walletList;
                parsedJSON.clusters = walletListData.clusters;
            }


             // Fetch bundle data
             console.log('[INFO] Fetching bundle data...');
             const bundleData = await fetchBundleData(parsedJSON);
             if (bundleData) {
                 parsedJSON.bundleData = bundleData;
             }
 
           

            console.log('[INFO] Final Parsed Message JSON:', JSON.stringify(parsedJSON, null, 2));

            // Send data to the API
            await sendToAPI(parsedJSON);
        }, new NewMessage({ incoming: true }));

        console.log('[INFO] Telegram Client is now listening for messages...');
    } catch (error) {
        console.error('[ERROR] Failed to initialize Telegram Client:', error.message);
        if (savedSession) {
            console.log('[INFO] The session might be invalid. Please delete the session file and try again.');
        }
        process.exit(1);
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('[INFO] Shutting down Telegram Client...');
        await client.disconnect();
        process.exit(0);
    });
})();

//
// ───────────────────────────────────────────────────────────── IIFE END ─────
//















































































































