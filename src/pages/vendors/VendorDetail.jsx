import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiArrowLeft, FiEdit, FiTrash2, FiAlertTriangle, FiCheck, FiX, FiClock, FiTruck, FiStar, FiShoppingBag, FiPhone, FiMapPin, FiUsers, FiPackage, FiImage, FiPlus } from 'react-icons/fi';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Fetch vendor details from API
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await api.get(`/admin/vendors/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setVendor(response.data.vendor);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch vendor:', err);
        setError('Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4 p-6">
          <FiAlertTriangle className="mx-auto text-rose-600 text-5xl" />
          <p className="text-slate-600 dark:text-slate-400">{error || 'Vendor not found'}</p>
          <button
            onClick={() => navigate('/vendors')}
            className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/15';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/15';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/15';
      default:
        return '';
    }
  };

  const getDeliveryStyle = (minutes) => {
    if (minutes <= 25) return 'text-emerald-700 dark:text-emerald-300';
    if (minutes <= 35) return 'text-amber-700 dark:text-amber-300';
    return 'text-rose-700 dark:text-rose-300';
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(
        `/admin/vendors/${vendor.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setVendor(prev => ({ ...prev, status: newStatus }));
        alert(`Vendor ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update vendor status');
    }
  };

  const handleDeleteVendor = async () => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(
        `/admin/vendors/${vendor.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Vendor deleted successfully');
        navigate('/vendors');
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const products = vendor.products || [];
  
  const stats = [
    { label: 'Today Orders', value: vendor.orders || 0 },
    { label: 'Total Revenue', value: vendor.revenue || 'Rs 0' },
    { label: 'Customer Rating', value: `${vendor.rating || 0}/5` },
    { label: 'Pending Deliveries', value: Math.max(0, (vendor.orders || 0) - 20) }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/vendors')}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
              >
                <FiArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary-500/20 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600">
                    {vendor.logo ? (
                      <img 
                        src={vendor.logo} 
                        alt={vendor.shopName}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <FiShoppingBag size={24} />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950">
                    <FiImage size={10} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{vendor.shopName}</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{vendor.category || 'General'} vendor</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {vendor.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => handleStatusUpdate('approved')}
                    className="premium-button bg-gradient-to-r from-accent-500 to-accent-600 shadow-[0_8px_20px_-8px_rgba(50,211,154,0.55)]"
                  >
                    <FiCheck size={16} />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('rejected')}
                    className="ghost-button border-rose-200/60 text-rose-700 hover:bg-rose-50/80 dark:border-rose-400/20 dark:text-rose-300 dark:hover:bg-rose-400/10"
                  >
                    <FiX size={16} />
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <span className={`status-pill capitalize ${getStatusStyle(vendor.status)}`}>{vendor.status}</span>
                  <button 
                    onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
                    className="ghost-button"
                  >
                    <FiEdit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteVendor()}
                    className="ghost-button text-rose-700 dark:text-rose-300"
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1">
            {[
              { key: 'basic', label: 'Basic Information' },
              { key: 'products', label: 'Products' },
              { key: 'statistics', label: 'Statistics' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <>
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
                    <div className="absolute -bottom-1 left-4 right-4 h-px bg-primary-600/20 rounded-full blur-sm" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="panel p-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20">
                    <FiClock className={`${getDeliveryStyle(vendor.avgDeliveryTime || 30)}`} size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Avg Delivery</p>
                  <p className={`mt-1 text-2xl font-extrabold ${getDeliveryStyle(vendor.avgDeliveryTime || 30)}`}>
                    {vendor.avgDeliveryTime || 30}<span className="text-sm font-medium opacity-70">min</span>
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
                    <FiTruck className="text-emerald-700 dark:text-emerald-300" size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">On-time Rate</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">{vendor.onTimeRate || 85}%</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/20">
                    <FiStar className="text-amber-500" size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Rating</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">{vendor.rating || 0}/5</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20">
                    <FiShoppingBag className="text-violet-700 dark:text-violet-300" size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Revenue</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">{vendor.revenue || 'Rs 0'}</p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Vendor Information</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: FiUsers, label: 'Owner', value: vendor.owner },
                  { icon: FiPhone, label: 'Phone', value: vendor.phone },
                  { icon: FiMapPin, label: 'Area', value: vendor.area },
                  { icon: FiShoppingBag, label: 'Shop Name', value: vendor.shopName },
                  { icon: FiPackage, label: 'Category', value: vendor.category },
                  { icon: FiClock, label: 'Joined', value: vendor.joined }
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-slate-50/70 p-4 dark:bg-white/[0.05]">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm dark:bg-white/[0.06] dark:text-slate-300">
                      <item.icon size={18} />
                    </div>
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="panel">
              <div className="border-b border-slate-200/70 p-6 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Products by {vendor.shopName}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{products.length} products available</p>
                  </div>
                  <button className="premium-button">
                    <FiPlus size={16} />
                    Add Product
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {products.map((product, index) => (
                    <div key={product.id} className="glass-card flex items-center justify-between p-4 transition-all hover:shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-600/15 text-primary-600 ring-1 ring-primary-200/50 dark:ring-primary-400/20">
                            <FiPackage size={22} />
                          </div>
                          <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                            product.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{product.category}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="font-medium text-emerald-700 dark:text-emerald-300">{product.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Stock</p>
                          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{product.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Sales</p>
                          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{product.sales}</p>
                        </div>
                        <span className={`status-pill capitalize ${
                          product.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300' 
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300'
                        }`}>
                          {product.status === 'active' ? 'In Stock' : 'Low Stock'}
                        </span>
                        <button className="ghost-button p-2">
                          <FiEdit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Selling Products</h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Last 30 days</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {products.slice(0, 3).map((product, index) => (
                  <div key={product.id} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50/50 p-5 dark:from-slate-800/50 dark:to-slate-900/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-400/15 dark:text-primary-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                          #{index + 1} Best Seller
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{product.sales} sold</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(stat => (
                <div key={stat.label} className="glass-card p-6 text-center">
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="panel p-6">
              <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Delivery Performance</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                    <span>On-time fulfillment</span>
                    <span>{vendor.onTimeRate}%</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-3 rounded-full bg-gradient-to-r from-accent-400 to-accent-500" style={{ width: `${vendor.onTimeRate}%` }} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="glass-card p-5 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Orders</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{vendor.orders}</p>
                  </div>
                  <div className="glass-card p-5 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Active Riders</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{vendor.activeRiders}</p>
                  </div>
                  <div className="glass-card p-5 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Delivery Risk</p>
                    <p className={`mt-1 text-2xl font-extrabold ${getDeliveryStyle(vendor.avgDeliveryTime)}`}>
                      {vendor.avgDeliveryTime > 35 ? 'High' : vendor.avgDeliveryTime > 25 ? 'Medium' : 'Low'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail;