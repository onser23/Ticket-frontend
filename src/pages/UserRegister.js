import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, Loader2, Lock, AlertCircle, X, User, Building2, Ticket, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import userApi from '../utils/userApi';
import { validateEmail, validatePassword, validateName, validateRequired } from '../utils/validators';

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const firstNameErr = validateName(formData.firstName, 'Ad');
    if (firstNameErr) return setErrorMessage(firstNameErr);
    const lastNameErr = validateName(formData.lastName, 'Soyad');
    if (lastNameErr) return setErrorMessage(lastNameErr);
    const emailErr = validateEmail(formData.email);
    if (emailErr) return setErrorMessage(emailErr);
    const passErr = validatePassword(formData.password);
    if (passErr) return setErrorMessage(passErr);
    const companyErr = validateRequired(formData.companyName, 'Şirkət adı');
    if (companyErr) return setErrorMessage(companyErr);
    if (formData.companyName.trim().length < 2) {
      return setErrorMessage('Şirkət adı minimum 2 simvol olmalıdır');
    }

    setLoading(true);
    try {
      await userApi.post('/auth/register', formData);
      toast.success('Qeydiyyat uğurla başa çatdı! Email ünvanınıza OTP kodu göndərildi.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Qeydiyyat uğursuz oldu. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob-slow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob-slower [animation-delay:4s]" />

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl mb-8">
            <Ticket className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 text-center leading-tight">Qeydiyyat</h1>
          <p className="text-lg text-indigo-100 text-center max-w-md leading-relaxed">
            Bir neçə addımla hesab yaradın və müraciətlərinizi bildirməyə başlayın
          </p>
          <div className="mt-10 space-y-3 text-left max-w-sm">
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-300 flex-shrink-0" /><span>Email ilə təsdiq</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-300 flex-shrink-0" /><span>Şirkətinizə aid müraciətlər</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-300 flex-shrink-0" /><span>Real-time status izləmə</span></div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl mb-3">
            <Ticket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Qeydiyyat</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white/80 lg:backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 lg:p-10 animate-fadeIn">
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Hesab yaradın</h2>
              <p className="text-slate-500 mt-2">Məlumatlarınızı daxil edin</p>
            </div>

            {errorMessage && (
              <div role="alert" className="animate-slideDown mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Qeydiyyat uğursuz oldu</p>
                  <p className="text-sm text-red-600 mt-0.5">{errorMessage}</p>
                </div>
                <button type="button" onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-600" aria-label="Xətanı bağla">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">Ad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ad" disabled={loading} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">Soyad</label>
                  <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Soyad" disabled={loading} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">E-poçt</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" autoComplete="email" disabled={loading} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Şifrə (min 6 simvol)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Şifrə" autoComplete="new-password" disabled={loading} className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-60" aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-2">Şirkət adı</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input id="companyName" type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Məs: ABC MMC" disabled={loading} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-60" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Bu şirkətə aid müraciətlər açacaqsınız</p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Qeydiyyat...</span></>) : (<span>Qeydiyyatdan keç</span>)}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Hesabınız var?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Daxil olun</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
