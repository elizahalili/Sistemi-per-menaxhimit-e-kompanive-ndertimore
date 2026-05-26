import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Edit2, Trash2, Check, ShieldAlert, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Equipment = () => {
  const { user, hasRole } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ emertimi: '', lloji: '', statusi: 'I Lire', kostojaDitore: '', dataBlerjes: '' })
  const [errors, setErrors] = useState({})
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchEquipment = async () => {
    setLoading(true)
    try {
      const response = await apiService.equipment.getAll({
        search,
        status,
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Gabim gjatë ngarkimit të makinerive.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [search, status, page])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFilter = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.emertimi.trim()) newErrors.emertimi = 'Emërtimi i pajisjes kërkohet.'
    if (!form.lloji.trim()) newErrors.lloji = 'Lloji kërkohet.'
    if (!form.dataBlerjes) newErrors.dataBlerjes = 'Data e blerjes kërkohet.'
    
    if (!form.kostojaDitore || isNaN(form.kostojaDitore) || parseFloat(form.kostojaDitore) < 0) {
      newErrors.kostojaDitore = 'Kostoja ditore duhet të jetë një numër pozitiv.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ emertimi: '', lloji: '', statusi: 'I Lire', kostojaDitore: '', dataBlerjes: new Date().toISOString().split('T')[0] })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (eq) => {
    setSelectedId(eq.id)
    setForm({
      emertimi: eq.emertimi,
      lloji: eq.lloji,
      statusi: eq.statusi || 'I Lire',
      kostojaDitore: eq.kostojaDitore.toString(),
      dataBlerjes: eq.dataBlerjes.split('T')[0]
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      kostojaDitore: parseFloat(form.kostojaDitore)
    }

    try {
      if (selectedId) {
        await apiService.equipment.update(selectedId, payload)
        triggerToast('Pajisja u përditësua me sukses!')
      } else {
        await apiService.equipment.create(payload)
        triggerToast('Pajisja e re u shtua me sukses!')
      }
      setIsModalOpen(false)
      fetchEquipment()
    } catch (err) {
      console.error(err)
      triggerToast('Operacioni dështoi.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë pajisje?')) return

    try {
      await apiService.equipment.delete(id)
      triggerToast('Pajisja u fshi me sukses!')
      fetchEquipment()
    } catch (err) {
      console.error(err)
      triggerToast('Fshirja dështoi.', 'danger')
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

      {/* Options header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko pajisjet sipas emrit ose llojit..."
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
            <option value="">Të gjitha pajisjet</option>
            <option value="I Lire">I Lirë</option>
            <option value="Ne Pune">Në Punë</option>
            <option value="Mirembajtje">Mërembajtje</option>
          </select>

          {hasRole(["Admin", "Manager"]) && (
            <Button
              onClick={openCreateModal}
              icon={<Plus className="w-4 h-4" />}
              className="py-2.5"
            >
              Shto Pajisje
            </Button>
          )}
        </div>
      </div>

      {/* Grid container */}
      <Card title="Pajisjet dhe Makineritë" subtitle={`Makineri të regjistruara: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Pajisja</th>
                <th className="py-4">Kategoria/Lloji</th>
                <th className="py-4">Kostoja Ditore</th>
                <th className="py-4">Data e Blerjes</th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk u gjet asnjë makineri.
                  </td>
                </tr>
              ) : (
                data.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {eq.emertimi}
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{eq.lloji}</td>
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-200 font-mono">{eq.kostojaDitore.toFixed(2)} €/ditë</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{eq.dataBlerjes.split('T')[0]}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${eq.statusi === 'I Lire' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : eq.statusi === 'Ne Pune' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                        {eq.statusi}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(eq)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(eq.id)}
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
        title={selectedId ? 'Përditëso Pajisjen' : 'Shto Pajisje të Re'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emri i Pajisjes"
              name="emertimi"
              value={form.emertimi}
              onChange={handleInputChange}
              required
              error={errors.emertimi}
            />

            <Input
              label="Kategoria / Lloji"
              name="lloji"
              type="select"
              value={form.lloji}
              onChange={handleInputChange}
              required
              options={['Makineri e Rëndë', 'Transport', 'Betonim', 'Vegla dorë', 'Izoluese']}
              error={errors.lloji}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kostoja Ditore (EUR)"
              name="kostojaDitore"
              value={form.kostojaDitore}
              onChange={handleInputChange}
              required
              placeholder="e.g. 150"
              error={errors.kostojaDitore}
            />

            <Input
              label="Statusi"
              name="statusi"
              type="select"
              value={form.statusi}
              onChange={handleInputChange}
              options={['I Lire', 'Ne Pune', 'Mirembajtje']}
            />
          </div>

          <Input
            label="Data e Blerjes"
            name="dataBlerjes"
            type="date"
            value={form.dataBlerjes}
            onChange={handleInputChange}
            required
            error={errors.dataBlerjes}
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

export default Equipment
