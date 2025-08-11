import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'

// Context Providers
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { NotificationProvider } from './context/NotificationContext'

// Layout Components
import Layout from './components/layout/Layout'
import MobileLayout from './components/layout/MobileLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'

// Hook for responsive detection
import { useMediaQuery } from './hooks/useMediaQuery'

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const RescueRequests = React.lazy(() => import('./pages/rescue/RescueRequests'))
const CreateRescueRequest = React.lazy(() => import('./pages/rescue/CreateRescueRequest'))
const RescueRequestDetail = React.lazy(() => import('./pages/rescue/RescueRequestDetail'))
const Alerts = React.lazy(() => import('./pages/alerts/Alerts'))
const CreateAlert = React.lazy(() => import('./pages/alerts/CreateAlert'))
const AidDistribution = React.lazy(() => import('./pages/aid/AidDistribution'))
const IncidentMap = React.lazy(() => import('./pages/map/IncidentMap'))
const Profile = React.lazy(() => import('./pages/profile/Profile'))
const Settings = React.lazy(() => import('./pages/settings/Settings'))
const About = React.lazy(() => import('./pages/About'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-gray-50">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      } 
                    />
                    <Route 
                      path="/register" 
                      element={
                        <PublicRoute>
                          <Register />
                        </PublicRoute>
                      } 
                    />

                    {/* Protected Routes */}
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          {isMobile ? <MobileLayout /> : <Layout />}
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="rescue-requests" element={<RescueRequests />} />
                      <Route path="rescue-requests/new" element={<CreateRescueRequest />} />
                      <Route path="rescue-requests/:id" element={<RescueRequestDetail />} />
                      <Route path="alerts" element={<Alerts />} />
                      <Route path="alerts/new" element={<CreateAlert />} />
                      <Route path="aid-distribution" element={<AidDistribution />} />
                      <Route path="map" element={<IncidentMap />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="about" element={<About />} />
                    </Route>

                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>

                {/* Global Components */}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#22c55e',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                    },
                  }}
                />
              </div>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>

      {/* React Query DevTools (only in development) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
