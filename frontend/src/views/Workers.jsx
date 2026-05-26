import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ShieldAlert, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Workers = () => {
  const { user, hasRole } = useAuth()
  
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Query variables
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('emri')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Form Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ emri: '', mbiemri: '', email: '', telefoni: '', profesioni: '', pagaDitore: '', dataPunesimit: '', statusi: 'Aktiv' })
  const [errors, setErrors] = useState({})
  
  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchWorkers = async () => {
    setLoading(true)
    try {
      const response = await apiService.workers.getAll({
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
      triggerToast('Gabim gjatë ngarkimit të punëtorëve.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [search, status, sortBy, sortOrder, page])

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
    if (!form.emri.trim()) newErrors.emri = 'Emri kërkohet.'
    if (!form.mbiemri.trim()) newErrors.mbiemri = 'Mbiemri kërkohet.'
    if (!form.profesioni.trim()) newErrors.profesioni = 'Profesioni kërkohet.'
    if (!form.dataPunesimit) newErrors.dataPunesimit = 'Data e punësimit kërkohet.'
    
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Emaili nuk është i vlefshëm.'
    
    if (!form.pagaDitore || isNaN(form.pagaDitore) || parseFloat(form.pagaDitore) <= 0) {
      newErrors.pagaDitore = 'Paga ditore duhet të jetë një numër pozitiv.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ emri: '', mbiemri: '', email: '', telefoni: '', profesioni: '', pagaDitore: '', dataPunesimit: new Date().toISOString().split('T')[0], statusi: 'Aktiv' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (worker) => {
    setSelectedId(worker.id)
    setForm({
      emri: worker.emri,
      mbiemri: worker.mbiemri,
      email: worker.email || '',
      telefoni: worker.telefoni || '',
      profesioni: worker.profesioni,
      pagaDitore: worker.pagaDitore.toString(),
      dataPunesimit: worker.dataPunesimit.split('T')[0],
      statusi: worker.statusi || 'Aktiv'
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      pagaDitore: parseFloat(form.pagaDitore)
    }

    try {
      if (selectedId) {
        await apiService.workers.update(selectedId, payload)
        triggerToast('Punëtori u përditësua me sukses!')
      } else {
        await apiService.workers.create(payload)
        triggerToast('Punëtori i ri u shtua me sukses!')
      }
      setIsModalOpen(false)
      fetchWorkers()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Operacioni dështoi.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë punëtor? Kjo do të heqë edhe caktimet e tij në detyra.')) return

    try {
      await apiService.workers.delete(id)
      triggerToast('Punëtori u fshi me sukses!')
      fetchWorkers()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Ndodhi një gabim.', 'danger')
    }
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

      {/* Filter Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko punëtorët sipas emrit ose profesionit..."
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
            <option value="">Të gjitha statuset</option>
            <option value="Aktiv">Aktiv</option>
            <option value="Pushim">Pushim</option>
            <option value="Joaktiv">Joaktiv</option>
          </select>

          {hasRole(["Admin", "Manager"]) && (
            <Button
              onClick={openCreateModal}
              icon={<Plus className="w-4 h-4" />}
              className="py-2.5"
            >
              Shto Punëtor
            </Button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <Card title="Stafi i Kompanisë" subtitle={`Punëtorë të regjistruar: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('emri')}>
                  <div className="flex items-center gap-1.5">Punëtori <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Profesioni</th>
                <th className="py-4">Emaili</th>
                <th className="py-4">Telefoni</th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('pagaDitore')}>
                  <div className="flex items-center gap-1.5">Paga Ditore <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk u gjet asnjë punëtor.
                  </td>
                </tr>
              ) : (
                data.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white">{worker.emri} {worker.mbiemri}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Punesuar: {worker.dataPunesimit.split('T')[0]}</span>
                    </td>
                    <td className="py-4 text-slate-650 dark:text-slate-300 font-bold">{worker.profesioni}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{worker.email || 'Nuk ka'}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{worker.telefoni || 'Nuk ka'}</td>
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-200 font-mono">{worker.pagaDitore.toFixed(2)} €/ditë</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${worker.statusi === 'Aktiv' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : worker.statusi === 'Pushim' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {worker.statusi}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(worker)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(worker.id)}
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
        title={selectedId ? 'Përditëso Punëtorin' : 'Shto Punëtor të Ri'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emri"
              name="emri"
              value={form.emri}
              onChange={handleInputChange}
              required
              error={errors.emri}
            />
            <Input
              label="Mbiemri"
              name="mbiemri"
              value={form.mbiemri}
              onChange={handleInputChange}
              required
              error={errors.mbiemri}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              error={errors.email}
            />
            <Input
              label="Telefoni"
              name="telefoni"
              value={form.telefoni}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Profesioni"
              name="profesioni"
              value={form.profesioni}
              onChange={handleInputChange}
              required
              placeholder="e.g. Inxhinier"
              error={errors.profesioni}
            />
            <Input
              label="Paga Ditore (EUR)"
              name="pagaDitore"
              value={form.pagaDitore}
              onChange={handleInputChange}
              required
              placeholder="e.g. 45"
              error={errors.pagaDitore}
            />
            <Input
              label="Statusi"
              name="statusi"
              type="select"
              value={form.statusi}
              onChange={handleInputChange}
              options={['Aktiv', 'Pushim', 'Joaktiv']}
            />
          </div>

          <Input
            label="Data e Punësimit"
            name="dataPunesimit"
            type="date"
            value={form.dataPunesimit}
            onChange={handleInputChange}
            required
            error={errors.dataPunesimit}
          />

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

export default Workers
