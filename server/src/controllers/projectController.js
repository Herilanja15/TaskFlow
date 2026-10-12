import Project from '../models/Project.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import projectForMember from '../utils/projectAccess.js';

function parseDeadline(value) {
  if (!value) return null;
  if (typeof value !== 'string') throw httpError(400, 'Enter a valid project deadline');
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) {
    throw httpError(400, 'Enter a valid project deadline');
  }
  return deadline;
}

export const listProjects = asyncHandler(async (request, response) => {
  const projects = await Project.find({ 'members.user': request.user._id })
    .sort({ updatedAt: -1 })
    .populate('owner', 'name email');

  response.json({ projects });
});

export const createProject = asyncHandler(async (request, response) => {
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : '';
  const description = typeof request.body.description === 'string' ? request.body.description.trim() : '';

  if (!title || title.length > 120 || description.length > 2000) {
    throw httpError(400, 'Enter a project title and a description under 2,000 characters');
  }

  const project = await Project.create({
    title,
    description,
    deadline: parseDeadline(request.body.deadline),
    owner: request.user._id,
    members: [{ user: request.user._id, role: 'admin' }],
  });

  response.status(201).json({ project });
});

export const getProject = asyncHandler(async (request, response) => {
  const project = await projectForMember(request.params.projectId, request.user._id);
  await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members.user', select: 'name email' },
  ]);

  response.json({ project });
});

export const updateProject = asyncHandler(async (request, response) => {
  const project = await Project.findOne({
    _id: request.params.projectId,
    owner: request.user._id,
  });

  if (!project) {
    throw httpError(404, 'Project not found');
  }

  const { title, description, deadline, archived } = request.body;
  if (title !== undefined) {
    if (typeof title !== 'string') throw httpError(400, 'Project title must be text');
    const normalizedTitle = title.trim();
    if (!normalizedTitle || normalizedTitle.length > 120) {
      throw httpError(400, 'Project title must be between 1 and 120 characters');
    }
    project.title = normalizedTitle;
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || description.length > 2000) {
      throw httpError(400, 'Project description must be under 2,000 characters');
    }
    project.description = description.trim();
  }
  if (deadline !== undefined) project.deadline = parseDeadline(deadline);
  if (archived !== undefined) {
    if (typeof archived !== 'boolean') throw httpError(400, 'Archived must be true or false');
    project.archived = archived;
  }

  await project.save();
  response.json({ project });
});

export const deleteProject = asyncHandler(async (request, response) => {
  const project = await Project.findOne({
    _id: request.params.projectId,
    owner: request.user._id,
  });

  if (!project) {
    throw httpError(404, 'Project not found');
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  response.status(204).end();
});

export const projectTasks = asyncHandler(async (request, response) => {
  const project = await projectForMember(request.params.projectId, request.user._id);
  const tasks = await Task.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name');

  response.json({ tasks });
});

export const createProjectTask = asyncHandler(async (request, response) => {
  const project = await projectForMember(request.params.projectId, request.user._id);
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : '';
  const description = typeof request.body.description === 'string' ? request.body.description.trim() : '';

  if (!title || title.length > 160 || description.length > 2000) {
    throw httpError(400, 'Enter a task title and a description under 2,000 characters');
  }

  const assignedTo = request.body.assignedTo || null;
  if (assignedTo && !project.members.some((member) => String(member.user) === String(assignedTo))) {
    throw httpError(400, 'The assignee must be a member of this project');
  }

  const task = await Task.create({
    title,
    description,
    priority: request.body.priority || 'medium',
    status: request.body.status || 'todo',
    deadline: parseDeadline(request.body.deadline),
    assignedTo,
    project: project._id,
    createdBy: request.user._id,
  });

  await task.populate('assignedTo', 'name email');
  response.status(201).json({ task });
});