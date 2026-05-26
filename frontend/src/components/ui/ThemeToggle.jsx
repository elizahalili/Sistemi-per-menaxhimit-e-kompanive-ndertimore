import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Button from './Button'

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme()

  return (
    <Button
      variant="icon"
      onClick={toggleTheme}
      className="relative flex items-center justify-center"
      icon={
        darkMode ? (
          <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-brand-600 hover:text-brand-700 transition-colors" />
        )
      }
    />
  )
}

export default ThemeToggle
