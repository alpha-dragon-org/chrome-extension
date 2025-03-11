import express from 'express';
import cors from 'cors'; // Import the CORS middleware
import fetch from 'node-fetch'; 

const app = express();
let fetchedData = []; // Global store for parsed data

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// API endpoint to serve data
app.get('/fetchData', (req, res) => {
    res.json(fetchedData);
});

// API endpoint to update data
app.post('/updateData', (req, res) => {
    const newData = req.body;
    if (newData) {
        fetchedData.push(newData);
        fetchedData = [...new Set(fetchedData.map(JSON.stringify))].map(JSON.parse); // Remove duplicates
        console.log('[INFO] Data updated:', newData);
        res.sendStatus(200); // Respond with success
    } else {
        console.error('[ERROR] Invalid data received.');
        res.status(400).send('Invalid data');
    }
});


// API endpoint to clear data
app.post('/clearData', (req, res) => {
    fetchedData = []; // Clear the data
    console.log('[INFO] API data has been cleared.');
    res.status(200).json({ message: 'API data cleared successfully.' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[INFO] API running at http://ec2-3-80-88-97.compute-1.amazonaws.com:${PORT}/fetchData`);
});


