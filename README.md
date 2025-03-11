# Dragon: Solana Memecoin Threat Assessment Chrome Extension

**Dragon** is a Chrome extension that opens a side panel inside your browser’s window to help you assess the legitimacy of any Solana memecoin. By simply copying and pasting a token's contract address, Dragon provides visualizations that highlight potential threats to the token’s legitimacy. 

## Why Dragon?
On Solana, urgent threats such as Bundles, Snipes, Security, and Distribution require attention. Traditionally, these threats are assessed one at a time using various scattered tools. **Dragon** brings these metrics together in one smart product, greatly increasing the speed and accuracy of your DYOR (Do Your Own Research) process.

## Key Features
- **Visualizations**: Instantly generates visual metrics for Bundles, Snipes, Security, and Distribution.
- **Efficiency**: Combines the most critical metrics into a single user-friendly panel.
- **DYOR Tool**: Improves the speed and accuracy of token assessments.

## Installation
1. Download the Dragon Chrome extension from the [Chrome Web Store](#).
2. Add it to your browser.
3. Click on the Dragon icon in your Chrome toolbar to open the extension.



### Manual Installation
1. Clone (or download) this repo.
2. Open any code editor (e.g., VS Code), and open the downloaded folder. Alternatively, you can clone this Git repo directly.
3. Now, we have to run two servers: one for the telegramClient and another for the apiServer.
For running the telegramClient server:
Provide the apiID and apiHash in the code.
Navigate to the lib folder, and run the telegramClient server using:
node telegramClient.js
For running the apiServer:
Navigate to the lib folder and run the apiServer using:
node apiServer.js
4. After running telegramClient.js, you'll be prompted to enter your phone number and a verification code (which you’ll receive via the Telegram app). This step is required only once.
5. Ensure you have joined the TrenchyBot on Telegram; otherwise, you won't receive any data on the apiServer.
6. Once both servers are running, you can input the contract address into the extension. The extension will dynamically update all fields using the retrieved data.
7. In your Chrome browser:
Turn on "Developer Mode" after opening the Extensions window (Window -> Extensions).
Select Load Unpacked.
Choose the ext-src folder from the cloned/downloaded repo.
8. Open your Chrome side panel by selecting the side panel icon.
From the side panel, select Dragon.
Once these steps are complete, the extension will be fully operational, displaying dynamically updated fields.



## Usage
1. Open the Dragon side panel by clicking the extension icon.
2. Copy and paste any Solana memecoin’s contract address into the provided input field.
3. Review the visualizations that illustrate potential threats, categorized as:
    - **Bundles**
    - **Snipes**
    - **Security**
    - **Distribution**
4. Use the insights to make informed decisions during your DYOR process.


##Supported Metrics
-**Contract Analysis**: Evaluate features like minting, freezing, locking, burning, and ownership renouncement to identify risks such as inflation, abuse, or centralization.
-**Security**: Assess audit status, permissions, and vulnerabilities in the smart contract, flagging high-risk operations or potential exploits.
-**Tokenomics**: Analyze holder distributions, cluster patterns, and top wallet concentrations to flag risks of centralization or coordinated manipulation.
-**Sniping & Trading**: Detect sniper trades, transaction clustering, and unusual slippage to identify manipulative trading behavior.
-**Liquidity**: Monitor liquidity locks, ratios, and depths to ensure healthy trading conditions and mitigate rug pull risks.
-**Market & Community**: Track market cap, holder growth, and social sentiment to gauge token reputation and adoption trends.
-**Historical Metrics**: Review price trends, wallet movements, and contract updates for transparency and stability insights.
-**Risk Score**: Provide an overall risk evaluation based on token security, trading behavior, and liquidity health.

## Screenshots
_Add screenshots here once available._

## Contributing
We welcome contributions to improve Dragon! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes.
4. Submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer
Dragon is a tool to aid in DYOR. It does not provide financial advice and does not guarantee the legitimacy or safety of any token. Always do your research and exercise caution.

---

**Start your token assessments with Dragon and DYOR faster, smarter, and more accurately!**
