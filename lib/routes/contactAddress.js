import express from 'express';
import {addOrUpdateContractAddress} from '../controllers/contactAddress.js'

const router = express.Router();
// router.post('/add-contractaddress',addContractAddress);
router.post('/check-update',addOrUpdateContractAddress)


export default router;
// addContractAddress,