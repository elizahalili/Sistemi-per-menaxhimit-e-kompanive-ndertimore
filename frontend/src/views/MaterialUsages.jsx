import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Trash2, ArrowUpDown, ShieldAlert, Check, Hammer } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MaterialUsages = () => {
  const { user, hasRole } = useAuth()
  
  // Lists
  const [data, setData] = useState([])
  const [projects, setProjects] = useState([])
  const [allPhases, setAllPhases] = useState([])
  const [filteredPhases, setFilteredPhases] = useState([]) // Dynamically loaded based on project choice
  const [materials, setMaterials] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Query variables
  const [sortBy, setSortBy] = useState('dataPerdorimit')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ projektiId: '', fazaId: '', materialiId: '', sasia: '', dataPerdorimit: '' })
  const [errors, setErrors] = useState({})
  
  // Custom Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchUsages = async () => {
    setLoading(true)
    try {
      const response = await apiService.materialUsages.getAll({
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Gabim gjatë ngarkimit të përdorimit të materialeve.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const pRes = await apiService.projects.getAll({ pageSize: 100 })
      const phRes = await apiService.projectPhases.getAll({ pageSize: 100 })
      const mRes = await apiService.materials.getAll({ pageSize: 100 })
      
      setProjects(pRes.data.items || [])
      setAllPhases(phRes.data.items || [])
      setMaterials(mRes.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUsages()
  }, [page])

  useEffect(() => {
    fetchDependencies()
  }, [])

  // Dynamic Relational Filtering trigger
  useEffect(() => {
    if (form.projektiId) {
      const filtered = allPhases.filter(ph => ph.projektiId === parseInt(form.projektiId))
      setFilteredPhases(filtered)
      // Reset fazaId if previous selection is not in the filtered list
      if (!filtered.some(f => f.id.toString() === form.fazaId)) {
        setForm(prev => ({ ...prev, fazaId: '' }))
      }
    } else {
      setFilteredPhases([])
      setForm(prev => ({ ...prev, fazaId: '' }))
    }
  }, [form.projektiId, allPhases])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.projektiId) newErrors.projektiId = 'Zgjedhja e projektit kërkohet.'
    if (!form.fazaId) newErrors.fazaId = 'Zgjedhja e fazës kërkohet.'
    if (!form.materialiId) newErrors.materialiId = 'Zgjedhja e materialit kërkohet.'
    if (!form.dataPerdorimit) newErrors.dataPerdorimit = 'Data e përdorimit kërkohet.'
    
    if (!form.sasia || isNaN(form.sasia) || parseFloat(form.sasia) <= 0) {
      newErrors.sasia = 'Sasia e konsumuar duhet të jetë një numër pozitiv.'
    } else {
      const selectedMat = materials.find(m => m.id === parseInt(form.materialiId))
      if (selectedMat && parseFloat(form.sasia) > selectedMat.sasiaStokut) {
        newErrors.sasia = `Stoku nuk mjafton. Mbetur vetëm: ${selectedMat.sasiaStokut} ${selectedMat.njesiaMatese}.`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setForm({ projektiId: '', fazaId: '', materialiId: '', sasia: '', dataPerdorimit: new Date().toISOString().split('T')[0] })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      projektiId: parseInt(form.projektiId),
      fazaId: parseInt(form.fazaId),
      materialiId: parseInt(form.materialiId),
      sasia: parseFloat(form.sasia),
      dataPerdorimit: form.dataPerdorimit
    }

    try {
      await apiService.materialUsages.create(payload)
      triggerToast('Përdorimi i materialit u regjistrua dhe stoku u zbrit!')
      setIsModalOpen(false)
      fetchUsages()
      // Refresh materials stock to reflect reduction in forms
      fetchDependencies()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Ndodhi një gabim.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë proces? Kjo do të kthejë sasinë e materialit mbrapsht në stok.')) return

    try {
      await apiService.materialUsages.delete(id)
      triggerToast('Të dhënat u fshinë dhe stoku u rikthye!')
      fetchUsages()
      fetchDependencies()
    } catch (err) {
      console.error(err)
      triggerToast('Operacioni dështoi.', 'danger')
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

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider font-sans leading-none">Veprimet e Stokut</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-1">Gjurmimi i materialeve të konsumuara sipas fazave ndërtimore</p>
        </div>
        
        {hasRole(["Admin", "Manager"]) && (
          <Button
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
            className="py-2.5"
          >
            Regjistro Përdorim
          </Button>
        )}
      </div>

      {/* List Table */}
      <Card title="Gjurmimi i Konsumit të Materialeve" subtitle={`Konsumime të regjistruara: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Projekti</th>
                <th className="py-4">Faza</th>
                <th className="py-4">Materiali i përdorur</th>
                <th className="py-4 text-right">Sasia e konsumuar</th>
                <th className="py-4 text-right">Data e përdorimit</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Fshi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk ka të dhëna për konsumin e materialeve.
                  </td>
                </tr>
              ) : (
                data.map((usage) => (
                  <tr key={usage.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {usage.projectName}
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{usage.phaseName}</td>
                    <td className="py-4 text-slate-850 dark:text-slate-200 font-bold">{usage.materialName}</td>
                    <td className="py-4 text-right text-red-500 dark:text-red-400 font-black font-mono">-{usage.sasia}</td>
                    <td className="py-4 text-right text-slate-500 dark:text-slate-400 font-mono">{usage.dataPerdorimit.split('T')[0]}</td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center">
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(usage.id)}
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
        title="Regjistro Konsumim të Stokut"
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
              label="Faza Ndërtimore"
              name="fazaId"
              type="select"
              value={form.fazaId}
              onChange={handleInputChange}
              required
              placeholder={form.projektiId ? "Zgjidh fazën..." : "Zgjidh një projekt fillimisht..."}
              options={filteredPhases.map(ph => ({ value: ph.id.toString(), label: ph.emertimi }))}
              error={errors.fazaId}
              disabled={!form.projektiId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Materiali i konsumuar"
              name="materialiId"
              type="select"
              value={form.materialiId}
              onChange={handleInputChange}
              required
              options={materials.map(m => ({ value: m.id.toString(), label: `${m.emertimi} (Në stok: ${m.sasiaStokut} ${m.njesiaMatese})` }))}
              error={errors.materialiId}
            />

            <Input
              label="Sasia e përdorur"
              name="sasia"
              value={form.sasia}
              onChange={handleInputChange}
              required
              placeholder="e.g. 50"
              error={errors.sasia}
            />
          </div>

          <Input
            label="Data e Konsumimit"
            name="dataPerdorimit"
            type="date"
            value={form.dataPerdorimit}
            onChange={handleInputChange}
            required
            error={errors.dataPerdorimit}
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

export default MaterialUsages
