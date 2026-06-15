import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import api, { getMediaUrl } from '../../services/api';
import {
  FiSearch, FiPackage, FiImage, FiX, FiCheck, FiXCircle,
  FiChevronLeft, FiChevronRight, FiEye, FiLoader, FiAlertCircle,
  FiFolder, FiClock, FiCheckCircle
} from 'react-icons/fi';

const API_BASE = '/vendor/non-master-products';
const CATEGORY_API = '/product-categories';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  pill: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300' },
  approved: { label: 'Approved', pill: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300' },
  rejected: { label: 'Rejected', pill: 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-300' },
};

const ImgWithFallback = ({ src, alt, className }) => {
  const [err, setErr] = useState(false);
  if (!src || err) return <div className="flex h-full w-full items-center justify-center text-slate-400"><FiImage size={20} /></div>;
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
};

const NonMasterProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [detailProduct, setDetailProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  const [approveProduct, setApproveProduct] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm();
  const watchedCategoryId = watch('productCategoryId');

  const selectedCategory = useMemo(
    () => categories.find(c => c.id === parseInt(watchedCategoryId)) || null,
    [watchedCategoryId, categories]
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = { page: currentPage, limit: itemsPerPage };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      if (res.data.success) {
        setProducts(res.data.products || []);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch non-master products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(CATEGORY_API, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const stats = useMemo(() => ({
    total: totalCount,
    pending: products.filter(p => p.status === 'pending').length,
    approved: products.filter(p => p.status === 'approved').length,
    rejected: products.filter(p => p.status === 'rejected').length,
  }), [products, totalCount]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const openDetailModal = (product) => {
    setDetailProduct(product);
    setShowDetailModal(true);
  };

  const openApproveModal = (product) => {
    setApproveProduct(product);
    reset({
      name: product.productName,
      description: '',
      mrp: product.price ? String(product.price) : '',
      productCategoryId: '',
      productSubCategoryId: ''
    });
    setShowApproveModal(true);
  };

  const handleApprove = async (data) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.post(`${API_BASE}/${approveProduct.id}/approve`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProducts(prev => prev.map(p => p.id === approveProduct.id ? { ...p, status: 'approved' } : p));
        setShowApproveModal(false);
        setApproveProduct(null);
        alert('Product approved and added to master catalog!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (product) => {
    if (!window.confirm(`Reject "${product.productName}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(`${API_BASE}/${product.id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'rejected' } : p));
      }
    } catch (err) {
      alert('Failed to reject product');
    }
  };

  // ── Detail Modal ─────────────────────────────────────────────────────────────
  const DetailModal = ({ product, onClose }) => {
    if (!product) return null;
    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
        <div className="relative z-10 flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/[0.86] shadow-2xl shadow-slate-950/35 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/[0.86]" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="relative overflow-hidden border-b border-white/40 bg-gradient-to-br from-primary-700 via-primary-600 to-slate-900 px-6 py-5 text-white dark:border-white/10">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_22%,rgba(50,211,154,0.35),transparent_18rem)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="status-pill bg-white/[0.14] text-white ring-1 ring-white/20">Non-Master Product</span>
                  <span className={`status-pill ring-1 ${STATUS_CONFIG[product.status]?.pill || STATUS_CONFIG.pending.pill}`}>
                    {STATUS_CONFIG[product.status]?.label || 'Pending'}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">{product.productName}</h2>
                <p className="mt-2 text-sm text-white/75">Submitted by: {product.Vendor?.shopName || product.Vendor?.ownerName || `Vendor #${product.vendorId}`}</p>
              </div>
              <button type="button" onClick={onClose} className="icon-button shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6 hidden-scroll">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Images */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-white/60 bg-white/70 p-3 shadow-[0_20px_55px_-38px_rgba(31,41,55,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Front Image</p>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                    <ImgWithFallback src={getMediaUrl(product.frontImage)} alt="Front" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/60 bg-white/70 p-3 shadow-[0_20px_55px_-38px_rgba(31,41,55,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Back Image</p>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                    <ImgWithFallback src={getMediaUrl(product.backImage)} alt="Back" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI Detected Price</p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">₹{product.price}</p>
                  </div>
                  <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
                    <p className={`mt-2 text-sm font-bold capitalize ${product.status === 'approved' ? 'text-emerald-700 dark:text-emerald-300' : product.status === 'rejected' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      {product.status || 'pending'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.05] sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI Detected Category</p>
                    <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{product.categoryName || '-'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-5 shadow-[0_16px_44px_-34px_rgba(31,41,55,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
                      <FiPackage size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Product Info</h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI extracted details</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04]">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Product ID</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">#{product.id}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04]">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Vendor</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white truncate">{product.Vendor?.shopName || `#${product.vendorId}`}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04] col-span-2">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Submitted At</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{new Date(product.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {product.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { onClose(); openApproveModal(product); }}
                      className="premium-button flex-1 bg-emerald-600 from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600"
                    >
                      <FiCheck size={16} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => { onClose(); handleReject(product); }}
                      className="ghost-button flex-1 text-rose-700 dark:text-rose-300"
                    >
                      <FiXCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ── Approve Modal (fill master product details) ───────────────────────────────
  const ApproveModal = ({ product, onClose }) => {
    if (!product) return null;
    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4">
        <div className="relative z-10 h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/[0.94] shadow-2xl shadow-slate-950/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#1F2937]/[0.96]" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit(handleApprove)} className="flex h-full flex-col">
            <div className="border-b border-white/20 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="status-pill bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/15">Approve Product</span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 dark:text-white">Add to Master Catalog</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Review and confirm the AI-extracted details before adding.</p>
                </div>
                <button type="button" onClick={onClose} className="icon-button shrink-0"><FiX size={18} /></button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 modal-scroll">
              <div className="space-y-5">
                {/* Preview images */}
                <div className="flex gap-4">
                  {product.frontImage && (
                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
                      <ImgWithFallback src={getMediaUrl(product.frontImage)} alt="Front" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {product.backImage && (
                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
                      <ImgWithFallback src={getMediaUrl(product.backImage)} alt="Back" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Product Images</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Front &amp; back images will be added to the master product</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04] space-y-4">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Product Details</h3>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Product Name</span>
                    <input type="text" required {...register('name')} className="input-premium h-11 w-full px-4" placeholder="Product name" />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">MRP</span>
                    <input type="text" {...register('mrp')} className="input-premium h-11 w-full px-4" placeholder="e.g. ₹120" />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Description</span>
                    <textarea {...register('description')} rows={3} className="input-premium w-full px-4 py-3" placeholder="Brief description..." />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Category</span>
                      <select
                        {...register('productCategoryId')}
                        className="input-premium h-11 w-full px-4"
                        onChange={e => { setValue('productCategoryId', e.target.value); setValue('productSubCategoryId', ''); }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Sub Category</span>
                      <select {...register('productSubCategoryId')} className="input-premium h-11 w-full px-4" disabled={!selectedCategory}>
                        <option value="">Select Sub Category</option>
                        {selectedCategory?.subCategories?.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/20 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
              <button type="button" onClick={onClose} className="ghost-button flex-1">Cancel</button>
              <button type="submit" disabled={actionLoading} className="premium-button flex-1 bg-emerald-600 from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-60">
                {actionLoading ? <FiLoader size={16} className="animate-spin" /> : <FiCheck size={16} />}
                {actionLoading ? 'Approving...' : 'Approve & Add to Catalog'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Hero */}
      <section className="brand-hero flex flex-col justify-between gap-4 rounded-lg p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Non-Master Products</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Vendor Submissions</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Non-Master Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Products submitted by vendors via AI image analysis. Review, approve to add to master catalog, or reject.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300"><FiPackage size={21} /></div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Submissions</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{totalCount}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All vendor submissions</p>
        </div>
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300"><FiClock size={21} /></div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Pending Review</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.pending}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Awaiting your action</p>
        </div>
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300"><FiCheckCircle size={21} /></div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Approved</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.approved}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Added to master catalog</p>
        </div>
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-300"><FiAlertCircle size={21} /></div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Rejected</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.rejected}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Declined submissions</p>
        </div>
      </section>

      {/* Table */}
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search products..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-premium h-10 w-40 px-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {totalCount}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-4 px-3 font-semibold">Product</th>
                <th className="text-left py-4 px-3 font-semibold">Vendor</th>
                <th className="text-left py-4 px-3 font-semibold">AI Category</th>
                <th className="text-left py-4 px-3 font-semibold">Price</th>
                <th className="text-left py-4 px-3 font-semibold">Status</th>
                <th className="text-right py-4 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        <ImgWithFallback src={getMediaUrl(product.frontImage)} alt={product.productName} className="h-full w-full object-cover" />
                      </div>
                      <p className="font-medium text-slate-950 dark:text-white">{product.productName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-slate-600 dark:text-gray-400">{product.Vendor?.shopName || `#${product.vendorId}`}</td>
                  <td className="py-4 px-3 text-slate-600 dark:text-gray-400">{product.categoryName || '-'}</td>
                  <td className="py-4 px-3 font-semibold text-slate-950 dark:text-white">₹{product.price}</td>
                  <td className="py-4 px-3">
                    <span className={`status-pill ring-1 ${STATUS_CONFIG[product.status]?.pill || STATUS_CONFIG.pending.pill}`}>
                      {STATUS_CONFIG[product.status]?.label || 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openDetailModal(product)} className="ghost-button" title="View details">
                        <FiEye size={16} />
                      </button>
                      {product.status === 'pending' && (
                        <>
                          <button onClick={() => openApproveModal(product)} className="ghost-button text-emerald-700 dark:text-emerald-300" title="Approve">
                            <FiCheck size={16} />
                          </button>
                          <button onClick={() => handleReject(product)} className="ghost-button text-rose-700 dark:text-rose-300" title="Reject">
                            <FiXCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !loading && (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
              <FiPackage size={22} />
            </div>
            <p className="mt-3 font-bold text-slate-950 dark:text-white">No submissions found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vendor product submissions will appear here.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 dark:border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="icon-button h-9 w-9 disabled:opacity-50">
                  <FiChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="icon-button h-9 w-9 disabled:opacity-50">
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showDetailModal && <DetailModal product={detailProduct} onClose={() => { setShowDetailModal(false); setDetailProduct(null); }} />}
      {showApproveModal && <ApproveModal product={approveProduct} onClose={() => { setShowApproveModal(false); setApproveProduct(null); }} />}
    </div>
  );
};

export default NonMasterProducts;
