import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.'
    }
    
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email })
}

// Rescue Request API endpoints
export const rescueAPI = {
  create: (requestData) => api.post('/rescue-requests', requestData),
  getAll: (params) => api.get('/rescue-requests', { params }),
  getById: (id) => api.get(`/rescue-requests/${id}`),
  update: (id, updateData) => api.put(`/rescue-requests/${id}`, updateData),
  updateStatus: (id, statusData) => api.patch(`/rescue-requests/${id}/status`, statusData),
  assignResponder: (id, responderData) => api.patch(`/rescue-requests/${id}/assign`, responderData),
  addNote: (id, noteData) => api.post(`/rescue-requests/${id}/notes`, noteData),
  uploadPhoto: (id, formData) => api.post(`/rescue-requests/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/rescue-requests/${id}`),
  getNearby: (lat, lng, radius) => api.get(`/rescue-requests/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getStats: (dateRange) => api.get('/rescue-requests/stats', { params: dateRange })
}

// Alert API endpoints
export const alertAPI = {
  create: (alertData) => api.post('/alerts', alertData),
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  update: (id, updateData) => api.put(`/alerts/${id}`, updateData),
  publish: (id) => api.patch(`/alerts/${id}/publish`),
  deactivate: (id, reason) => api.patch(`/alerts/${id}/deactivate`, { reason }),
  acknowledge: (id, location) => api.patch(`/alerts/${id}/acknowledge`, { location }),
  getActive: () => api.get('/alerts/active'),
  getStats: (dateRange) => api.get('/alerts/stats', { params: dateRange })
}

// Aid Distribution API endpoints
export const aidAPI = {
  create: (distributionData) => api.post('/aid-distribution', distributionData),
  getAll: (params) => api.get('/aid-distribution', { params }),
  getById: (id) => api.get(`/aid-distribution/${id}`),
  update: (id, updateData) => api.put(`/aid-distribution/${id}`, updateData),
  delete: (id) => api.delete(`/aid-distribution/${id}`),
  getByHousehold: (householdId) => api.get(`/aid-distribution/household/${householdId}`),
  getStats: (dateRange) => api.get('/aid-distribution/stats', { params: dateRange }),
  checkDuplicate: (householdData) => api.post('/aid-distribution/check-duplicate', householdData)
}

// Incident API endpoints
export const incidentAPI = {
  create: (incidentData) => api.post('/incidents', incidentData),
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  update: (id, updateData) => api.put(`/incidents/${id}`, updateData),
  delete: (id) => api.delete(`/incidents/${id}`),
  getNearby: (lat, lng, radius) => api.get(`/incidents/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getActive: () => api.get('/incidents/active')
}

// User API endpoints
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, updateData) => api.put(`/users/${id}`, updateData),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`)
}

// Upload API endpoints
export const uploadAPI = {
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (filename) => api.delete(`/upload/${filename}`)
}

// Notification API endpoints
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`)
}

// Health check
export const healthAPI = {
  check: () => api.get('/health')
}

export default api
