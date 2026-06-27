import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Save, Eye, EyeOff, Loader2, AlertCircle, Check, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { validateEmail, validatePassword, validateRequired } from '../utils/validators';
import { ADMIN_TOKEN_KEY } from '../utils/constants';

const AdminProfile = () => {
  const { admin, login } = useAdminAuth();
  const [profileData, setProfileData] = useState({ fullName: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (admin) {
      setProfileData({ fullName: admin.fullName || '', email: admin.email || '' });
    }
  }, [admin]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!profileData.fullName.trim()) return setProfileError('Ad tələb olunur');
    const emailErr = validateEmail(profileData.email);
    if (emailErr) return setProfileError(emailErr);

    setSavingProfile(true);
    try {
      const res = await adminApi.put('/admin/profile', profileData);
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      login(adminToken, res.data.admin);
      toast.success('Profil yeniləndi');
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Profil yenilənmədi');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    const currErr = validateRequired(passwordData.currentPassword, 'Cari şifrə');
    if (currErr) return setPasswordError(currErr);
    const newErr = validatePassword(passwordData.newPassword);
    if (newErr) return setPasswordError(newErr);

    setSavingPassword(true);
    try {
      await adminApi.put('/admin/profile/password', passwordData);
      toast.success('Şifrə uğurla dəyişdirildi');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Şifrə dəyişdirilmədi');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Profil</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
          <UserIcon className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">İstifadəçi adı</p>
            <p className="text-sm font-semibold text-slate-900">{admin?.username}</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-slate-900 mb-4">Şəxsi məlumatlar</h2>

        {profileError && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{profileError}</p>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tam ad</label>
            <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} disabled={savingProfile} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-poçt</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={savingProfile} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
            </div>
          </div>

          <button type="submit" disabled={savingProfile} className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:opacity-60">
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saxla
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Şifrəni dəyişdir</h2>

        {passwordError && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{passwordError}</p>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cari şifrə</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type={showCurrentPw ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} disabled={savingPassword} className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifrə (min 6 simvol)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type={showNewPw ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} disabled={savingPassword} className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={savingPassword} className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:opacity-60">
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Şifrəni yenilə
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
