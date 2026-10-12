import { Router } from 'express';
import authRoutes from './authRoutes.js';
import authenticate from '../middleware/authenticate.js';
import { getDashboard } from '../controllers/dashboardController.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';

const router = Router();

router.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});
router.use('/auth', authRoutes);
router.get('/dashboard', authenticate, getDashboard);
router.use('/projects', authenticate, projectRoutes);
router.use('/tasks', authenticate, taskRoutes);

export default router;