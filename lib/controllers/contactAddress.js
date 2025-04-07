import UserData from '../models/userData.js';

// export const addContractAddress = async (req, res) => {
//     console.log("baat DB TAK TO AA RHI H **************#########");
//     const { uid, contractAddress } = req.body;
  
//     if (!uid || !contractAddress) {
//       return res.status(400).json({ message: 'UID and contract address are required' });
//     }
  
//     try {
//       const user = await UserData.findOne({ uid });
  
//       const newEntry = { address: contractAddress, timestamp: new Date() };
  
//       if (user) {
//         // Insert latest address at the beginning
//         user.contractAddresses.unshift(newEntry);
//         await user.save();
//         return res.status(200).json({ message: 'Address updated', data: user });
//       }else {
//         return res.status(404).json({ message: 'UID not found' });
//       }
  
     
//     } catch (error) {
//       console.error('[addContractAddress]', error);
//       res.status(500).json({ message: 'Server error' });
//     }
// };

// export const checkOrUpdateContractAddress = async (req, res) => {
//   console.log("baat DB TAK TO AA RHI H **************#########");
//   const { uid, contractAddress } = req.body;

//   if (!uid || !contractAddress) {
//     return res.status(400).json({ message: 'UID and contract address are required' });
//   }

//   try {
//     const user = await UserData.findOne({ uid });

//     if (!user) {
//       return res.status(404).json({ message: 'UID not found' });
//     }

//     const now = new Date();
//     let alreadyExists = false;

//     const existingIndex = user.contractAddresses.findIndex(
//       (entry) => entry.address === contractAddress
//     );

//     if (existingIndex !== -1) {
//       // If exists, update timestamp & move to top
//       const existingEntry = user.contractAddresses.splice(existingIndex, 1)[0];
//       existingEntry.timestamp = now;
//       user.contractAddresses.unshift(existingEntry);
//       alreadyExists = true;
//     } else {
//       // If new, add at top
//       const newEntry = { address: contractAddress, timestamp: now };
//       user.contractAddresses.unshift(newEntry);
//     }

//     // Optional: Keep only last 10 entries
//     // user.contractAddresses = user.contractAddresses.slice(0, 10);

//     await user.save();

//     return res.status(200).json({ 
//       message: 'Contract address processed.', 
//       exists: alreadyExists,
//       data: user 
//     });

//   } catch (error) {
//     console.error('[checkOrUpdateContractAddress]', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };


export const addOrUpdateContractAddress = async (req, res) => {
  

  const { uid, contractAddress } = req.body;

  if (!uid || !contractAddress) {
    return res.status(400).json({ message: 'UID and contract address are required' });
  }

  try {
    const user = await UserData.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: 'UID not found' });
    }

    const now = new Date();

    // Check if address already exists
    const existingIndex = user.contractAddresses.findIndex(
      (entry) => entry.address === contractAddress
    );

    if (existingIndex !== -1) {
      // Update timestamp and move to top
      const existingEntry = user.contractAddresses.splice(existingIndex, 1)[0];
      existingEntry.timestamp = now;
      user.contractAddresses.unshift(existingEntry);
    } else {
      // Add new entry at top
      const newEntry = { address: contractAddress, timestamp: now };
      user.contractAddresses.unshift(newEntry);
    }

    // Keep only the latest 10 entries (optional)
    user.contractAddresses = user.contractAddresses.slice(0, 10);

    await user.save();

    return res.status(200).json({
      message: 'Contract address list updated.',
      data: user
    });

  } catch (error) {
    console.error('[addOrUpdateContractAddress]', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
