import { mockApi } from './mockClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const isMockMode = import.meta.env.VITE_USE_MOCK !== 'false';

let authToken = localStorage.getItem('kaoyan_buddy_token') || '';

export function setAuthToken(token) {
  authToken = token || '';
  if (authToken) {
    localStorage.setItem('kaoyan_buddy_token', authToken);
  } else {
    localStorage.removeItem('kaoyan_buddy_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      setAuthToken('');
      window.dispatchEvent(new Event('kaoyan-buddy-auth-expired'));
    }
    const error = new Error(data?.message || '请求失败');
    error.status = response.status;
    error.fields = data?.fields || {};
    throw error;
  }

  return data;
}

const realApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),

  listSubjects: () => request('/subjects'),
  createSubject: (payload) => request('/subjects', { method: 'POST', body: JSON.stringify(payload) }),
  updateSubject: (id, payload) => request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteSubject: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),

  listTasks: (params = {}) => request(`/tasks${query(params)}`),
  createTask: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updateTaskStatus: (id, payload) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  generateTasks: (payload) => request('/tasks/generate', { method: 'POST', body: JSON.stringify(payload) }),

  dashboardSummary: (params = {}) => request(`/dashboard/summary${query(params)}`),
  chat: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
};

export const api = isMockMode ? mockApi : realApi;

function query(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}
