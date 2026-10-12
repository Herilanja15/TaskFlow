import { Router } from 'express';
import { deleteTask, updateTask } from '../controllers/taskController.js';

const router = Router();

router.route('/:taskId').patch(updateTask).delete(deleteTask);

export default router;