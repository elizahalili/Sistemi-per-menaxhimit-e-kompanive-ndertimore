import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ShieldAlert, Check, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Materials = () => {
  const { user, hasRole } = useAuth()
  
  // Data lists
  const [data, setData] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Query variables
  const [search, setSearch] = useState('')
  const [kategoria, setKategoria] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [sortBy, setSortBy] = useState('emertimi')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // Form modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ emertimi: '', njesiaMatese: 'Cope', cmimiNjesi: '', furnitoriId: '', sasiaStokut: '', kategoria: '' })
  const [errors, setErrors] = useState({})
  
  // Notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const response = await apiService.materials.getAll({
        search,
        kategoria,
        lowStock,
        sortBy,
        sortOrder,
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Gabim gjatë ngarkimit të materialeve.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.suppliers.getAll({ pageSize: 100 })
      setSuppliers(response.data.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [search, kategoria, lowStock, sortBy, sortOrder, page])

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleFilter = (e) => {
    setKategoria(e.target.value)
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
    if (!form.emertimi.trim()) newErrors.emertimi = 'Emërtimi i materialit kërkohet.'
    if (!form.njesiaMatese.trim()) newErrors.njesiaMatese = 'Njësia matëse kërkohet.'
    if (!form.furnitoriId) newErrors.furnitoriId = 'Zgjedhja e furnitorit kërkohet.'
    
    if (!form.cmimiNjesi || isNaN(form.cmimiNjesi) || parseFloat(form.cmimiNjesi) < 0) {
      newErrors.cmimiNjesi = 'Çmimi për njësi duhet të jetë një numër pozitiv.'
    }
    
    if (!form.sasiaStokut || isNaN(form.sasiaStokut) || parseFloat(form.sasiaStokut) < 0) {
      newErrors.sasiaStokut = 'Sasia e stokut duhet të jetë një numër pozitiv.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ emertimi: '', njesiaMatese: 'Cope', cmimiNjesi: '', furnitoriId: '', sasiaStokut: '', kategoria: '' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (mat) => {
    setSelectedId(mat.id)
    setForm({
      emertimi: mat.emertimi,
      njesiaMatese: mat.njesiaMatese,
      cmimiNjesi: mat.cmimiNjesi.toString(),
      furnitoriId: mat.furnitoriId.toString(),
      sasiaStokut: mat.sasiaStokut.toString(),
      kategoria: mat.kategoria || ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      furnitoriId: parseInt(form.furnitoriId),
      cmimiNjesi: parseFloat(form.cmimiNjesi),
      sasiaStokut: parseFloat(form.sasiaStokut)
    }

    try {
      if (selectedId) {
        await apiService.materials.update(selectedId, payload)
        triggerToast('Materiali u përditësua me sukses!')
      } else {
        await apiService.materials.create(payload)
        triggerToast('Materiali i ri u shtua në stok!')
      }
      setIsModalOpen(false)
      fetchMaterials()
    } catch (err) {
      console.error(err)
      triggerToast('Ndodhi një gabim gjatë ruajtjes.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë material nga regjistri?')) return

    try {
      await apiService.materials.delete(id)
      triggerToast('Materiali u fshi me sukses!')
      fetchMaterials()
    } catch (err) {
      console.error(err)
      triggerToast(err.response?.data?.message || 'Fshirja dështoi.', 'danger')
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

      {/* Filter Options Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko stoku sipas emrit ose kategorisë..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white"
          />
        </div>
        
        <div className="flex items-center gap-3 justify-end flex-wrap sm:flex-nowrap">
          
          {/* Low Stock Filter Switch Button */}
          <button
            onClick={() => setLowStock(!lowStock)}
            className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition-all duration-200 active:scale-[0.98] ${lowStock ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Stoku Kritik {lowStock ? '(Aktiv)' : ''}
          </button>

          <select
            value={kategoria}
            onChange={handleFilter}
            className="px-4 py-2.5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 text-sm font-semibold"
          >
            <option value="">Të gjitha kategoritë</option>
            <option value="Çimento">Çimento</option>
            <option value="Metale">Metale</option>
            <option value="Zidari">Zidari</option>
            <option value="Vegla pune">Vegla pune</option>
          </select>

          {hasRole(["Admin", "Manager"]) && (
            <Button
              onClick={openCreateModal}
              icon={<Plus className="w-4 h-4" />}
              className="py-2.5"
            >
              Shto Material
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Card */}
      <Card title="Inventari dhe Stoku" subtitle={`Lloje materialesh të regjistruara: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('emertimi')}>
                  <div className="flex items-center gap-1.5">Emërtimi <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Kategoria</th>
                <th className="py-4">Furnitori</th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('cmimiNjesi')}>
                  <div className="flex items-center gap-1.5">Çmimi për Njësi <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4 cursor-pointer hover:text-slate-800 dark:hover:text-white" onClick={() => toggleSort('sasiaStokut')}>
                  <div className="flex items-center gap-1.5">Sasia në Stok <ArrowUpDown className="w-3.5 h-3.5" /></div>
                </th>
                <th className="py-4">Statusi</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk u gjet asnjë material në stok.
                  </td>
                </tr>
              ) : (
                data.map((mat) => {
                  const isLow = parseFloat(mat.sasiaStokut) <= 20
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="py-4 pl-6 font-bold text-slate-850 dark:text-white">{mat.emertimi}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 font-semibold">{mat.kategoria || 'Pa kategori'}</td>
                      <td className="py-4 text-slate-650 dark:text-slate-350">{mat.supplierName}</td>
                      <td className="py-4 font-bold text-slate-800 dark:text-slate-200 font-mono">{mat.cmimiNjesi.toFixed(2)} € / {mat.njesiaMatese}</td>
                      <td className={`py-4 font-black font-mono ${isLow ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {mat.sasiaStokut} {mat.njesiaMatese}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isLow ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 animate-pulse' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                          {isLow ? 'Kritik (i ulët)' : 'Në rregull'}
                        </span>
                      </td>
                      
                      {hasRole(["Admin", "Manager"]) && (
                        <td className="py-4 text-center pr-6">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="icon"
                              onClick={() => openEditModal(mat)}
                              icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                            />
                            {hasRole(["Admin"]) && (
                              <Button
                                variant="icon"
                                onClick={() => handleDelete(mat.id)}
                                icon={<Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />}
                              />
                            )}
                          </div>
                        </td>
                      )}

                    </tr>
                  )
                })
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
        title={selectedId ? 'Përditëso Stokun' : 'Shto Material të Ri'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emërtimi i Materialit"
              name="emertimi"
              value={form.emertimi}
              onChange={handleInputChange}
              required
              error={errors.emertimi}
            />

            <Input
              label="Furnitori"
              name="furnitoriId"
              type="select"
              value={form.furnitoriId}
              onChange={handleInputChange}
              placeholder="Zgjidh furnitorin nga lista..."
              required
              options={suppliers.map(s => ({ value: s.id.toString(), label: s.emertimi }))}
              error={errors.furnitoriId}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kategoria e Materialit"
              name="kategoria"
              type="select"
              value={form.kategoria}
              onChange={handleInputChange}
              options={['Çimento', 'Metale', 'Zidari', 'Vegla pune', 'Izolim', 'Qeramikë']}
              error={errors.kategoria}
            />

            <Input
              label="Njësia Matëse"
              name="njesiaMatese"
              value={form.njesiaMatese}
              onChange={handleInputChange}
              required
              placeholder="e.g. Thes 25kg, Ton, Cope, m3"
              error={errors.njesiaMatese}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Çmimi për Njësi (EUR)"
              name="cmimiNjesi"
              value={form.cmimiNjesi}
              onChange={handleInputChange}
              required
              placeholder="e.g. 4.80"
              error={errors.cmimiNjesi}
            />

            <Input
              label="Sasia në Stok (Sasia Fillestare)"
              name="sasiaStokut"
              value={form.sasiaStokut}
              onChange={handleInputChange}
              required
              placeholder="e.g. 100"
              error={errors.sasiaStokut}
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

export default Materials
