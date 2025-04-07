import express from 'express';
import { checkUID, setUID} from '../controllers/uidController.js';


const router = express.Router();

// POST /api/uid/check
router.post('/check', checkUID);

// POST /api/uid/set
router.post('/set', setUID);




export default router;