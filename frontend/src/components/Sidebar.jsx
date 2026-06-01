import React from 'react'
import { 
  LayoutDashboard, Users, Building2, Layers, CheckSquare, 
  UserCheck, Truck, Boxes, FileInput, Hammer, FileSpreadsheet, 
  LogOut, ShieldAlert, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = ({ currentHash, isOpen, onClose }) => {
  const { user, logout } = useAuth()

  // Base navigation configuration with role claims
  const navItems = [
    { label: "Dashboard", hash: "#/", icon: LayoutDashboard, roles: ["Admin", "Manager", "Worker"] },
    { label: "Klientët", hash: "#/clients", icon: Users, roles: ["Admin", "Manager"] },
    { label: "Projektet", hash: "#/projects", icon: Building2, roles: ["Admin", "Manager", "Worker"] },
    { label: "Fazat", hash: "#/phases", icon: Layers, roles: ["Admin", "Manager"] },
    { label: "Detyrat", hash: "#/tasks", icon: CheckSquare, roles: ["Admin", "Manager", "Worker"] },
    { label: "Caktimet", hash: "#/assignments", icon: UserCheck, roles: ["Admin", "Manager"] },
    { label: "Punëtorët", hash: "#/workers", icon: Users, roles: ["Admin", "Manager"] },
    { label: "Furnitorët", hash: "#/suppliers", icon: Truck, roles: ["Admin", "Manager"] },
    { label: "Materialet", hash: "#/materials", icon: Boxes, roles: ["Admin", "Manager"] },
    { label: "Përdorimi i Stokut", hash: "#/usages", icon: FileInput, roles: ["Admin", "Manager"] },
    { label: "Pajisjet", hash: "#/equipment", icon: Hammer, roles: ["Admin", "Manager"] },
    { label: "Faturat", hash: "#/invoices", icon: FileSpreadsheet, roles: ["Admin", "Manager"] }
  ]

  const activeItem = navItems.find(item => item.hash === currentHash) || navItems[0]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header Brand */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-brand-500/20">
              HD
            </div>
            <div>
              <h1 className="font-extrabold text-slate-850 dark:text-white tracking-wide text-base font-sans">EHD Construction</h1>
              <p className="text-[10px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest leading-none mt-0.5">Sistem Menaxhimi</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item, idx) => {
            // Check roles
            if (!item.roles.includes(user?.role)) return null;

            const Icon = item.icon
            const isActive = item.hash === currentHash

            return (
              <a
                key={idx}
                href={item.hash}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all duration-200 ${isActive ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                {item.label}
              </a>
            )
          })}
        </div>

        {/* User profile section at the bottom */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-sm uppercase">
              {user?.emri?.[0]}{user?.mbiemri?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate uppercase tracking-wider">{user?.emri} {user?.mbiemri}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{user?.role}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 dark:border-red-950/30 dark:hover:bg-red-950/20 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Çkyçu (Logout)
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
