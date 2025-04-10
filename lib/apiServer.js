import express from 'express';
import cors from 'cors'; // Import the CORS middleware
import fetch from 'node-fetch';
import connectDB from './config/Db.js';
import uidRoutes from './routes/uidRoutes.js'
import contactAddressRoutes from './routes/contactAddress.js'


const app = express();
// let fetchedData = []; // Global store for parsed data
const dataMap = new Map();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(express.json());
connectDB();

app.use("/api/uid", uidRoutes);
app.use("/api/contract", contactAddressRoutes);
// API endpoint to serve data
// app.get('/fetchData', (req, res) => {
//   res.json(fetchedData);
// });
app.get('/fetchData', (req, res) => {
  const uid = req.query.uid;
  if (!uid || !dataMap.has(uid)) {
    return res.json([]); // Send blank if not found
  }
  res.json(dataMap.get(uid));
});


// API endpoint to update data
// app.post('/updateData', (req, res) => {
//   const newData = req.body;
//   if (newData) {
//     fetchedData.push(newData);
//     // Remove duplicates
//     fetchedData = [...new Set(fetchedData.map(JSON.stringify))].map(JSON.parse);
//     console.log('[INFO] Data updated:', newData);
//     res.sendStatus(200); // Respond with success
//   } else {
//     console.error('[ERROR] Invalid data received.');
//     res.status(400).send('Invalid data');
//   }
// });
app.post('/updateData', (req, res) => {
  const { uid, data } = req.body;

  if (!uid || !data) {
    return res.status(400).json({ error: 'UID and data required' });
  }

  if (!dataMap.has(uid)) {
    dataMap.set(uid, []);
  }

  const userData = dataMap.get(uid);
  userData.push(data);

  // Optional: remove duplicates
  const uniqueData = [...new Set(userData.map(JSON.stringify))].map(JSON.parse);
  dataMap.set(uid, uniqueData);

  console.log(`[INFO] Updated data for UID ${uid}`);
  res.sendStatus(200);
});


// API endpoint to clear data
// app.post('/clearData', (req, res) => {
//   fetchedData = []; // Clear the data
//   console.log('[INFO] API data has been cleared.');
//   res.status(200).json({ message: 'API data cleared successfully.' });
// });
app.post('/clearData', (req, res) => {
  const { uid } = req.body;

  if (!uid) return res.status(400).json({ error: 'UID is required' });

  dataMap.delete(uid);
  console.log(`[INFO] Cleared data for UID: ${uid}`);
  res.status(200).json({ message: 'cleared' });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[INFO] API running at http://localhost:${PORT}/fetchData`);
});
