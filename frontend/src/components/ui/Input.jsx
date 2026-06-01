import React from 'react'

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  options = [], // For select type
  className = '',
  rows = 3, // For textarea type
  disabled = false
}) => {
  const inputBaseStyles = 'w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200 text-sm font-sans'
  const errorStyles = error ? 'border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-900' : ''

  return (
    <div className={`w-full text-left flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputBaseStyles} ${errorStyles}`}
          required={required}
          disabled={disabled}
        >
          <option value="" disabled>{placeholder || 'Zgjidh një opsion...'}</option>
          {options.map((opt, i) => (
            <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${inputBaseStyles} ${errorStyles} resize-none`}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputBaseStyles} ${errorStyles}`}
          required={required}
          disabled={disabled}
        />
      )}
      
      {error && (
        <span className="text-xs text-red-500 font-sans tracking-wide mt-0.5">
          {error}
        </span>
      )}
    </div>
  )
}

export default Input
