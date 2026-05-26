import React from 'react'

const Card = ({ 
  children, 
  title, 
  subtitle, 
  action, 
  className = '',
  bodyClassName = 'p-6'
}) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-3xl overflow-hidden transition-all duration-200 ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold font-sans text-slate-850 dark:text-white leading-6">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 font-sans">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  )
}

export default Card
