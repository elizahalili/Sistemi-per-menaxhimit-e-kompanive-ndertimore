import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Edit2, Trash2, Check, ShieldAlert, Layers } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Phases = () => {
  const { user, hasRole } = useAuth()
  const [data, setData] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const [page, setPage] = useState(1)
  const pageSize = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ projektiId: '', emertimi: '', pershkrimi: '', rendi: '1', dataFillimit: '', dataPerfundimit: '', statusi: 'E papanifikuar', perqindjaKompletimit: '0' })
  const [errors, setErrors] = useState({})
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchPhases = async () => {
    setLoading(true)
    try {
      const response = await apiService.projectPhases.getAll({
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Ndodhi një gabim.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await apiService.projects.getAll({ pageSize: 100 })
      setProjects(response.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPhases()
    fetchProjects()
  }, [page])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.projektiId) newErrors.projektiId = 'Zgjedhja e projektit kërkohet.'
    if (!form.emertimi.trim()) newErrors.emertimi = 'Emri i fazës kërkohet.'
    if (!form.dataFillimit) newErrors.dataFillimit = 'Data e fillimit kërkohet.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ projektiId: '', emertimi: '', pershkrimi: '', rendi: '1', dataFillimit: new Date().toISOString().split('T')[0], dataPerfundimit: '', statusi: 'E paplanifikuar', perqindjaKompletimit: '0' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (ph) => {
    setSelectedId(ph.id)
    setForm({
      projektiId: ph.projektiId.toString(),
      emertimi: ph.emertimi,
      pershkrimi: ph.pershkrimi || '',
      rendi: ph.rendi.toString(),
      dataFillimit: ph.dataFillimit.split('T')[0],
      dataPerfundimit: ph.dataPerfundimit ? ph.dataPerfundimit.split('T')[0] : '',
      statusi: ph.statusi || 'E paplanifikuar',
      perqindjaKompletimit: ph.perqindjaKompletimit.toString()
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
      rendi: parseInt(form.rendi),
      perqindjaKompletimit: parseFloat(form.perqindjaKompletimit)
    }

    try {
      if (selectedId) {
        await apiService.projectPhases.update(selectedId, payload)
        triggerToast('Faza u përditësua me sukses!')
      } else {
        await apiService.projectPhases.create(payload)
        triggerToast('Faza e re u krijua!')
      }
      setIsModalOpen(false)
      fetchPhases()
    } catch (err) {
      console.error(err)
      triggerToast('Ndodhi një gabim.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Dëshironi ta fshini këtë fazë?')) return
    try {
      await apiService.projectPhases.delete(id)
      triggerToast('Faza u fshi!')
      fetchPhases()
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-sans leading-none">Fazat e Projekteve</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-1">Ecuria sipas etapave kryesore të ndërtimit</p>
        </div>
        
        {hasRole(["Admin", "Manager"]) && (
          <Button
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
            className="py-2.5"
          >
            Shto Fazë
          </Button>
        )}
      </div>

      <Card title="Fazat e Projekteve" subtitle={`Faza të hapura: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Faza / Projekti</th>
                <th className="py-4">Rendi</th>
                <th className="py-4">Mbyllja Më</th>
                <th className="py-4">Ecuria</th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk ka të dhëna për fazat e projekteve.
                  </td>
                </tr>
              ) : (
                data.map((ph) => (
                  <tr key={ph.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {ph.emertimi}
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{ph.projectName}</span>
                    </td>
                    <td className="py-4 text-slate-650 dark:text-slate-350 font-black font-mono">#{ph.rendi}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{ph.dataPerfundimit ? ph.dataPerfundimit.split('T')[0] : 'në vazhdim'}</td>
                    <td className="py-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{ph.perqindjaKompletimit}%</span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${ph.statusi === 'E perfunduar' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : ph.statusi === 'Ne Progres' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {ph.statusi}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(ph)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(ph.id)}
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
        title={selectedId ? 'Përditëso Fazën' : 'Shto Fazë të Re'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Projekti"
              name="projektiId"
              type="select"
              value={form.projektiId}
              onChange={handleInputChange}
              required
              options={projects.map(p => ({ value: p.id.toString(), label: p.emertimi }))}
              error={errors.projektiId}
            />

            <Input
              label="Emërtimi i Fazës"
              name="emertimi"
              value={form.emertimi}
              onChange={handleInputChange}
              required
              error={errors.emertimi}
            />
          </div>

          <Input
            label="Përshkrimi"
            name="pershkrimi"
            type="textarea"
            value={form.pershkrimi}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Rendi (Rëndësia)"
              name="rendi"
              type="number"
              value={form.rendi}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Kompletimi (%)"
              name="perqindjaKompletimit"
              type="number"
              value={form.perqindjaKompletimit}
              onChange={handleInputChange}
            />

            <Input
              label="Statusi"
              name="statusi"
              type="select"
              value={form.statusi}
              onChange={handleInputChange}
              options={['E paplanifikuar', 'Ne Progres', 'E perfunduar']}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data e Fillimit"
              name="dataFillimit"
              type="date"
              value={form.dataFillimit}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Data e Përfundimit"
              name="dataPerfundimit"
              type="date"
              value={form.dataPerfundimit}
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

export default Phases
