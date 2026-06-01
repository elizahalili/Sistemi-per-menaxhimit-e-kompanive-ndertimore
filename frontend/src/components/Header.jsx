import React, { useEffect, useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import ThemeToggle from './ui/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'

const Header = ({ currentHash, onMenuOpen }) => {
  const { user } = useAuth()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [materialsResponse, invoicesResponse] = await Promise.all([
          apiService.materials.getAll({ lowStock: true, pageSize: 5 }),
          apiService.invoices.getAll({ status: 'E papaguar', pageSize: 5 })
        ])

        const lowStockItems = (materialsResponse.data.items || []).map((material) => ({
          id: `material-${material.id}`,
          href: '#/materials',
          title: material.emertimi,
          description: `Stok kritik: ${material.sasiaStokut} ${material.njesiaMatese}`,
          tone: 'warning'
        }))

        const unpaidInvoiceItems = (invoicesResponse.data.items || []).map((invoice) => ({
          id: `invoice-${invoice.id}`,
          href: '#/invoices',
          title: invoice.projectName,
          description: `Faturë e papaguar: ${invoice.shuma} EUR`,
          tone: 'info'
        }))

        setNotifications([...lowStockItems, ...unpaidInvoiceItems].slice(0, 6))
      } catch (error) {
        console.error('Notification loading failure:', error)
        setNotifications([])
      }
    }

    fetchNotifications()
  }, [currentHash])

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

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Njoftime</span>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[11px] font-semibold text-brand-500 hover:text-brand-600"
                >
                  Mbyll
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="px-2 py-5 text-sm text-slate-500 dark:text-slate-400">
                  Nuk ka njoftime aktive.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <a
                      key={notification.id}
                      href={notification.href}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                    >
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">{notification.title}</div>
                      <div className={`text-xs mt-1 ${notification.tone === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {notification.description}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />

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
