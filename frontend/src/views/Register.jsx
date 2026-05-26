import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { AlertCircle } from 'lucide-react'

const Register = () => {
  const { register } = useAuth()
  const [form, setForm] = useState({ emri: '', mbiemri: '', email: '', password: '', role: 'Worker' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.emri) newErrors.emri = 'Emri kërkohet.'
    if (!form.mbiemri) newErrors.mbiemri = 'Mbiemri kërkohet.'
    
    if (!form.email) newErrors.email = 'Emaili kërkohet.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Emaili nuk është i vlefshëm.'
    
    if (!form.password) newErrors.password = 'Fjalëkalimi kërkohet.'
    else if (form.password.length < 6) newErrors.password = 'Fjalëkalimi duhet të ketë së paku 6 karaktere.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await register(form)
      window.location.hash = '#/'
    } catch (err) {
      setServerError(err.response?.data?.message || 'Regjistrimi dështoi. Kontrolloni të dhënat tuaja.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-grid-pattern relative p-4 font-sans text-left">
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/20 via-slate-900 to-indigo-950/30 pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-500/20 mb-2">
            HD
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">Krijo një Llogari</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Regjistrimi i stafit / Hekur & Deko</p>
        </div>

        {serverError && (
          <div className="mb-4 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gabim:</span> {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emri"
              name="emri"
              value={form.emri}
              onChange={handleChange}
              placeholder="Arben"
              required
              error={errors.emri}
              className="text-white"
            />
            <Input
              label="Mbiemri"
              name="mbiemri"
              value={form.mbiemri}
              onChange={handleChange}
              placeholder="Gashi"
              required
              error={errors.mbiemri}
              className="text-white"
            />
          </div>

          <Input
            label="Email Adresa"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="arben.gashi@ndertimi.com"
            required
            error={errors.email}
            className="text-white"
          />

          <Input
            label="Fjalëkalimi"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="shkruaj fjalëkalimin..."
            required
            error={errors.password}
            className="text-white"
          />

          

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 font-bold uppercase tracking-wider text-xs active:scale-[0.97]"
          >
            {loading ? 'Duke u regjistruar...' : 'Krijo Llogarinë'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Keni llogari?{' '}
          <a href="#/login" className="text-brand-400 hover:text-brand-350 font-bold transition-colors">
            Kyçu këtu
          </a>
        </div>

      </div>
    </div>
  )
}

export default Register
