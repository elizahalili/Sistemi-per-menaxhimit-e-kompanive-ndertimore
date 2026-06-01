import React, { lazy, Suspense, useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('./views/Login'))
const Register = lazy(() => import('./views/Register'))
const Dashboard = lazy(() => import('./views/Dashboard'))
const Clients = lazy(() => import('./views/Clients'))
const Projects = lazy(() => import('./views/Projects'))
const Workers = lazy(() => import('./views/Workers'))
const Phases = lazy(() => import('./views/Phases'))
const Tasks = lazy(() => import('./views/Tasks'))
const TaskAssignments = lazy(() => import('./views/TaskAssignments'))
const Suppliers = lazy(() => import('./views/Suppliers'))
const Materials = lazy(() => import('./views/Materials'))
const MaterialUsages = lazy(() => import('./views/MaterialUsages'))
const Equipment = lazy(() => import('./views/Equipment'))
const Invoices = lazy(() => import('./views/Invoices'))

const ViewFallback = ({ fullScreen = false }) => (
  <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-slate-900' : 'min-h-[240px]'}`}>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm">
      <div className="h-3 w-3 rounded-full bg-brand-500 animate-pulse" />
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Duke ngarkuar...</span>
    </div>
  </div>
)

const AppContent = () => {
  const { token } = useAuth()
  const { darkMode } = useTheme()
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Listen to hash changes for robust single-page application routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/')
      setSidebarOpen(false) // Collapse sidebar on route switch in mobile
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Routing Switchboard
  const renderView = () => {
    switch (currentHash) {
      case '#/':
        return <ProtectedRoute><Dashboard /></ProtectedRoute>
      case '#/clients':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Clients /></ProtectedRoute>
      case '#/projects':
        return <ProtectedRoute><Projects /></ProtectedRoute>
      case '#/phases':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Phases /></ProtectedRoute>
      case '#/tasks':
        return <ProtectedRoute><Tasks /></ProtectedRoute>
      case '#/assignments':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><TaskAssignments /></ProtectedRoute>
      case '#/workers':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Workers /></ProtectedRoute>
      case '#/suppliers':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Suppliers /></ProtectedRoute>
      case '#/materials':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Materials /></ProtectedRoute>
      case '#/usages':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><MaterialUsages /></ProtectedRoute>
      case '#/equipment':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Equipment /></ProtectedRoute>
      case '#/invoices':
        return <ProtectedRoute allowedRoles={['Admin', 'Manager']}><Invoices /></ProtectedRoute>
      default:
        return <ProtectedRoute><Dashboard /></ProtectedRoute>
    }
  }

  // Handle outside layouts for non-authenticated pages
  const isAuthPage = currentHash === '#/login' || currentHash === '#/register' || !token

  if (isAuthPage) {
    return (
      <Suspense fallback={<ViewFallback fullScreen />}>
        {currentHash === '#/register' ? <Register /> : <Login />}
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentHash={currentHash} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Administrative Viewport Panel */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">
        
        <Header 
          currentHash={currentHash} 
          onMenuOpen={() => setSidebarOpen(true)}
        />
        
        {/* Dynamic Inner Dashboard Page Wrapper */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <div className="animate-fade-in">
            <Suspense fallback={<ViewFallback />}>
              {renderView()}
            </Suspense>
          </div>
        </main>
      </div>

    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
