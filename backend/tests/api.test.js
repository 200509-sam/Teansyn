const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teamsync';
const PORT = 5001; // Run test on port 5001 to avoid conflicts

// Set environment for test
process.env.PORT = PORT;
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('../middleware/errorMiddleware');
const authRoutes = require('../routes/authRoutes');
const teamRoutes = require('../routes/teamRoutes');
const taskRoutes = require('../routes/taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use(notFound);
app.use(errorHandler);

let server;

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => {
          resData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = resData ? JSON.parse(resData) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: resData });
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting TeamSync Backend Integration Test Suite ---');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB test database.');

  // Clean test data
  const testEmails = ['testadmin@teamsync.test', 'testmember@teamsync.test', 'stranger@teamsync.test'];
  const User = require('../models/User');
  const Team = require('../models/Team');
  const Task = require('../models/Task');

  await User.deleteMany({ email: { $in: testEmails } });
  await Team.deleteMany({ name: { $in: ['Test Engineering Team', 'Secret Rogue Team'] } });

  server = app.listen(PORT, async () => {
    try {
      console.log(`Test server running on port ${PORT}`);

      // 1. REGISTER
      console.log('\n[1] Testing Registration...');
      // Mismatched passwords
      const failReg = await request('POST', '/api/auth/register', {
        name: 'Test Admin',
        email: 'testadmin@teamsync.test',
        password: 'password123',
        confirmPassword: 'mismatchpassword',
      });
      if (failReg.status !== 400) throw new Error(`Expected 400 on password mismatch, got ${failReg.status}`);
      console.log('✓ Rejected password mismatch successfully');

      // Valid Registration User 1
      const reg1 = await request('POST', '/api/auth/register', {
        name: 'Test Admin',
        email: 'testadmin@teamsync.test',
        password: 'password123',
        confirmPassword: 'password123',
      });
      if (reg1.status !== 201 || !reg1.body.token) throw new Error(`User 1 registration failed: ${JSON.stringify(reg1.body)}`);
      const token1 = reg1.body.token;
      const user1Id = reg1.body._id;
      console.log('✓ User 1 (Admin) registered successfully with token');

      // Duplicate email registration
      const dupReg = await request('POST', '/api/auth/register', {
        name: 'Duplicate Admin',
        email: 'testadmin@teamsync.test',
        password: 'password123',
        confirmPassword: 'password123',
      });
      if (dupReg.status !== 400) throw new Error(`Expected 400 on duplicate email, got ${dupReg.status}`);
      console.log('✓ Duplicate email registration rejected');

      // Valid Registration User 2
      const reg2 = await request('POST', '/api/auth/register', {
        name: 'Test Member',
        email: 'testmember@teamsync.test',
        password: 'password123',
        confirmPassword: 'password123',
      });
      if (reg2.status !== 201) throw new Error(`User 2 registration failed: ${JSON.stringify(reg2.body)}`);
      const token2 = reg2.body.token;
      const user2Id = reg2.body._id;
      console.log('✓ User 2 (Member) registered successfully');

      // 2. LOGIN
      console.log('\n[2] Testing Login...');
      const invalidLogin = await request('POST', '/api/auth/login', {
        email: 'testadmin@teamsync.test',
        password: 'wrongpassword',
      });
      if (invalidLogin.status !== 401) throw new Error(`Expected 401 on wrong password, got ${invalidLogin.status}`);
      console.log('✓ Invalid password login rejected');

      const validLogin = await request('POST', '/api/auth/login', {
        email: 'testadmin@teamsync.test',
        password: 'password123',
      });
      if (validLogin.status !== 200 || !validLogin.body.token) throw new Error('Valid login failed');
      console.log('✓ Valid login returned JWT');

      // 3. AUTH ME
      console.log('\n[3] Testing /api/auth/me...');
      const meRes = await request('GET', '/api/auth/me', null, token1);
      if (meRes.status !== 200 || meRes.body.email !== 'testadmin@teamsync.test') throw new Error('Auth me check failed');
      if (meRes.body.password) throw new Error('Security flaw: Password returned in /api/auth/me response!');
      console.log('✓ /api/auth/me succeeded and excluded password field');

      // 4. TEAMS
      console.log('\n[4] Testing Team Management & Authorization...');
      const createTeamRes = await request('POST', '/api/teams', {
        name: 'Test Engineering Team',
        description: 'Core Engineering team working on TeamSync platform',
      }, token1);
      if (createTeamRes.status !== 201 || !createTeamRes.body._id) throw new Error('Create team failed');
      const teamId = createTeamRes.body._id;
      console.log('✓ Team created with Admin role assigned to creator');

      // Add User 2 to Team
      const addMemberRes = await request('POST', `/api/teams/${teamId}/members`, {
        email: 'testmember@teamsync.test',
        role: 'Member',
      }, token1);
      if (addMemberRes.status !== 200) throw new Error(`Add member failed: ${JSON.stringify(addMemberRes.body)}`);
      console.log('✓ User 2 added to team by email');

      // Attempt duplicate member add
      const dupMemberRes = await request('POST', `/api/teams/${teamId}/members`, {
        email: 'testmember@teamsync.test',
      }, token1);
      if (dupMemberRes.status !== 400) throw new Error('Expected 400 when adding duplicate team member');
      console.log('✓ Duplicate team member addition rejected');

      // User 2 lists their teams
      const user2Teams = await request('GET', '/api/teams', null, token2);
      if (user2Teams.status !== 200 || user2Teams.body.length !== 1) throw new Error('User 2 should see the team');
      if (user2Teams.body[0].currentUserRole !== 'Member') throw new Error('User 2 role should be Member');
      console.log('✓ User 2 successfully listed team with Member role');

      // User 2 attempts to delete team (Unauthorized)
      const unauthDelete = await request('DELETE', `/api/teams/${teamId}`, null, token2);
      if (unauthDelete.status !== 403) throw new Error(`Expected 403 for member deleting team, got ${unauthDelete.status}`);
      console.log('✓ Non-admin prevented from deleting team');

      // 5. TASKS
      console.log('\n[5] Testing Task Creation, Kanban Status & Roles...');
      // User 1 creates task 1 assigned to User 2
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const task1Res = await request('POST', '/api/tasks', {
        title: 'Build Authentication Module',
        description: 'Implement JWT login, registration, and password hashing with bcrypt.',
        team: teamId,
        assignedTo: user2Id,
        priority: 'High',
        status: 'To Do',
        dueDate: dueDate.toISOString(),
      }, token1);
      if (task1Res.status !== 201 || !task1Res.body._id) throw new Error(`Create task 1 failed: ${JSON.stringify(task1Res.body)}`);
      const task1Id = task1Res.body._id;
      console.log('✓ Task 1 created (High priority, To Do, assigned to User 2)');

      // User 1 creates task 2 assigned to User 1 (Overdue task test)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      const task2Res = await request('POST', '/api/tasks', {
        title: 'Review System Architecture Document',
        description: 'Validate schema design for users, teams, and tasks.',
        team: teamId,
        assignedTo: user1Id,
        priority: 'Medium',
        status: 'In Progress',
        dueDate: pastDate.toISOString(),
      }, token1);
      if (task2Res.status !== 201) throw new Error('Create task 2 failed');
      const task2Id = task2Res.body._id;
      console.log('✓ Task 2 created (Medium priority, In Progress, overdue)');

      // User 2 updates task 1 status to "In Progress"
      const updateStatusRes = await request('PUT', `/api/tasks/${task1Id}`, {
        status: 'In Progress',
      }, token2);
      if (updateStatusRes.status !== 200 || updateStatusRes.body.status !== 'In Progress') {
        throw new Error(`User 2 update status failed: ${JSON.stringify(updateStatusRes.body)}`);
      }
      console.log('✓ User 2 updated assigned task status to In Progress');

      // User 2 attempts to change task title/priority (Forbidden for regular member)
      const unauthEditRes = await request('PUT', `/api/tasks/${task2Id}`, {
        title: 'Hacked Title By Member',
        priority: 'Low',
      }, token2);
      if (unauthEditRes.status !== 403) throw new Error(`Expected 403 when member edits someone else task details, got ${unauthEditRes.status}`);
      console.log('✓ Regular member prevented from editing unauthorized task details');

      // 6. DASHBOARD METRICS
      console.log('\n[6] Testing Dynamic Dashboard Statistics...');
      const statsRes = await request('GET', '/api/tasks/dashboard/stats', null, token1);
      if (statsRes.status !== 200) throw new Error(`Dashboard stats failed: ${JSON.stringify(statsRes.body)}`);
      const s = statsRes.body;
      console.log(`   Stats computed -> Total Teams: ${s.totalTeams}, Total Tasks: ${s.totalTasks}, In Progress: ${s.inProgressTasks}, Completed: ${s.completedTasks}, Overdue: ${s.overdueTasks}`);
      if (s.totalTeams !== 1 || s.totalTasks !== 2 || s.inProgressTasks !== 2 || s.overdueTasks !== 1) {
        throw new Error(`Dashboard stats calculation mismatch: ${JSON.stringify(s)}`);
      }
      console.log('✓ Dashboard stats accurately computed from MongoDB');

      // 7. FILTERING & SEARCH
      console.log('\n[7] Testing Task Filtering and Search...');
      const filterPriority = await request('GET', '/api/tasks?priority=High', null, token1);
      if (filterPriority.body.length !== 1 || filterPriority.body[0].title !== 'Build Authentication Module') {
        throw new Error('Priority filter failed');
      }
      console.log('✓ Filter by priority returned matching task');

      const searchRes = await request('GET', '/api/tasks?search=Architecture', null, token1);
      if (searchRes.body.length !== 1 || searchRes.body[0].title !== 'Review System Architecture Document') {
        throw new Error('Search query failed');
      }
      console.log('✓ Search by title query returned matching task');

      // 8. TEAM DETAILS & MEMBER TASK COUNTS
      console.log('\n[8] Testing Team Details & Member Task Counts...');
      const teamDetailsRes = await request('GET', `/api/teams/${teamId}`, null, token1);
      if (teamDetailsRes.status !== 200) throw new Error('Team details failed');
      const member1 = teamDetailsRes.body.members.find((m) => m.user._id.toString() === user1Id.toString());
      const member2 = teamDetailsRes.body.members.find((m) => m.user._id.toString() === user2Id.toString());
      if (!member1 || member1.assignedTasksCount !== 1 || !member2 || member2.assignedTasksCount !== 1) {
        throw new Error(`Member task count mismatch: ${JSON.stringify(teamDetailsRes.body.members)}`);
      }
      console.log('✓ Member task counts computed correctly');

      // Cleanup
      await Task.deleteMany({ team: teamId });
      await Team.findByIdAndDelete(teamId);
      await User.deleteMany({ email: { $in: testEmails } });
      console.log('\n✓ Test data cleaned up successfully.');

      console.log('\n=============================================');
      console.log('✅ ALL BACKEND INTEGRATION TESTS PASSED 100%!');
      console.log('=============================================\n');

      server.close();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ TEST FAILED:', err.message);
      if (server) server.close();
      await mongoose.disconnect();
      process.exit(1);
    }
  });
};

runTests();
