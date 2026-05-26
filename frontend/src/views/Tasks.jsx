import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Edit2, Trash2, Check, ShieldAlert, CheckSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Tasks = () => {
  const { user, hasRole } = useAuth()
  const [data, setData] = useState([])
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const [page, setPage] = useState(1)
  const pageSize = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ fazaId: '', emertimi: '', pershkrimi: '', prioriteti: 'Mesatar', dataFillimit: '', dataPerfundimit: '', statusi: 'Pa filluar' })
  const [errors, setErrors] = useState({})
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await apiService.tasks.getAll({
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

  const fetchPhases = async () => {
    try {
      const response = await apiService.projectPhases.getAll({ pageSize: 100 })
      setPhases(response.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchPhases()
  }, [page])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.fazaId) newErrors.fazaId = 'Zgjedhja e fazës kërkohet.'
    if (!form.emertimi.trim()) newErrors.emertimi = 'Emri i detyrës kërkohet.'
    if (!form.dataFillimit) newErrors.dataFillimit = 'Data e fillimit kërkohet.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ fazaId: '', emertimi: '', pershkrimi: '', prioriteti: 'Mesatar', dataFillimit: new Date().toISOString().split('T')[0], dataPerfundimit: '', statusi: 'Pa filluar' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (task) => {
    setSelectedId(task.id)
    setForm({
      fazaId: task.fazaId.toString(),
      emertimi: task.emertimi,
      pershkrimi: task.pershkrimi || '',
      prioriteti: task.prioriteti || 'Mesatar',
      dataFillimit: task.dataFillimit.split('T')[0],
      dataPerfundimit: task.dataPerfundimit ? task.dataPerfundimit.split('T')[0] : '',
      statusi: task.statusi || 'Pa filluar'
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      fazaId: parseInt(form.fazaId)
    }

    try {
      if (selectedId) {
        await apiService.tasks.update(selectedId, payload)
        triggerToast('Detyra u përditësua me sukses!')
      } else {
        await apiService.tasks.create(payload)
        triggerToast('Detyra e re u regjistrua!')
      }
      setIsModalOpen(false)
      fetchTasks()
    } catch (err) {
      console.error(err)
      triggerToast('Ndodhi një gabim.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt?')) return
    try {
      await apiService.tasks.delete(id)
      triggerToast('Detyra u fshi!')
      fetchTasks()
    } catch (err) {
      console.error(err)
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
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-sans leading-none">Detyrat e Fazave</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-1">Delegimi i punëve operacionale ndërtimore</p>
        </div>
        
        {hasRole(["Admin", "Manager"]) && (
          <Button
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
            className="py-2.5"
          >
            Shto Detyrë
          </Button>
        )}
      </div>

      <Card title="Detyrat e Projekteve" subtitle={`Detyra totale: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Detyra</th>
                <th className="py-4">Faza</th>
                <th className="py-4">Prioriteti</th>
                <th className="py-4">Përfundon Më</th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk ka detyra të lëshuara.
                  </td>
                </tr>
              ) : (
                data.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {task.emertimi}
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{task.pershkrimi || 'Pa përshkrim'}</span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{task.phaseName}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${task.prioriteti === 'I larte' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : task.prioriteti === 'Mesatar' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {task.prioriteti}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{task.dataPerfundimit ? task.dataPerfundimit.split('T')[0] : 'në vazhdim'}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${task.statusi === 'E perfunduar' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : task.statusi === 'Ne Progres' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {task.statusi}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(task)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(task.id)}
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
        title={selectedId ? 'Përditëso Detyrën' : 'Shto Detyrë të Re'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Faza Ndërtimore"
              name="fazaId"
              type="select"
              value={form.fazaId}
              onChange={handleInputChange}
              required
              options={phases.map(ph => ({ value: ph.id.toString(), label: `${ph.projectName} - ${ph.emertimi}` }))}
              error={errors.fazaId}
            />

            <Input
              label="Emri i Detyrës"
              name="emertimi"
              value={form.emertimi}
              onChange={handleInputChange}
              required
              error={errors.emertimi}
            />
          </div>

          <Input
            label="Përshkrimi i Detyrës"
            name="pershkrimi"
            type="textarea"
            value={form.pershkrimi}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prioriteti"
              name="prioriteti"
              type="select"
              value={form.prioriteti}
              onChange={handleInputChange}
              options={['I ulet', 'Mesatar', 'I larte']}
            />

            <Input
              label="Statusi"
              name="statusi"
              type="select"
              value={form.statusi}
              onChange={handleInputChange}
              options={['Pa filluar', 'Ne Progres', 'E bllokuar', 'E perfunduar']}
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

export default Tasks
