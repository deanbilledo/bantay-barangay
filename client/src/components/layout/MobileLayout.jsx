import React from 'react'
import { Outlet } from 'react-router-dom'

const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-safe">
        <Outlet />
      </main>
    </div>
  )
}

export default MobileLayout
