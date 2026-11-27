import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('bankease_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bankease_token')
      localStorage.removeItem('bankease_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const accountAPI = {
  getMyAccount: () => api.get('/account/me'),
  lookupAccount: (accountNumber) => api.get(`/account/lookup/${accountNumber}`),
}

export const transactionAPI = {
  transfer: (data) => api.post('/transactions/transfer', data),
  getHistory: (page = 0, size = 10) => api.get(`/transactions/history?page=${page}&size=${size}`),
  getRecent: () => api.get('/transactions/recent'),
}

export default api

