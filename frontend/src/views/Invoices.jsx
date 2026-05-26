import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ShieldAlert, Check, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Invoices = () => {
  const { user, hasRole } = useAuth()
  
  // Data lists
  const [data, setData] = useState([])
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Query variables
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('dataFatures')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Form modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ projektiId: '', klientiId: '', shuma: '', pershkrimi: '', dataFatures: '', dataPageses: '', statusi: 'E papaguar' })
  const [errors, setErrors] = useState({})
  
  // Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await apiService.invoices.getAll({
        search,
        status,
        sortBy,
        sortOrder,
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Gabim gjatë ngarkimit të faturave.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const pRes = await apiService.projects.getAll({ pageSize: 100 })
      const cRes = await apiService.clients.getAll({ pageSize: 100 })
      setProjects(pRes.data.items || [])
      setClients(cRes.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [search, status, sortBy, sortOrder, page])

  useEffect(() => {
    fetchDependencies()
  }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFilter = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const toggleSort = (field) => {
    const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(field)
    setSortOrder(order)
    setPage(1)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.projektiId) newErrors.projektiId = 'Zgjedhja e projektit kërkohet.'
    if (!form.klientiId) newErrors.klientiId = 'Zgjedhja e klientit kërkohet.'
    if (!form.dataFatures) newErrors.dataFatures = 'Data e faturimit kërkohet.'
    
    if (!form.shuma || isNaN(form.shuma) || parseFloat(form.shuma) <= 0) {
      newErrors.shuma = 'Shuma e faturës duhet të jetë një numër pozitiv.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ projektiId: '', klientiId: '', shuma: '', pershkrimi: '', dataFatures: new Date().toISOString().split('T')[0], dataPageses: '', statusi: 'E papaguar' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (inv) => {
    setSelectedId(inv.id)
    setForm({
      projektiId: inv.projektiId.toString(),
      klientiId: inv.klientiId.toString(),
      shuma: inv.shuma.toString(),
      pershkrimi: inv.pershkrimi || '',
      dataFatures: inv.dataFatures.split('T')[0],
      dataPageses: inv.dataPageses ? inv.dataPageses.split('T')[0] : '',
      statusi: inv.statusi || 'E papaguar'
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      projektiId: parseInt(form.projektiId),
      klientiId: parseInt(form.klientiId),
      shuma: parseFloat(form.shuma),
      dataPageses: form.dataPageses || null
    }

    try {
      if (selectedId) {
        await apiService.invoices.update(selectedId, payload)
        triggerToast('Fatura u përditësua me sukses!')
      } else {
        await apiService.invoices.create(payload)
        triggerToast('Fatura e re u regjistrua!')
      }
      setIsModalOpen(false)
      fetchInvoices()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Ndodhi një gabim.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë faturë?')) return

    try {
      await apiService.invoices.delete(id)
      triggerToast('Fatura u fshi me sukses!')
      fetchInvoices()
    } catch (err) {
      console.error(err)
      triggerToast('Fshirja dështoi.', 'danger')
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' }).format(val)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6 font-sans text-left relative">
      
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-bold shadow-lg animate-fade-in ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/50' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-900/50'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header filter card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko financat sipas përshkrimit ose projektit..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-3 justify-end">
          <select
            value={status}
            onChange={handleFilter}
            className="px-4 py-2.5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 text-sm font-semibold"
          >
            <option value="">Të gjitha faturat</option>
            <option value="E paguar">E paguar</option>
            <option value="E papaguar">E papaguar</option>
            <option value="E vonuar">E vonuar</option>
          </select>

          {hasRole(["Admin", "Manager"]) && (
            <Button
              onClick={openCreateModal}
              icon={<Plus className="w-4 h-4" />}
              className="py-2.5"
            >
              Regjistro Faturë
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Card */}
      <Card title="Financat dhe Faturimi" subtitle={`Fatura të lëshuara: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Projekti</th>
                <th className="py-4">Klienti</th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('shuma')}>
                  <div className="flex items-center gap-1.5 font-bold">Shuma <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('dataFatures')}>
                  <div className="flex items-center gap-1.5">Lëshuar Më <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Paguar Më</th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk u gjet asnjë faturë në këtë kërkim.
                  </td>
                </tr>
              ) : (
                data.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {inv.projectName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{inv.pershkrimi || 'Pa përshkrim'}</span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{inv.clientName}</td>
                    <td className="py-4 text-slate-850 dark:text-slate-100 font-black font-mono">{formatCurrency(inv.shuma)}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{inv.dataFatures.split('T')[0]}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{inv.dataPageses ? inv.dataPageses.split('T')[0] : '—'}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${inv.statusi === 'E paguar' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : inv.statusi === 'E papaguar' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
                        {inv.statusi}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(inv)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(inv.id)}
                              icon={<Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />}
                            />
                          )}
                        </div>
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Faqja <strong className="text-slate-700 dark:text-slate-300">{page}</strong> nga <strong className="text-slate-700 dark:text-slate-300">{totalPages}</strong> (Gjithsej {totalCount})
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="py-1 px-3 text-xs uppercase"
              >
                Para
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="py-1 px-3 text-xs uppercase"
              >
                Pas
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedId ? 'Përditëso Faturën' : 'Regjistro Faturë të Re'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Projekti i Faturuar"
              name="projektiId"
              type="select"
              value={form.projektiId}
              onChange={handleInputChange}
              required
              options={projects.map(p => ({ value: p.id.toString(), label: p.emertimi }))}
              error={errors.projektiId}
            />

            <Input
              label="Klienti"
              name="klientiId"
              type="select"
              value={form.klientiId}
              onChange={handleInputChange}
              required
              options={clients.map(c => ({ value: c.id.toString(), label: `${c.emri} ${c.mbiemriKompania}` }))}
              error={errors.klientiId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Shuma e Faturës (EUR)"
              name="shuma"
              value={form.shuma}
              onChange={handleInputChange}
              required
              placeholder="e.g. 15000"
              error={errors.shuma}
            />

            <Input
              label="Statusi"
              name="statusi"
              type="select"
              value={form.statusi}
              onChange={handleInputChange}
              options={['E papaguar', 'E paguar', 'E vonuar']}
            />
          </div>

          <Input
            label="Përshkrimi i Situacionit"
            name="pershkrimi"
            type="textarea"
            value={form.pershkrimi}
            onChange={handleInputChange}
            placeholder="Shkruani arsyen e faturimit..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data e Faturimit"
              name="dataFatures"
              type="date"
              value={form.dataFatures}
              onChange={handleInputChange}
              required
              error={errors.dataFatures}
            />

            <Input
              label="Data e Pagesës (nëse është paguar)"
              name="dataPageses"
              type="date"
              value={form.dataPageses}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="px-5">
              Anulo
            </Button>
            <Button type="submit" className="px-5">
              Ruaj
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}

export default Invoices
