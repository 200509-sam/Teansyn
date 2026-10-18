const mongoose = require('mongoose');
const Task = require('../models/Task');
const Team = require('../models/Team');

// Helper to check if user is a member of the team
const isUserInTeam = async (teamId, userId) => {
  const team = await Team.findOne({
    _id: teamId,
    'members.user': userId,
  });
  return team;
};

// Helper to check if user is Admin in team
const isUserAdminInTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) return false;
  if (team.owner.toString() === userId.toString()) return true;
  const member = team.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member && member.role === 'Admin';
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, team: teamId, assignedTo, priority, status, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Valid team ID is required' });
    }

    // Check if user belongs to this team
    const team = await isUserInTeam(teamId, req.user._id);
    if (!team) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    // If assignedTo is provided, verify they are also a member of this team
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: 'Invalid assigned user ID' });
      }
      const isAssigneeInTeam = team.members.some(
        (m) => m.user.toString() === assignedTo.toString()
      );
      if (!isAssigneeInTeam) {
        return res.status(400).json({ message: 'Assigned user must be a member of the team' });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      team: teamId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with optional filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { team: teamId, status, priority, assignedTo, search } = req.query;

    // Find all teams where user is a member
    const userTeams = await Team.find({ 'members.user': req.user._id }).select('_id');
    const userTeamIds = userTeams.map((t) => t._id);

    const query = {};

    // Filter by specific team if requested, but must be in user's teams
    if (teamId) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID' });
      }
      const isAllowed = userTeamIds.some((id) => id.toString() === teamId.toString());
      if (!isAllowed) {
        return res.status(403).json({ message: 'You do not have access to this team tasks' });
      }
      query.team = teamId;
    } else {
      query.team = { $in: userTeamIds };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      if (assignedTo === 'me') {
        query.assignedTo = req.user._id;
      } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        query.assignedTo = assignedTo;
      } else if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      }
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user belongs to task's team
    const inTeam = await isUserInTeam(task.team._id, req.user._id);
    if (!inTeam) {
      return res.status(403).json({ message: 'You do not have access to view this task' });
    }

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details or status
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, priority, status, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify requester belongs to the task team
    const team = await isUserInTeam(task.team, req.user._id);
    if (!team) {
      return res.status(403).json({ message: 'You are not a member of this task team' });
    }

    const isAdmin = await isUserAdminInTeam(task.team, req.user._id);
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    // Check if only status is being updated
    const isStatusOnlyUpdate =
      status !== undefined &&
      title === undefined &&
      description === undefined &&
      assignedTo === undefined &&
      priority === undefined &&
      dueDate === undefined;

    // Permissions:
    // Any team member / assignee can update status.
    // Only Admin or Creator can edit full details (title, description, priority, assignee, due date).
    if (!isStatusOnlyUpdate && !isAdmin && !isCreator) {
      return res.status(403).json({
        message: 'Only team admins or task creators can modify full task details. Members can update status.',
      });
    }

    if (status !== undefined) {
      if (!['To Do', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      task.status = status;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Task title cannot be empty' });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority value' });
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        task.assignedTo = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({ message: 'Invalid assigned user ID' });
        }
        const isAssigneeInTeam = team.members.some(
          (m) => m.user.toString() === assignedTo.toString()
        );
        if (!isAssigneeInTeam) {
          return res.status(400).json({ message: 'Assigned user must be a member of the team' });
        }
        task.assignedTo = assignedTo;
      }
    }

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = await isUserAdminInTeam(task.team, req.user._id);
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        message: 'Only team admins or the task creator can delete this task',
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic dashboard statistics
// @route   GET /api/tasks/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userTeams = await Team.find({ 'members.user': req.user._id }).select('_id');
    const userTeamIds = userTeams.map((t) => t._id);

    const totalTeams = userTeamIds.length;

    // Filter tasks across all teams user is part of
    const teamTasksFilter = { team: { $in: userTeamIds } };

    const totalTasks = await Task.countDocuments(teamTasksFilter);
    const todoTasks = await Task.countDocuments({ ...teamTasksFilter, status: 'To Do' });
    const inProgressTasks = await Task.countDocuments({ ...teamTasksFilter, status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ ...teamTasksFilter, status: 'Completed' });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...teamTasksFilter,
      dueDate: { $lt: now, $ne: null },
      status: { $ne: 'Completed' },
    });

    const myAssignedTasksCount = await Task.countDocuments({
      ...teamTasksFilter,
      assignedTo: req.user._id,
    });

    const recentTasks = await Task.find(teamTasksFilter)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('team', 'name')
      .populate('assignedTo', 'name email');

    return res.status(200).json({
      totalTeams,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      myAssignedTasksCount,
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
};
