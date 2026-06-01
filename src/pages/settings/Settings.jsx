import React, { useState } from 'react';
import { FiSave, FiRefreshCw, FiShield, FiTruck, FiTag, FiPercent } from 'react-icons/fi';

const Settings = () => {
  const [settings, setSettings] = useState({
    platformName: 'QuickCommerce',
    platformEmail: 'admin@quickcommerce.com',
    supportPhone: '+91 9876543210',
    deliveryCharge: 40,
    taxRate: 5,
    commissionRate: 10
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your platform settings</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FiShield size={24} className="text-primary-500" /> Platform Settings
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings(prev => ({...prev, platformName: e.target.value}))}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Platform Email</label>
            <input
              type="email"
              value={settings.platformEmail}
              onChange={(e) => setSettings(prev => ({...prev, platformEmail: e.target.value}))}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Support Phone</label>
            <input
              type="tel"
              value={settings.supportPhone}
              onChange={(e) => setSettings(prev => ({...prev, supportPhone: e.target.value}))}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FiTruck size={16} /> Delivery Charge (₹)
            </label>
            <input
              type="number"
              value={settings.deliveryCharge}
              onChange={(e) => setSettings(prev => ({...prev, deliveryCharge: e.target.value}))}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FiPercent size={16} /> Tax Rate (%)
            </label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings(prev => ({...prev, taxRate: e.target.value}))}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FiTag size={16} /> Commission Rate (%)
            </label>
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => setSettings(prev => ({...prev, commissionRate: e.target.value}))}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </form>
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-3 rounded-2xl gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <FiSave size={18} /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;