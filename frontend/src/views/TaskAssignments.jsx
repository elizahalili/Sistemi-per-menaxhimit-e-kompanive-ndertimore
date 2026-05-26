import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Trash2, Check, ShieldAlert, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TaskAssignments = () => {
  const { user, hasRole } = useAuth()
  const [data, setData] = useState([])
  const [tasks, setTasks] = useState([])
  const [workers, setWorkers] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const [page, setPage] = useState(1)
  const pageSize = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ detyraId: '', punetoriId: '', dataCaktimit: '', oretPunuara: '0' })
  const [errors, setErrors] = useState({})
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const response = await apiService.taskAssignments.getAll({
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Gabim gjatë ngarkimit të caktimit të punëve.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const tRes = await apiService.tasks.getAll({ pageSize: 100 })
      const wRes = await apiService.workers.getAll({ pageSize: 100 })
      setTasks(tRes.data.items || [])
      setWorkers(wRes.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchAssignments()
    fetchDependencies()
  }, [page])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.detyraId) newErrors.detyraId = 'Zgjedhja e detyrës kërkohet.'
    if (!form.punetoriId) newErrors.punetoriId = 'Zgjedhja e punëtorit kërkohet.'
    if (!form.dataCaktimit) newErrors.dataCaktimit = 'Data e caktimit kërkohet.'
    if (isNaN(form.oretPunuara) || parseFloat(form.oretPunuara) < 0) {
      newErrors.oretPunuara = 'Orët e punuara duhet të jenë pozitive.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setForm({ detyraId: '', punetoriId: '', dataCaktimit: new Date().toISOString().split('T')[0], oretPunuara: '0' })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      detyraId: parseInt(form.detyraId),
      punetoriId: parseInt(form.punetoriId),
      dataCaktimit: form.dataCaktimit,
      oretPunuara: parseFloat(form.oretPunuara)
    }

    try {
      await apiService.taskAssignments.create(payload)
      triggerToast('Punëtori u caktua me sukses në detyrë!')
      setIsModalOpen(false)
      fetchAssignments()
    } catch (err) {
      console.error(err)
      triggerToast('Ndodhi një gabim.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A dëshironi ta fshini këtë caktim?')) return
    try {
      await apiService.taskAssignments.delete(id)
      triggerToast('Caktimi i detyrës u hoq!')
      fetchAssignments()
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
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-sans leading-none">Caktimi i Detyrave</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-1">Alokimi i stafit ndërtues dhe gjurmimi i orëve të punës</p>
        </div>
        
        {hasRole(["Admin", "Manager"]) && (
          <Button
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
            className="py-2.5"
          >
            Cakto Punëtor
          </Button>
        )}
      </div>

      <Card title="Stafi i Alokuar në Detyra" subtitle={`Caktime aktive: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Punëtori</th>
                <th className="py-4">Detyra e Caktuar</th>
                <th className="py-4">Data e Alokimit</th>
                <th className="py-4 text-right">Orë të punuara</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6 font-bold">Largo</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk ka asnjë punëtor të alokuar në detyra.
                  </td>
                </tr>
              ) : (
                data.map((ass) => (
                  <tr key={ass.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {ass.workerName}
                      </div>
                    </td>
                    <td className="py-4 text-slate-650 dark:text-slate-300 font-semibold">{ass.taskName}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{ass.dataCaktimit.split('T')[0]}</td>
                    <td className="py-4 text-right font-black font-mono text-slate-700 dark:text-slate-350">{ass.oretPunuara} orë</td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center">
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(ass.id)}
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
        title="Aloko Punëtor në Detyrë"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Punëtori"
              name="punetoriId"
              type="select"
              value={form.punetoriId}
              onChange={handleInputChange}
              required
              options={workers.map(w => ({ value: w.id.toString(), label: `${w.emri} ${w.mbiemri} (${w.profesioni})` }))}
              error={errors.punetoriId}
            />

            <Input
              label="Detyra e Caktuar"
              name="detyraId"
              type="select"
              value={form.detyraId}
              onChange={handleInputChange}
              required
              options={tasks.map(t => ({ value: t.id.toString(), label: t.emertimi }))}
              error={errors.detyraId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data e Alokimit"
              name="dataCaktimit"
              type="date"
              value={form.dataCaktimit}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Orët e Punuara (Fillestare)"
              name="oretPunuara"
              value={form.oretPunuara}
              onChange={handleInputChange}
              placeholder="e.g. 8"
              error={errors.oretPunuara}
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

export default TaskAssignments
