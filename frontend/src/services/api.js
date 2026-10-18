const API_BASE = '/api';

/**
 * Universal HTTP request wrapper with JWT authorization and error normalization
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('teamsync_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('teamsync_token');
        localStorage.removeItem('teamsync_user');
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

// Authentication API
export const authAPI = {
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me', { method: 'GET' }),
};

// Team Management API
export const teamAPI = {
  getAll: () => request('/teams', { method: 'GET' }),
  getById: (id) => request(`/teams/${id}`, { method: 'GET' }),
  create: (teamData) => request('/teams', { method: 'POST', body: teamData }),
  update: (id, teamData) => request(`/teams/${id}`, { method: 'PUT', body: teamData }),
  delete: (id) => request(`/teams/${id}`, { method: 'DELETE' }),
  addMember: (id, memberData) => request(`/teams/${id}/members`, { method: 'POST', body: memberData }),
  removeMember: (id, userId) => request(`/teams/${id}/members/${userId}`, { method: 'DELETE' }),
};

// Task Management API
export const taskAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/tasks${queryString}`, { method: 'GET' });
  },
  getById: (id) => request(`/tasks/${id}`, { method: 'GET' }),
  create: (taskData) => request('/tasks', { method: 'POST', body: taskData }),
  update: (id, taskData) => request(`/tasks/${id}`, { method: 'PUT', body: taskData }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getDashboardStats: () => request('/tasks/dashboard/stats', { method: 'GET' }),
};

export default {
  auth: authAPI,
  teams: teamAPI,
  tasks: taskAPI,
};
