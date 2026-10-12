import { Router } from 'express';
import { currentUser, login, register, updateCurrentUser } from '../controllers/authController.js';
import authenticate from '../middleware/authenticate.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, asyncHandler(currentUser));
router.patch('/me', authenticate, updateCurrentUser);

export default router;