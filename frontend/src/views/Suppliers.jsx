import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { Plus, Search, Edit2, Trash2, Check, ShieldAlert, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Suppliers = () => {
  const { user, hasRole } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({ emertimi: '', kontakti: '', email: '', telefoni: '', adresa: '', specialiteti: '' })
  const [errors, setErrors] = useState({})
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await apiService.suppliers.getAll({
        search,
        pageNumber: page,
        pageSize
      })
      setData(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (err) {
      console.error(err)
      triggerToast('Gabim gjatë ngarkimit të furnitorëve.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [search, page])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.emertimi.trim()) newErrors.emertimi = 'Emri i furnitorit kërkohet.'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Emaili nuk është i vlefshëm.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCreateModal = () => {
    setSelectedId(null)
    setForm({ emertimi: '', kontakti: '', email: '', telefoni: '', adresa: '', specialiteti: '' })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (sup) => {
    setSelectedId(sup.id)
    setForm({
      emertimi: sup.emertimi,
      kontakti: sup.kontakti || '',
      email: sup.email || '',
      telefoni: sup.telefoni || '',
      adresa: sup.adresa || '',
      specialiteti: sup.specialiteti || ''
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (selectedId) {
        await apiService.suppliers.update(selectedId, form)
        triggerToast('Furnitori u përditësua me sukses!')
      } else {
        await apiService.suppliers.create(form)
        triggerToast('Furnitori i ri u shtua!')
      }
      setIsModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      console.error(err)
      triggerToast('Operacioni dështoi.', 'danger')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('A jeni të sigurt që dëshironi ta fshini këtë furnitor?')) return

    try {
      await apiService.suppliers.delete(id)
      triggerToast('Furnitori u fshi me sukses!')
      fetchSuppliers()
    } catch (err) {
      console.error(err)
      triggerToast('Dështoi fshirja.', 'danger')
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

      {/* Options Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-sm">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl focus-within:border-brand-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kërko furnitorët sipas emrit ose specialitetit..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white"
          />
        </div>
        
        {hasRole(["Admin", "Manager"]) && (
          <Button
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
            className="py-2.5"
          >
            Shto Furnitor
          </Button>
        )}
      </div>

      {/* Grid container */}
      <Card title="Partnerët Furnitorë" subtitle={`Furnitorë të regjistruar: ${totalCount}`} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase font-semibold text-xs tracking-wider">
                <th className="py-4 pl-6">Furnitori</th>
                <th className="py-4">Kontakti</th>
                <th className="py-4">Emaili</th>
                <th className="py-4">Telefoni</th>
                <th className="py-4">Specialiteti</th>
                {hasRole(["Admin", "Manager"]) && <th className="py-4 text-center pr-6">Veprimet</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-950/20">
                    Nuk u gjet asnjë furnitor.
                  </td>
                </tr>
              ) : (
                data.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 pl-6">
                      <div className="font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {sup.emertimi}
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{sup.adresa || 'Pa adresë'}</span>
                    </td>
                    <td className="py-4 text-slate-650 dark:text-slate-350 font-semibold">{sup.kontakti || 'Nuk ka'}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{sup.email || 'Nuk ka'}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">{sup.telefoni || 'Nuk ka'}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                        {sup.specialiteti || 'Materiale'}
                      </span>
                    </td>
                    
                    {hasRole(["Admin", "Manager"]) && (
                      <td className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="icon"
                            onClick={() => openEditModal(sup)}
                            icon={<Edit2 className="w-4 h-4 text-brand-600 hover:text-brand-700" />}
                          />
                          {hasRole(["Admin"]) && (
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(sup.id)}
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
        title={selectedId ? 'Përditëso Furnitorin' : 'Shto Furnitor të Ri'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kompania Furnitore"
              name="emertimi"
              value={form.emertimi}
              onChange={handleInputChange}
              required
              error={errors.emertimi}
            />

            <Input
              label="Personi Kontaktues"
              name="kontakti"
              value={form.kontakti}
              onChange={handleInputChange}
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Specialiteti"
              name="specialiteti"
              value={form.specialiteti}
              onChange={handleInputChange}
              placeholder="e.g. Çimento, Hekur, Drunj"
            />

            <Input
              label="Adresa"
              name="adresa"
              value={form.adresa}
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

export default Suppliers
