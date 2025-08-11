import React, { createContext, useContext } from 'react'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const value = {
    notifications: [],
    unreadCount: 0
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
