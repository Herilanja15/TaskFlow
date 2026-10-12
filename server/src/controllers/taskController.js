import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';
import projectForMember from '../utils/projectAccess.js';

const taskStatuses = ['todo', 'in_progress', 'done'];
const taskPriorities = ['low', 'medium', 'high', 'urgent'];

function parseDeadline(value) {
  if (!value) return null;
  if (typeof value !== 'string') throw httpError(400, 'Enter a valid task deadline');
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) {
    throw httpError(400, 'Enter a valid task deadline');
  }
  return deadline;
}

export const updateTask = asyncHandler(async (request, response) => {
  const task = await Task.findById(request.params.taskId);
  if (!task) throw httpError(404, 'Task not found');
  const project = await projectForMember(task.project, request.user._id);

  const { title, description, status, priority, deadline, assignedTo } = request.body;
  if (title !== undefined) {
    if (typeof title !== 'string') throw httpError(400, 'Task title must be text');
    const normalizedTitle = title.trim();
    if (!normalizedTitle || normalizedTitle.length > 160) {
      throw httpError(400, 'Task title must be between 1 and 160 characters');
    }
    task.title = normalizedTitle;
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || description.length > 2000) {
      throw httpError(400, 'Task description must be under 2,000 characters');
    }
    task.description = description.trim();
  }
  if (status !== undefined) {
    if (!taskStatuses.includes(status)) throw httpError(400, 'Invalid task status');
    task.status = status;
  }
  if (priority !== undefined) {
    if (!taskPriorities.includes(priority)) throw httpError(400, 'Invalid task priority');
    task.priority = priority;
  }
  if (deadline !== undefined) task.deadline = parseDeadline(deadline);
  if (assignedTo !== undefined) {
    if (assignedTo && !project.members.some((member) => String(member.user) === String(assignedTo))) {
      throw httpError(400, 'The assignee must be a member of this project');
    }
    task.assignedTo = assignedTo || null;
  }

  await task.save();
  await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name' },
  ]);

  response.json({ task });
});

export const deleteTask = asyncHandler(async (request, response) => {
  const task = await Task.findById(request.params.taskId);
  if (!task) throw httpError(404, 'Task not found');
  await projectForMember(task.project, request.user._id);

  await task.deleteOne();
  response.status(204).end();
});