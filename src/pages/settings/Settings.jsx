import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiShield, FiTruck, FiTag, FiPercent, FiLoader, FiUser, FiMail, FiPhone, FiCamera, FiLock } from 'react-icons/fi';
import api from '../../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [settings, setSettings] = useState({
    platformName: 'QuickCommerce',
    platformEmail: 'admin@quickcommerce.com',
    supportPhone: '+91 9876543210',
    deliveryCharge: 40,
    taxRate: 5,
    commissionRate: 10
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const token = localStorage.getItem('token');
        const response = await api.get('/admin/settings/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setProfile(response.data.admin);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const token = localStorage.getItem('token');
        const response = await api.get('/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await api.put('/admin/settings/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProfile(response.data.admin);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await api.put('/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await api.put('/admin/settings/password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Failed to update password:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your profile and platform settings</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'profile'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FiUser className="inline mr-2" size={16} />
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'password'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FiLock className="inline mr-2" size={16} />
          Change Password
        </button>
        <button
          onClick={() => setActiveTab('platform')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'platform'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FiShield className="inline mr-2" size={16} />
          Platform Settings
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiUser size={24} className="text-primary-500" /> Admin Profile
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleProfileSave(); }}>
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="relative">
                <img
                  src={profile.avatar || 'https://images.unsplash.com/photo-1472099644200-b31a42762b7a?w=100&h=100&fit=crop'}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-100"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-all"
                >
                  <FiCamera size={14} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                disabled={profileLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiMail size={16} /> Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
                disabled={profileLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiPhone size={16} /> Phone
              </label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                disabled={profileLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
          </form>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleProfileSave}
              disabled={profileLoading || saving}
              className="px-6 py-3 rounded-2xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <FiLoader size={18} className="animate-spin" /> : <FiSave size={18} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiLock size={24} className="text-amber-500" /> Change Password
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(e) => { e.preventDefault(); handlePasswordUpdate(); }}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Confirm new password"
              />
            </div>
          </form>
          <div className="flex justify-end mt-6">
            <button
              onClick={handlePasswordUpdate}
              disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
              className="px-6 py-3 rounded-2xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <FiLoader size={18} className="animate-spin" /> : <FiLock size={18} />}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'platform' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiShield size={24} className="text-primary-500" /> Platform Settings
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleSettingsSave(); }}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.platformName || ''}
                onChange={(e) => setSettings(prev => ({...prev, platformName: e.target.value}))}
                disabled={settingsLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform Email</label>
              <input
                type="email"
                value={settings.platformEmail || ''}
                onChange={(e) => setSettings(prev => ({...prev, platformEmail: e.target.value}))}
                disabled={settingsLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Support Phone</label>
              <input
                type="tel"
                value={settings.supportPhone || ''}
                onChange={(e) => setSettings(prev => ({...prev, supportPhone: e.target.value}))}
                disabled={settingsLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiTruck size={16} /> Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={settings.deliveryCharge || ''}
                onChange={(e) => setSettings(prev => ({...prev, deliveryCharge: e.target.value}))}
                disabled={settingsLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiPercent size={16} /> Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRate || ''}
                onChange={(e) => setSettings(prev => ({...prev, taxRate: e.target.value}))}
                disabled={settingsLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiTag size={16} /> Commission Rate (%)
              </label>
              <input
                type="number"
                value={settings.commissionRate || ''}
                onChange={(e) => setSettings(prev => ({...prev, commissionRate: e.target.value}))}
                disabled={settingsLoading}
                className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all disabled:opacity-60"
              />
            </div>
          </form>
          <div className="flex justify-end">
            <button
              onClick={handleSettingsSave}
              disabled={settingsLoading || saving}
              className="px-8 py-3 rounded-2xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <FiLoader size={18} className="animate-spin" /> : <FiSave size={18} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;