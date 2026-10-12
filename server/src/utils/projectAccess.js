import Project from '../models/Project.js';
import httpError from './httpError.js';

async function projectForMember(projectId, userId) {
  const project = await Project.findOne({
    _id: projectId,
    'members.user': userId,
  });

  if (!project) {
    throw httpError(404, 'Project not found');
  }

  return project;
}

export default projectForMember;