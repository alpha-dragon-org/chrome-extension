import mongoose from 'mongoose';

const userDataSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    contractAddresses: [{
        address: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],  
    timestamp: { type: Date, default: Date.now },
});

const UserData = mongoose.model('UserData', userDataSchema);
export default UserData;
