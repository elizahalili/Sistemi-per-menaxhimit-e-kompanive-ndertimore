import React from 'react'
import { Menu, Bell, User } from 'lucide-react'
import ThemeToggle from './ui/ThemeToggle'
import { useAuth } from '../context/AuthContext'

const Header = ({ currentHash, onMenuOpen }) => {
  const { user } = useAuth()

  // Match title
  const getPageTitle = () => {
    switch (currentHash) {
      case '#/': return 'Dashboard i Kompanisë'
      case '#/clients': return 'Menaxhimi i Klientëve'
      case '#/projects': return 'Regjistri i Projekteve'
      case '#/phases': return 'Fazat e Ndërtimit'
      case '#/tasks': return 'Detyrat dhe Aktivitetet'
      case '#/assignments': return 'Caktimi i Punëtorëve'
      case '#/workers': return 'Regjistri i Punëtorëve'
      case '#/suppliers': return 'Furnitorët Partnerë'
      case '#/materials': return 'Stoku dhe Materialet'
      case '#/usages': return 'Përdorimi i Materialeve'
      case '#/equipment': return 'Pajisjet dhe Makineria'
      case '#/invoices': return 'Faturat dhe Financat'
      default: return 'Paneli i Kontrollit'
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 md:px-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
      
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h2 className="text-xl font-extrabold text-slate-850 dark:text-white font-sans leading-none">
            {getPageTitle()}
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-1 hidden sm:block">
            Paneli Administrativ / EHD Construction
          </p>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {/* Notifications Mock Bell */}
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all active:scale-95">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse-subtle" />
        </button>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />

        {/* Small User Info tag */}
        <div className="items-center gap-2.5 pl-1 hidden sm:flex">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-200/30">
            {user?.emri?.[0]}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate tracking-wide max-w-[100px] leading-tight">
              {user?.emri}
            </p>
            <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest leading-none">
              {user?.role}
            </span>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Header
