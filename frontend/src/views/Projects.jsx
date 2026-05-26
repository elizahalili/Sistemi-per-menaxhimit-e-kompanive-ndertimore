import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ShieldAlert, Check, Building } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Projects = () => {
  const { user, hasRole } = useAuth()
  
  // Data lists
  const [data, setData] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Query variables
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('emertimi')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ emertimi: '', pershkrimi: '', klientiId: '', lokacioni: '', buxheti: '', dataFillimit: '', dataPerfundimit: '', statusi: 'Planifikim', progresiTotal: 0 })
  const [errors, setErrors] = useState({})
  
  // Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await apiService.projects.getAll({
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
      triggerToast('Gabim gjatë ngarkimit të projekteve.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  // Fetch clients for select dropdown
  const fetchClients = async () => {
    try {
      const response = await apiService.clients.getAll({ pageSize: 100 })
      setClients(response.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [search, status, sortBy, sortOrder, page])

  useEffect(() => {
    fetchClients()
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
    if (!form.emertimi.trim()) newErrors.emertimi = 'Titulli i projektit kërkohet.'
    if (!form.klientiId) newErrors.klientiId = 'Zgjedhja e klientit kërkohet.'
    if (!form.dataFillimit) newErrors.dataFillimit = 'Data e fillimit kërkohet.'
    
    if (form.buxheti && (isNaN(form.buxheti) || parseFloat(form.buxheti) < 0)) {
      newErrors.buxheti = 'Buxheti duhet të jetë një numër pozitiv.'
    }
    
    if (form.dataFillimit && form.dataPerfundimit) {
      const start = new Date(form.dataFillimit)
      const end = new Date(form.dataPerfundimit)
      if (end < start) {
        newErrors.dataPerfundimit = 'Data e përfundimit duhet të jetë pas datës së fillimit.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ emertimi: '', pershkrimi: '', klientiId: '', lokacioni: '', buxheti: '', dataFillimit: '', dataPerfundimit: '', statusi: 'Planifikim', progresiTotal: 0 })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (proj) => {
    setSelectedId(proj.id)
    setForm({
      emertimi: proj.emertimi,
      pershkrimi: proj.pershkrimi || '',
      klientiId: proj.klientiId.toString(),
      lokacioni: proj.lokacioni || '',
      buxheti: proj.buxheti.toString(),
      dataFillimit: proj.dataFillimit.split('T')[0],
      dataPerfundimit: proj.dataPerfundimit ? proj.dataPerfundimit.split('T')[0] : '',
      statusi: proj.statusi || 'Planifikim',
      progresiTotal: proj.progresiTotal
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      klientiId: parseInt(form.klientiId),
      buxheti: parseFloat(form.buxheti || 0),
      progresiTotal: parseFloat(form.progresiTotal || 0)
    }

    try {
      if (selectedId) {
        await apiService.projects.update(selectedId, payload)
        triggerToast('Projekti u përditësua me sukses!')
      } else {
        await apiService.projects.create(payload)
        triggerToast('Projekti i ri u krijua me sukses!')
      }
      setIsModalOpen(false)
      fetchProjects()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Operacioni dështoi.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë projekt? Kjo do të fshijë edhe fazat dhe detyrat e lidhura.')) return

    try {
      await apiService.projects.delete(id)
      triggerToast('Projekti u fshi me sukses!')
      fetchProjects()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Fshirja dështoi.', 'danger')
    }
  }

  // Helper formatting
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

      {/* Action Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko projektet sipas emërtimit ose lokacionit..."
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
            <option value="Planifikim">Planifikim</option>
            <option value="Ne Progres">Ne Progres</option>
            <option value="I Pezulluar">I Pezulluar</option>
            <option value="I Perfunduar">I Perfunduar</option>
          </select>

          {hasRole(["Admin", "Manager"]) && (
            <Button
              onClick={openCreateModal}
              icon={<Plus className="w-4 h-4" />}
              className="py-2.5"
            >
              Shto Projekt
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      <Card title="Projektet Aktive" subtitle={`Gjithsej projekte ndërtimi: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('emertimi')}>
                  <div className="flex items-center gap-1.5">Emërtimi <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Klienti</th>
                <th className="py-4">Lokacioni</th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('buxheti')}>
                  <div className="flex items-center gap-1.5">Buxheti <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('progresiTotal')}>
                  <div className="flex items-center gap-1.5">Progresi <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk u gjet asnjë projekt ndërtimi.
                  </td>
                </tr>
              ) : (
                data.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white">{proj.emertimi}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Filloi: {proj.dataFillimit.split('T')[0]}</span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{proj.clientName || 'Klient i panjohur'}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{proj.lokacioni || 'Nuk ka'}</td>
                    <td className="py-4 text-slate-700 dark:text-slate-200 font-bold font-mono">{formatCurrency(proj.buxheti)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-150 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full"
                            style={{ width: `${proj.progresiTotal}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs">{proj.progresiTotal}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${proj.statusi === 'I Perfunduar' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : proj.statusi === 'Ne Progres' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : proj.statusi === 'I Pezulluar' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {proj.statusi}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(proj)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(proj.id)}
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

      {/* Form Dialog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedId ? 'Përditëso Projektin' : 'Krijo Projekt të Ri'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Emërtimi i Projektit"
              name="emertimi"
              value={form.emertimi}
              onChange={handleInputChange}
              required
              error={errors.emertimi}
            />

            <Input
              label="Klienti"
              name="klientiId"
              type="select"
              value={form.klientiId}
              onChange={handleInputChange}
              placeholder="Zgjidh klientin nga lista..."
              required
              options={clients.map(c => ({ value: c.id.toString(), label: `${c.emri} ${c.mbiemriKompania}` }))}
              error={errors.klientiId}
            />
          </div>

          <Input
            label="Përshkrimi i Punimeve"
            name="pershkrimi"
            type="textarea"
            value={form.pershkrimi}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Lokacioni"
              name="lokacioni"
              value={form.lokacioni}
              onChange={handleInputChange}
            />

            <Input
              label="Buxheti i Projektit (EUR)"
              name="buxheti"
              value={form.buxheti}
              onChange={handleInputChange}
              placeholder="e.g. 500000"
              error={errors.buxheti}
            />

            <Input
              label="Progresi Total (%)"
              name="progresiTotal"
              type="number"
              value={form.progresiTotal}
              onChange={handleInputChange}
              placeholder="e.g. 15"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Data e Fillimit"
              name="dataFillimit"
              type="date"
              value={form.dataFillimit}
              onChange={handleInputChange}
              required
              error={errors.dataFillimit}
            />

            <Input
              label="Data e Përfundimit"
              name="dataPerfundimit"
              type="date"
              value={form.dataPerfundimit}
              onChange={handleInputChange}
              error={errors.dataPerfundimit}
            />

            <Input
              label="Statusi"
              name="statusi"
              type="select"
              value={form.statusi}
              onChange={handleInputChange}
              options={['Planifikim', 'Ne Progres', 'I Pezulluar', 'I Perfunduar']}
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

export default Projects
