import { Router } from 'express';
import {
  createProject,
  createProjectTask,
  deleteProject,
  getProject,
  listProjects,
  projectTasks,
  updateProject,
} from '../controllers/projectController.js';

const router = Router();

router.route('/').get(listProjects).post(createProject);
router.route('/:projectId').get(getProject).patch(updateProject).delete(deleteProject);
router.route('/:projectId/tasks').get(projectTasks).post(createProjectTask);

export default router;