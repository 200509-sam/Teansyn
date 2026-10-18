const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teamsync';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({ email: { $in: ['alex@teamsync.io', 'sarah@teamsync.io', 'david@teamsync.io'] } });
    await Team.deleteMany({ name: 'AI Innovators Platform' });

    console.log('Creating demo users...');
    const alex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@teamsync.io',
      password: 'password123',
    });

    const sarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@teamsync.io',
      password: 'password123',
    });

    const david = await User.create({
      name: 'David Kim',
      email: 'david@teamsync.io',
      password: 'password123',
    });

    console.log('Creating demo team...');
    const team = await Team.create({
      name: 'AI Innovators Platform',
      description: 'Cross-functional engineering team building next-generation AI collaboration workflows and high-throughput real-time sync systems.',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'Admin', joinedAt: new Date() },
        { user: sarah._id, role: 'Member', joinedAt: new Date() },
        { user: david._id, role: 'Member', joinedAt: new Date() },
      ],
    });

    console.log('Creating demo tasks...');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Design distributed database sharding strategy',
        description: 'Evaluate read/write patterns and design horizontal scaling architecture for millions of concurrent workspace events.',
        team: team._id,
        assignedTo: alex._id,
        createdBy: alex._id,
        priority: 'High',
        status: 'To Do',
        dueDate: nextWeek,
      },
      {
        title: 'Implement JWT authentication and RBAC middleware',
        description: 'Enforce role-based access control across team workspace endpoints, ensuring strict permission boundaries.',
        team: team._id,
        assignedTo: sarah._id,
        createdBy: alex._id,
        priority: 'High',
        status: 'In Progress',
        dueDate: inTwoDays,
      },
      {
        title: 'Optimize Largest Contentful Paint (LCP) and bundle size',
        description: 'Audit frontend bundle chunks, optimize asset delivery, and ensure 90+ Lighthouse performance score.',
        team: team._id,
        assignedTo: david._id,
        createdBy: alex._id,
        priority: 'Medium',
        status: 'In Progress',
        dueDate: pastDate, // Overdue task demonstration
      },
      {
        title: 'Establish automated end-to-end integration test suite',
        description: 'Cover API endpoints for users, teams, and tasks with automated CI regression testing.',
        team: team._id,
        assignedTo: sarah._id,
        createdBy: alex._id,
        priority: 'Medium',
        status: 'Completed',
        dueDate: pastDate,
      },
      {
        title: 'Design Kanban drag-and-drop board UI prototypes',
        description: 'Create user flow wireframes and color schemes for project dashboards.',
        team: team._id,
        assignedTo: david._id,
        createdBy: alex._id,
        priority: 'Low',
        status: 'Completed',
        dueDate: null,
      },
    ]);

    console.log('\n======================================================');
    console.log('Demo Data Seeded Successfully!');
    console.log('======================================================');
    console.log('You can sign in with:');
    console.log('  Email:    alex@teamsync.io');
    console.log('  Password: password123');
    console.log('  (Or: sarah@teamsync.io / david@teamsync.io with password123)');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
