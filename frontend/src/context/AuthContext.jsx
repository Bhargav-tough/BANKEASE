import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bankease_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const [token, setToken] = useState(() => localStorage.getItem('bankease_token'))

  const login = useCallback((userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('bankease_user', JSON.stringify(userData))
    localStorage.setItem('bankease_token', jwtToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('bankease_user')
    localStorage.removeItem('bankease_token')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('bankease_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!token,
      login, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

