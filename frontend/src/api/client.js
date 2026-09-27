/**
 * Scribbly API Client
 * Configured with credentials: 'include' for secure cookie-based auth
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Crucial for sending/receiving httpOnly auth cookies
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new ApiError('Unable to connect to the Scribbly server. Please ensure the backend is running.', 0, null);
  }

  // Parse response
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
    // If errorMessage is an array (class-validator default), join them
    const messageStr = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
    throw new ApiError(messageStr, response.status, data);
  }

  return data;
}

export const api = {
  // Auth API
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    refresh: () => request('/auth/refresh', { method: 'POST' }),
    me: () => request('/auth/me', { method: 'GET' }),
  },

  // Notes API
  notes: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.archived !== undefined && params.archived !== null) {
        searchParams.append('archived', String(params.archived));
      }
      if (params.pinned !== undefined && params.pinned !== null) {
        searchParams.append('pinned', String(params.pinned));
      }
      if (params.favourite !== undefined && params.favourite !== null) {
        searchParams.append('favourite', String(params.favourite));
      }
      if (params.search) {
        searchParams.append('search', params.search);
      }
      if (params.tag) {
        searchParams.append('tag', params.tag);
      }

      const queryString = searchParams.toString();
      return request(`/notes${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
    },
    getPublic: (id) => request(`/notes/public/${id}`, { method: 'GET' }),
    create: (noteData) => request('/notes', { method: 'POST', body: noteData }),
    update: (id, updates) => request(`/notes/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
  },

  // Tags API
  tags: {
    list: () => request('/tags', { method: 'GET' }),
    create: (tagData) => request('/tags', { method: 'POST', body: tagData }),
    update: (id, tagData) => request(`/tags/${id}`, { method: 'PATCH', body: tagData }),
    delete: (id) => request(`/tags/${id}`, { method: 'DELETE' }),
  },

  // Trash API
  trash: {
    list: () => request('/trash', { method: 'GET' }),
    restore: (id = null) => {
      const query = id !== null ? `?id=${id}` : '';
      return request(`/trash/restore${query}`, { method: 'POST' });
    },
    clear: (id = null) => {
      const query = id !== null ? `?id=${id}` : '';
      return request(`/trash/clear${query}`, { method: 'DELETE' });
    },
  },
};

export { ApiError };
