import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy loaded views simulation for university performance benchmarks
import Login from './views/Login'
import Register from './views/Register'
import Dashboard from './views/Dashboard'
import Clients from './views/Clients'
import Projects from './views/Projects'
import Workers from './views/Workers'
import Phases from './views/Phases'
import Tasks from './views/Tasks'
import TaskAssignments from './views/TaskAssignments'
import Suppliers from './views/Suppliers'
import Materials from './views/Materials'
import MaterialUsages from './views/MaterialUsages'
import Equipment from './views/Equipment'
import Invoices from './views/Invoices'

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
    if (currentHash === '#/register') return <Register />
    return <Login />
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
            {renderView()}
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
