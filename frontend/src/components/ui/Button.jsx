import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button', 
  className = '', 
  disabled = false,
  icon
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none rounded-xl text-sm font-sans'
  
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:scale-100 disabled:shadow-none py-2.5 px-5',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-100 py-2.5 px-5',
    outline: 'border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 active:scale-[0.98] text-slate-700 dark:text-slate-300 py-2.5 px-5',
    danger: 'bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white py-2 px-4 shadow-sm shadow-red-500/10',
    icon: 'p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  )
}

export default Button
