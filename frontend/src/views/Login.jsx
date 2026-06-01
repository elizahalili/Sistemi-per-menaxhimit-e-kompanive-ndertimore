import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { AlertCircle } from 'lucide-react'

const Login = () => {
  const { login } = useAuth()
  const savedEmail = localStorage.getItem('rememberedEmail') || ''
  const [form, setForm] = useState({ email: savedEmail, password: '' })
  const [rememberMe, setRememberMe] = useState(Boolean(savedEmail))
  const [showPasswordHelp, setShowPasswordHelp] = useState(false)
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
      await login(form.email, form.password)
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      window.location.hash = '#/'
    } catch (err) {
      setServerError(err.response?.data?.message || 'Emaili ose fjalëkalimi është i gabuar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-grid-pattern relative p-4 font-sans text-left">
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/20 via-slate-900 to-indigo-950/30 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand-500/20 mb-3">
            HD
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">EHD Construction System</h2>
          <p className="text-xs font-bold text-brand-400 uppercase tracking-widest leading-none mt-1">Sistemi për Menaxhim Ndërtimi</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gabim:</span> {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Adresa"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="shkruaj emailin tënd..."
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

          <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900/80 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
              />
              Më mbaj mend
            </label>
            <button
              type="button"
              onClick={() => setShowPasswordHelp((prev) => !prev)}
              className="hover:text-brand-400 transition-colors"
            >
              Harrove fjalëkalimin?
            </button>
          </div>

          {showPasswordHelp && (
            <div className="rounded-xl border border-brand-900/40 bg-brand-950/20 px-4 py-3 text-xs text-slate-300">
              Rivendosja automatike e fjalëkalimit nuk është ndërtuar ende. Për demo, përdor një nga llogaritë më poshtë ose kontakto administratorin e sistemit.
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 font-bold uppercase tracking-wider text-xs active:scale-[0.97]"
          >
            {loading ? 'Duke u kyçur...' : 'Kyçu në Panel'}
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Nuk keni llogari?{' '}
          <a href="#/register" className="text-brand-400 hover:text-brand-350 font-bold transition-colors">
            Regjistrohu këtu
          </a>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-850 text-left">
          <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest block mb-2">Llogari për Demonstrim (Demo):</span>
          <div className="grid grid-cols-1 gap-1.5 text-[10px] text-slate-400 font-sans">
            <div><span className="font-bold text-slate-300">Administrator:</span> admin@ndertimi.com / Admin123!</div>
            <div><span className="font-bold text-slate-300">Manager:</span> manager@ndertimi.com / Manager123!</div>
            <div><span className="font-bold text-slate-300">Worker:</span> worker@ndertimi.com / Worker123!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
