import React from 'react'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, hasRole } = useAuth()

  if (!token || !user) {
    // If not logged in, force navigation to the login view by replacing component
    window.location.hash = '#/login'
    return null
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6v2m0-6a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mb-2">Qasje e Refuzuar!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Ju nuk keni autorizim për të parë këtë faqe. Kjo zonë kërkon privilegjet e: <strong className="text-brand-500 dark:text-brand-400">{allowedRoles.join(', ')}</strong>.
        </p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
