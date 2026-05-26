import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { initLocalDatabase } from '../services/mockData'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize standard database state in browser
    initLocalDatabase()
    
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login({ email, password })
      const { accessToken, user: loggedUser } = response.data
      
      setUser(loggedUser)
      setToken(accessToken)
      
      return loggedUser
    } catch (error) {
      console.error("Login failure:", error)
      throw error
    }
  }

  const register = async (payload) => {
    try {
      const response = await apiService.auth.register(payload)
      const { accessToken, user: registeredUser } = response.data
      
      setUser(registeredUser)
      setToken(accessToken)
      
      return registeredUser
    } catch (error) {
      console.error("Register failure:", error)
      throw error
    }
  }

  const logout = () => {
    apiService.auth.logout()
    setUser(null)
    setToken(null)
  }

  const hasRole = (allowedRoles) => {
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
