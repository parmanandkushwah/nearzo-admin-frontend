import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiFolder, FiTag, FiSearch, FiCheck, FiX, FiShoppingBag, FiUsers, FiAward, FiChevronDown, FiImage } from 'react-icons/fi';

const initialCategory = {
  name: '',
  description: '',
  icon: 'FiFolder',
  color: 'primary',
  isActive: true,
  image: null
};

const colorOptions = [
  { value: 'primary', label: 'Purple', bg: 'bg-primary-500' },
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { value: 'teal', label: 'Teal', bg: 'bg-teal-500' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { value: 'violet', label: 'Violet', bg: 'bg-violet-500' }
];

const StoreCategories = () => {
  const [storeCategories, setStoreCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: initialCategory
  });

  const selectedColor = watch('color');

  const API_BASE = '/shop-categories';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // Map backend data to frontend structure
        const formatted = response.data.shopCategories.map(cat => ({
          id: cat.id,
          name: cat.shopCategoryName,
          description: cat.description || 'No description',
          icon: 'FiShoppingBag',
          color: cat.color || 'primary',
          isActive: cat.isActive,
          image: cat.image || null,
          vendorCount: cat.vendorCount || 0,
          revenue: cat.revenue || 'Rs 0'
        }));
        setStoreCategories(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search) return storeCategories;
    return storeCategories.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [storeCategories, search]);

  const stats = useMemo(() => {
    const total = storeCategories.length;
    const active = storeCategories.filter(c => c.isActive).length;
    const totalVendors = storeCategories.reduce((sum, c) => sum + c.vendorCount, 0);
    const totalRevenue = storeCategories.length > 0 
      ? storeCategories.reduce((sum, c) => sum + parseFloat(c.revenue.replace('Rs ', '')), 0)
      : 0;
    
    // Get top 3 categories by vendor count
    const sortedByVendors = [...storeCategories].sort((a, b) => b.vendorCount - a.vendorCount);
    const topCategories = sortedByVendors.slice(0, 3);
    
    return { total, active, totalVendors, totalRevenue, topCategories };
  }, [storeCategories]);

  const openModal = (category = null) => {
    setSelectedCategory(category);
    reset(category || initialCategory);
    setSelectedImage(null);
    setImagePreview(category?.image || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setSelectedImage(null);
    setImagePreview(null);
    reset(initialCategory);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('shopCategoryName', data.name);
      formData.append('description', data.description);
      formData.append('color', data.color);
      formData.append('isActive', data.isActive);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

if (selectedCategory) {
        const response = await api.put(
          `${API_BASE}/${selectedCategory.id}`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response.data.success) {
          setStoreCategories(cats => cats.map(c => 
            c.id === selectedCategory.id 
              ? { ...c, ...data, name: response.data.shopCategory.shopCategoryName, description: response.data.shopCategory.description, image: response.data.shopCategory.image }
              : c
          ));
          alert('Category updated successfully');
        }
      } else {
        const response = await api.post(
          API_BASE,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (response.data.success) {
          setStoreCategories(cats => [...cats, {
            ...data,
            id: response.data.shopCategory.id,
            name: response.data.shopCategory.shopCategoryName,
            description: response.data.shopCategory.description,
            image: response.data.shopCategory.image
          }]);
          alert('Category created successfully');
        }
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const deleteCategory = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this category?')) return;
      
      const token = localStorage.getItem('token');
      const response = await api.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStoreCategories(cats => cats.filter(c => c.id !== id));
        alert('Category deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const category = storeCategories.find(c => c.id === id);
      const response = await api.put(
        `${API_BASE}/${id}/status`,
        { isActive: !category.isActive },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setStoreCategories(cats => cats.map(c => 
          c.id === id ? { ...c, isActive: !c.isActive } : c
        ));
      }
    } catch (error) {
      console.error('Failed to update category status:', error);
      alert('Failed to update status');
    }
  };

  const getColorClasses = (color) => {
    const map = {
      primary: 'bg-primary-500/15 text-primary-600 ring-1 ring-primary-500/20 dark:bg-primary-400/10 dark:text-primary-300',
      emerald: 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300',
      teal: 'bg-teal-500/15 text-teal-600 ring-1 ring-teal-500/20 dark:bg-teal-400/10 dark:text-teal-300',
      amber: 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300',
      rose: 'bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300',
      violet: 'bg-violet-500/15 text-violet-600 ring-1 ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300'
    };
    return map[color] || map.primary;
  };

  const Modal = ({ children, onClose }) => createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/[0.94] shadow-2xl shadow-slate-950/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#1F2937]/[0.96]">
        {children}
      </div>
    </div>,
    document.body
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="brand-hero flex flex-col justify-between gap-4 rounded-lg p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Store Categories</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Vendor Registration</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Store Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Manage store categories that vendors register under. Control which categories are active for new vendor registrations.
          </p>
        </div>
        <button onClick={() => openModal()} className="premium-button bg-white from-white to-secondary-100 text-primary-700 hover:from-white hover:to-white">
          <FiPlus size={17} />
          Add Category
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
            <FiFolder size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Categories</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stats.active} active for registration</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300">
            <FiUsers size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Registered Vendors</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.totalVendors}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Across all categories</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300">
            <FiShoppingBag size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">Rs {stats.totalRevenue.toFixed(1)}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Across all categories</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300">
            <FiAward size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Top Categories</p>
          <div className="mt-2 space-y-1">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((cat, index) => (
                <p key={cat.id} className="text-sm font-bold text-slate-950 dark:text-white">
                  {index + 1}. {cat.name} ({cat.vendorCount})
                </p>
              ))
            ) : (
              <p className="text-sm font-bold text-slate-950 dark:text-white">-</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search store categories..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {filteredCategories.length}</span>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                <FiFolder size={22} />
              </div>
              <p className="mt-3 font-bold text-slate-950 dark:text-white">Loading categories...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map(category => (
                <div key={category.id} className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 p-5 shadow-lg shadow-violet-500/10 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:from-violet-500/20 dark:via-purple-500/10 dark:to-fuchsia-500/20">
                  <div className="absolute inset-0 bg-white/30 dark:bg-white/5" />
                  <div className="relative z-10 flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="h-12 w-12 rounded-xl object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getColorClasses(category.color)}`}>
                          <FiShoppingBag size={22} />
                        </div>
                      )}
                    </div>
                    <span className={`status-pill capitalize ${category.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="relative z-10 font-bold text-slate-950 dark:text-white text-lg">{category.name}</h3>
                  <p className="relative z-10 mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{category.description}</p>
                  <div className="relative z-10 mt-4 pt-4 border-t border-white/20 dark:border-white/10 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">VENDORS</p>
                      <p className="font-extrabold text-slate-950 dark:text-white">{category.vendorCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">REVENUE</p>
                      <p className="font-extrabold text-emerald-700 dark:text-emerald-300">{category.revenue}</p>
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 flex gap-2">
                    <button onClick={() => openModal(category)} className="ghost-button flex-1">
                      <FiEdit size={14} />
                      Edit
                    </button>
                    <button onClick={() => toggleStatus(category.id)} className="ghost-button">
                      {category.isActive ? <FiX size={14} /> : <FiCheck size={14} />}
                    </button>
                    <button onClick={() => deleteCategory(category.id)} className="ghost-button text-rose-700 dark:text-rose-300">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredCategories.length === 0 && !loading && (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                <FiFolder size={22} />
              </div>
              <p className="mt-3 font-bold text-slate-950 dark:text-white">No store categories found</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first store category to get started.</p>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <Modal onClose={closeModal}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="border-b border-white/20 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="status-pill bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-400/15">
                    Store Category
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 dark:text-white">
                    {selectedCategory ? 'Edit Category' : 'Add Category'}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Create store categories that vendors can register under.
                  </p>
                </div>
                <button type="button" onClick={closeModal} className="icon-button shrink-0">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 modal-scroll">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4">Category Details</h3>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Category Name</span>
                      <input
                        type="text"
                        required
                        {...register('name')}
                        className="input-premium h-11 w-full px-4"
                        placeholder="e.g., Grocery & Essentials"
                      />
                    </label>
                    
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Description</span>
                      <textarea
                        {...register('description')}
                        className="input-premium w-full px-4 py-3"
                        placeholder="Brief description of this store category"
                        rows={3}
                      />
                    </label>

                    <div>
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Category Image</span>
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-full w-full rounded-xl object-cover" />
                          ) : (
                            <FiImage size={24} className="text-slate-400" />
                          )}
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <span className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-600">
                            Choose Image
                          </span>
                        </label>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Color Theme</span>
                      <div className="grid grid-cols-6 gap-2">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setValue('color', color.value)}
                            className={`h-10 w-10 rounded-lg ${color.bg} transition-transform hover:scale-110 ${selectedColor === color.value ? 'ring-3 ring-primary-500 ring-offset-2' : ''}`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active for Registration</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/20 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
              <button type="button" onClick={closeModal} className="ghost-button flex-1">
                Cancel
              </button>
              <button type="submit" className="premium-button flex-1">
                {selectedCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StoreCategories;