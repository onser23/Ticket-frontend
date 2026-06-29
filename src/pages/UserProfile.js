import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Save, Eye, EyeOff, Loader2, AlertCircle, Check, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import userApi from '../utils/userApi';
import { useUserAuth } from '../context/UserAuthContext';
import { validateEmail, validateName, validatePassword, validateRequired } from '../utils/validators';

const UserProfile = () => {
  const { user, updateUser } = useUserAuth();
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    const firstNameErr = validateName(profileData.firstName, 'Ad');
    if (firstNameErr) return setProfileError(firstNameErr);
    const lastNameErr = validateName(profileData.lastName, 'Soyad');
    if (lastNameErr) return setProfileError(lastNameErr);
    const emailErr = validateEmail(profileData.email);
    if (emailErr) return setProfileError(emailErr);

    setSavingProfile(true);
    try {
      const res = await userApi.put('/profile', profileData);
      updateUser({ ...user, ...res.data.user });
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
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError('Yeni şifrə və təkrarı uyğun deyil');
    }

    setSavingPassword(true);
    try {
      await userApi.put('/profile/password', passwordData, { _skipAuthRedirect: true });
      toast.success('Şifrə uğurla dəyişdirildi');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Şifrə dəyişdirilmədi');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
          <UserIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Profilim</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Şirkət</p>
            <p className="text-sm font-semibold text-slate-900">{user?.companyName}</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
              <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} disabled={savingProfile} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
              <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} disabled={savingProfile} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-poçt</label>
            <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={savingProfile} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60" />
          </div>

          <button type="submit" disabled={savingProfile} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-60">
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
              <input type={showCurrentPw ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} disabled={savingPassword} className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifrə (min 6 simvol)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type={showNewPw ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} disabled={savingPassword} className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifrənin təkrarı</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                disabled={savingPassword}
                className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
              />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={savingPassword} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-60">
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Şifrəni yenilə
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
