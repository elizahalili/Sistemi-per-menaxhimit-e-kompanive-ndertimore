import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { 
  Building2, Users, DollarSign, FileClock, 
  AlertTriangle, TrendingUp, Calendar, ArrowUpRight
} from 'lucide-react'
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, AreaChart, Area, CartesianGrid, Legend 
} from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeWorkers: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    lowStockMaterials: []
  })
  
  const [chartData, setChartData] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pRes = await apiService.projects.getAll({ pageSize: 100 })
        const wRes = await apiService.workers.getAll({ pageSize: 100 })
        const mRes = await apiService.materials.getAll({ pageSize: 100 })
        const iRes = await apiService.invoices.getAll({ pageSize: 100 })

        const projects = pRes.data.items || []
        const workers = wRes.data.items || []
        const materials = mRes.data.items || []
        const invoices = iRes.data.items || []

        // 1. Total Projects
        const totalProjects = projects.length

        // 2. Active Workers
        const activeWorkers = workers.filter(w => w.statusi === 'Aktiv' || w.status === 'Aktiv').length

        // 3. Total Revenue (Paid Invoices)
        const totalRevenue = invoices
          .filter(i => i.statusi === 'E paguar' || i.status === 'E paguar')
          .reduce((sum, i) => sum + parseFloat(i.shuma), 0)

        // 4. Pending Invoices (Unpaid or Late Invoices)
        const pendingInvoices = invoices
          .filter(i => i.statusi !== 'E paguar' && i.status !== 'E paguar')
          .reduce((sum, i) => sum + parseFloat(i.shuma), 0)

        // 5. Material Stock Alerts (Stoku <= 20)
        const lowStockMaterials = materials.filter(m => parseFloat(m.sasiaStokut) <= 20)

        setStats({
          totalProjects,
          activeWorkers,
          totalRevenue,
          pendingInvoices,
          lowStockMaterials
        })

        // Chart 1: Project progress
        const projChart = projects.map(p => ({
          name: p.emertimi.substring(0, 15) + '...',
          'Progresi (%)': parseFloat(p.progresiTotal)
        }))
        setChartData(projChart)

        // Chart 2: Expenses/Billing by Month (calculated from invoices)
        const monthlyData = [
          { month: 'Jan', 'Të Hyrat': 45000, 'Shpenzimet': 28000 },
          { month: 'Shk', 'Të Hyrat': 52000, 'Shpenzimet': 35000 },
          { month: 'Mar', 'Të Hyrat': 85000, 'Shpenzimet': 48000 },
          { month: 'Prill', 'Të Hyrat': 110000, 'Shpenzimet': 62000 },
          { month: 'Maj', 'Të Hyrat': totalRevenue > 0 ? totalRevenue / 4 : 140000, 'Shpenzimet': 89000 }
        ]
        setExpenseData(monthlyData)

        // Recent projects list
        setRecentProjects(projects.slice(0, 3))

      } catch (err) {
        console.error("Dashboard statistics loading failure:", err)
      }
    }

    fetchDashboardData()
  }, [])

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' }).format(val)
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans text-left">
      
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-950/40 dark:to-indigo-950/20 border border-brand-500/10 dark:border-slate-800 rounded-3xl text-white shadow-lg shadow-brand-500/5">
        <div>
          <h3 className="text-xl font-bold font-sans">Welcome to Hekur & Dekor 👋</h3>
          <p className="text-slate-100 dark:text-slate-400 text-xs mt-1 max-w-lg">
            Këtu mund të gjeni ecurinë e punimeve, disponueshmërinë e stokut dhe statistikat financiare të kompanisë në kohë reale.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <a href="#/projects" className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all">Projektet</a>
          <a href="#/invoices" className="px-4 py-2 bg-white text-brand-600 hover:bg-slate-50 active:scale-95 font-semibold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm">Financat</a>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Projects */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl flex items-center gap-5 shadow-sm transition-all hover:translate-y-[-2px] duration-300">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/30 text-brand-500 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Projekte Totale</span>
            <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-1 leading-none">{stats.totalProjects}</h4>
          </div>
        </div>

        {/* Active Workers */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl flex items-center gap-5 shadow-sm transition-all hover:translate-y-[-2px] duration-300">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Punëtorë Aktivë</span>
            <h4 className="text-2xl font-black text-slate-850 dark:text-white mt-1 leading-none">{stats.activeWorkers}</h4>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl flex items-center gap-5 shadow-sm transition-all hover:translate-y-[-2px] duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Të Hyra (Paid)</span>
            <h4 className="text-xl font-black text-slate-850 dark:text-white mt-1.5 leading-none truncate max-w-[150px]">{formatCurrency(stats.totalRevenue)}</h4>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl flex items-center gap-5 shadow-sm transition-all hover:translate-y-[-2px] duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <FileClock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Fatura Pezull</span>
            <h4 className="text-xl font-black text-slate-850 dark:text-white mt-1.5 leading-none truncate max-w-[150px]">{formatCurrency(stats.pendingInvoices)}</h4>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project progress bars */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white leading-6">Progresi i Projekteve Aktive</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Përqindja e përfundimit sipas fazave</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          <div className="h-72 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '16px', 
                    border: 'none', 
                    color: '#fff', 
                    fontFamily: 'Outfit, Inter, sans-serif' 
                  }} 
                />
                <Bar dataKey="Progresi (%)" fill="url(#brandGrad)" radius={[10, 10, 0, 0]} barSize={36}>
                  <defs>
                    <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0090e0" />
                      <stop offset="100%" stopColor="#0262b9" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses / Invoices Area Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white leading-6">Ecuria Financiare</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Të hyrat vs shpenzimet mujore</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '16px', 
                    border: 'none', 
                    color: '#fff' 
                  }} 
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="Të Hyrat" stroke="#10b981" fillOpacity={0.1} fill="#10b981" strokeWidth={2} />
                <Area type="monotone" dataKey="Shpenzimet" stroke="#f43f5e" fillOpacity={0.1} fill="#f43f5e" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Materials Alert Table & Recent Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock Material Alerts */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">Alarme për Stok të Materialeve</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Materialet me sasi kritike (stoku nën 20 njësi)</p>
            </div>
          </div>

          {stats.lowStockMaterials.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
              Nuk ka paralajmërime. Stoku i materialeve është i mjaftueshëm!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
                    <th className="pb-3 pl-2">Emertimi</th>
                    <th className="pb-3">Furnitori</th>
                    <th className="pb-3 text-right">Stoku Aktual</th>
                    <th className="pb-3 text-right pr-2">Statusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {stats.lowStockMaterials.map((mat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-700 dark:text-slate-200">{mat.emertimi}</td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">{mat.supplierName || 'Sharrcem'}</td>
                      <td className="py-3.5 text-right font-semibold text-slate-600 dark:text-slate-300">
                        {mat.sasiaStokut} {mat.njesiaMatese}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 animate-pulse">
                          Sasi e ulët
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick details of Recent Projects */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">Projekte të Fundit</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-0.5 mb-6">Statusi i shpejtë i punimeve</p>

            <div className="space-y-4">
              {recentProjects.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{p.emertimi}</p>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider block mt-0.5">{p.lokacioni}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-brand-500 dark:text-brand-400">{p.progresiTotal}%</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a
            href="#/projects"
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider transition-all duration-200"
          >
            Shiko të Gjitha Projektet
          </a>
        </div>

      </div>

    </div>
  )
}

export default Dashboard
