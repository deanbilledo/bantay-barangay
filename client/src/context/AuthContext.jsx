import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import { toast } from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
}

// Auth context
const AuthContext = createContext(initialState)

// Action types
export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOAD_USER: 'LOAD_USER',
  AUTH_ERROR: 'AUTH_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        message: action.payload.message
      }

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      }

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }

    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.REGISTER_FAIL:
    case AUTH_ACTIONS.AUTH_ERROR:
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser()
    } else {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR })
    }
  }, [state.token])

  // Load user from token
  const loadUser = async () => {
    try {
      const response = await authAPI.getMe()
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: response.data.user
      })
    } catch (error) {
      console.error('Load user error:', error)
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: error.response?.data?.error || 'Authentication failed'
      })
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authAPI.login(credentials)
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data
      })

      toast.success('Login successful!')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: errorMessage
      })
      toast.error(errorMessage)
      throw error
    }
  }

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })
      
      const response = await authAPI.register(userData)
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: response.data
      })

      toast.success(response.data.message)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAIL,
        payload: errorMessage
      })
      toast.error(errorMessage)
      throw error
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      toast.success('Logged out successfully')
    }
  }

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: response.data.user
      })

      toast.success('Profile updated successfully')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed'
      toast.error(errorMessage)
      throw error
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData)
      toast.success('Password changed successfully')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password change failed'
      toast.error(errorMessage)
      throw error
    }
  }

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email)
      toast.success(response.data.message)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password reset request failed'
      toast.error(errorMessage)
      throw error
    }
  }

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password)
      toast.success('Password reset successfully')
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password reset failed'
      toast.error(errorMessage)
      throw error
    }
  }

  // Clear errors
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
