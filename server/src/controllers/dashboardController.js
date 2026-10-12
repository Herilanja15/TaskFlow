import Project from '../models/Project.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (request, response) => {
  const projects = await Project.find({ 'members.user': request.user._id })
    .sort({ updatedAt: -1 })
    .lean();
  const projectIds = projects.map((project) => project._id);

  const groupedTasks = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
        },
      },
    },
  ]);
  const taskCounts = new Map(groupedTasks.map((group) => [String(group._id), group]));
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);

  const dueSoonFilter = {
    project: { $in: projectIds },
    status: { $ne: 'done' },
    deadline: { $lte: weekAhead },
  };
  const [dueSoonCount, dueSoon] = await Promise.all([
    Task.countDocuments(dueSoonFilter),
    Task.find(dueSoonFilter)
      .sort({ deadline: 1 })
      .limit(6)
      .populate('project', 'title')
      .lean(),
  ]);

  const projectSummaries = projects.map((project) => {
    const counts = taskCounts.get(String(project._id)) || {
      total: 0,
      completed: 0,
      inProgress: 0,
    };
    return { ...project, taskCount: counts.total, completedCount: counts.completed };
  });

  response.json({
    stats: {
      projectCount: projects.filter((project) => !project.archived).length,
      taskCount: groupedTasks.reduce((total, group) => total + group.total, 0),
      completedCount: groupedTasks.reduce((total, group) => total + group.completed, 0),
      inProgressCount: groupedTasks.reduce((total, group) => total + group.inProgress, 0),
      dueSoonCount,
    },
    projects: projectSummaries,
    dueSoon,
  });
});