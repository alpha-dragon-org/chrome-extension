import UserData from '../models/userData.js';

// Check if UID exists
export const checkUID = async (req, res) => {
    try {
        const { uid } = req.body;
        
        if (!uid) {
            return res.status(400).json({ error: 'UID is required' });
        }

        const existingData = await UserData.findOne({ uid });
        
        res.status(200).json({ 
            exists: !!existingData,
            data: existingData || null
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

// Create or update UID data
export const setUID = async (req, res) => {
    try {
        // const { uid, contractAddress, result } = req.body;
        const { uid ,timestamp} = req.body;

        
        // if (!uid || !contractAddress || !result) {
        if (!uid ) {
            return res.status(400).json({ 
                error: 'UID, contractAddress and result are required' 
            });
        }

        const exists = await UserData.findOne({ uid });
        if (exists) {
          return res.status(409).json({ error: 'UID already exists' });
        }
        
        const data = await UserData.create({
            uid,
            // contractAddress,
           // result,
            timestamp: timestamp ? new Date(timestamp) : new Date()
          });

        res.status(200).json({
            message: 'UID data processed successfully',
            data
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};


