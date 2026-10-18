const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');

// Helper to check if a user is an Admin/Owner of the team
const isTeamAdmin = (team, userId) => {
  if (team.owner.toString() === userId.toString()) return true;
  const member = team.members.find(
    (m) => m.user._id ? m.user._id.toString() === userId.toString() : m.user.toString() === userId.toString()
  );
  return member && member.role === 'Admin';
};

// Helper to check if a user is any member (Admin or Member) of the team
const isTeamMember = (team, userId) => {
  if (team.owner.toString() === userId.toString()) return true;
  return team.members.some(
    (m) => m.user._id ? m.user._id.toString() === userId.toString() : m.user.toString() === userId.toString()
  );
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Admin',
          joinedAt: new Date(),
        },
      ],
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.status(201).json(populatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teams for the logged-in user
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    // Compute task stats per team
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const taskCount = await Task.countDocuments({ team: team._id });
        const userMember = team.members.find(
          (m) => m.user && m.user._id.toString() === req.user._id.toString()
        );
        return {
          ...team.toObject(),
          totalTasks: taskCount,
          currentUserRole: userMember ? userMember.role : 'Member',
        };
      })
    );

    return res.status(200).json(teamsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get team by ID with members & task stats
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid team ID format' });
    }

    const team = await Team.findById(id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if requester is a member of the team
    if (!isTeamMember(team, req.user._id)) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this team' });
    }

    // Count tasks assigned to each member in this team
    const membersWithTaskCount = await Promise.all(
      team.members.map(async (m) => {
        const memberUserId = m.user ? m.user._id : null;
        let assignedTasksCount = 0;
        if (memberUserId) {
          assignedTasksCount = await Task.countDocuments({
            team: team._id,
            assignedTo: memberUserId,
          });
        }
        return {
          user: m.user,
          role: m.role,
          joinedAt: m.joinedAt,
          assignedTasksCount,
        };
      })
    );

    const userMembership = team.members.find(
      (m) => m.user && m.user._id.toString() === req.user._id.toString()
    );

    const teamData = {
      ...team.toObject(),
      members: membersWithTaskCount,
      currentUserRole: userMembership ? userMembership.role : 'Member',
      isOwner: team.owner._id.toString() === req.user._id.toString(),
    };

    return res.status(200).json(teamData);
  } catch (error) {
    next(error);
  }
};

// @desc    Update team information (Admin only)
// @route   PUT /api/teams/:id
// @access  Private
const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid team ID format' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!isTeamAdmin(team, req.user._id)) {
      return res.status(403).json({ message: 'Only team admins can update team details' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Team name cannot be empty' });
      }
      team.name = name.trim();
    }

    if (description !== undefined) {
      team.description = description.trim();
    }

    await team.save();

    const updatedTeam = await Team.findById(id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team (Owner/Admin only)
// @route   DELETE /api/teams/:id
// @access  Private
const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid team ID format' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!isTeamAdmin(team, req.user._id)) {
      return res.status(403).json({ message: 'Only team admins can delete this team' });
    }

    // Delete associated tasks
    await Task.deleteMany({ team: team._id });
    await Team.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Team and associated tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to team by registered email (Admin only)
// @route   POST /api/teams/:id/members
// @access  Private
const addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role = 'Member' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid team ID format' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Please provide user email to add' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!isTeamAdmin(team, req.user._id)) {
      return res.status(403).json({ message: 'Only team admins can add members' });
    }

    // Find the user to add
    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({ message: 'No registered user found with this email' });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some(
      (m) => m.user.toString() === targetUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    team.members.push({
      user: targetUser._id,
      role: role === 'Admin' ? 'Admin' : 'Member',
      joinedAt: new Date(),
    });

    await team.save();

    const updatedTeam = await Team.findById(id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.status(200).json({
      message: `${targetUser.name} added to the team successfully`,
      team: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from team (Admin only)
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
const removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!isTeamAdmin(team, req.user._id)) {
      return res.status(403).json({ message: 'Only team admins can remove members' });
    }

    if (team.owner.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot remove the team owner from the team' });
    }

    // Filter out the member
    const memberExists = team.members.some(
      (m) => m.user.toString() === userId.toString()
    );
    if (!memberExists) {
      return res.status(404).json({ message: 'User is not a member of this team' });
    }

    team.members = team.members.filter(
      (m) => m.user.toString() !== userId.toString()
    );

    await team.save();

    // Unassign tasks assigned to this removed member in this team
    await Task.updateMany(
      { team: team._id, assignedTo: userId },
      { $set: { assignedTo: null } }
    );

    const updatedTeam = await Team.findById(id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.status(200).json({
      message: 'Member removed successfully and their tasks unassigned',
      team: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
};
