import React, { createContext, useContext } from 'react'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  // Socket.io will be implemented later
  const value = {
    socket: null,
    connected: false
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
