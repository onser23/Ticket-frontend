import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Eye, EyeOff, Loader2, Lock, AlertCircle, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminApi from '../utils/adminApi';
import { validateRequired } from '../utils/validators';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const userErr = validateRequired(formData.username, 'İstifadəçi adı');
    if (userErr) return setErrorMessage(userErr);
    const passErr = validateRequired(formData.password, 'Şifrə');
    if (passErr) return setErrorMessage(passErr);

    setLoading(true);
    try {
      const res = await adminApi.post('/admin/auth/login', formData);
      const { token, admin } = res.data;
      login(token, admin);
      toast.success('Admin panelə xoş gəldiniz!');
      navigate('/admin');
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Giriş uğursuz oldu. Yenidən cəhd edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 lg:p-10 animate-fadeIn">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-2">Yalnız səlahiyyətli istifadəçilər üçün</p>
          </div>

          {errorMessage && (
            <div role="alert" className="animate-slideDown mb-6 rounded-xl bg-red-900/40 border border-red-700/50 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-200">Giriş uğursuz oldu</p>
                <p className="text-sm text-red-300 mt-0.5">{errorMessage}</p>
              </div>
              <button type="button" onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-200" aria-label="Xətanı bağla">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-300 mb-2">İstifadəçi adı</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="admin" autoComplete="username" disabled={loading} className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-60" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">Şifrə</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Şifrə" autoComplete="current-password" disabled={loading} className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-60" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 disabled:opacity-60" aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Giriş edilir...</span></>) : (<span>Daxil ol</span>)}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">← User login</Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">© 2026 Ticket Sistemi · Admin Panel</p>
      </div>
    </div>
  );
};

export default AdminLogin;
