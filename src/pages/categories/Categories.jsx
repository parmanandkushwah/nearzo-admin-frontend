import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiFolder, FiTag, FiSearch, FiChevronDown, FiChevronRight, FiCheck, FiX, FiMoreVertical } from 'react-icons/fi';

const initialCategory = {
  name: '',
  description: '',
  parentId: null,
  isActive: true,
  isFeatured: false
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 }
      });
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialCategory
  });

  const parentCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);
  
  const getChildCategories = (parentId) => {
    return categories.filter(c => c.parentId === parentId);
  };

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const stats = useMemo(() => {
    const total = parentCategories.length;
    const active = parentCategories.filter(c => c.isActive).length;
    const featured = parentCategories.filter(c => c.isFeatured).length;
    const withSubCategories = parentCategories.filter(p => getChildCategories(p.id).length > 0).length;
    const subCategories = categories.filter(c => c.parentId).length;
    return { total, active, featured, withSubCategories, subCategories };
  }, [categories, parentCategories]);

  const openModal = (category = null) => {
    setSelectedCategory(category);
    reset(category || initialCategory);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    reset(initialCategory);
  };

  const toggleExpand = (id) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

   const onSubmit = async (data) => {
     try {
       const token = localStorage.getItem('token');
       const slug = data.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
       const payload = {
         name: data.name,
         slug,
         description: data.description,
         parentId: data.parentId || null,
         isActive: data.isActive,
         isFeatured: data.isFeatured
       };

      let response;
      if (selectedCategory) {
        response = await api.put(`/categories/${selectedCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await api.post('/categories', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        await fetchCategories();
        closeModal();
      } else {
        alert(response.data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        await fetchCategories();
      } else {
        alert(response.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const category = categories.find(c => c.id === id);
      if (!category) return;
      const newIsActive = !category.isActive;
      const response = await api.patch(`/categories/${id}`, { isActive: newIsActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        await fetchCategories();
      } else {
        alert(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const Modal = ({ children, onClose }) => createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4" onClick={onClose}>
      <div className="relative z-10 h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white/[0.94] shadow-2xl shadow-slate-950/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#1F2937]/[0.96]" onClick={(e) => e.stopPropagation()}>
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
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Category Management</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Hierarchical Structure</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Product Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Manage product categories and subcategories with hierarchical organization for better product discovery.
          </p>
        </div>
        <button onClick={() => openModal()} className="premium-button bg-white from-white to-secondary-100 text-primary-700 hover:from-white hover:to-white">
          <FiPlus size={17} />
          Add Category
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-400/15">
              <FiFolder size={21} />
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Categories</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stats.withSubCategories} with subcategories</p>
        </div>

        <div className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/15">
              <FiCheck size={21} />
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Active Categories</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.active}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ready for products</p>
        </div>

        <div className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/15">
              <FiTag size={21} />
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Featured</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.featured}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Highlighted categories</p>
        </div>

        <div className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-200 dark:ring-violet-400/15">
              <FiTag size={21} />
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Sub Categories</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.subCategories}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Child categories</p>
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
              placeholder="Search categories..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {filteredCategories.length}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-2">
            {parentCategories
              .filter(p => !search || filteredCategories.some(fc => fc.id === p.id || fc.parentId === p.id))
              .map((category) => {
                const children = getChildCategories(category.id);
                const isExpanded = expandedCategories.has(category.id);
                const hasChildren = children.length > 0;
                
                if (search && !filteredCategories.some(fc => fc.id === category.id)) {
                  return null;
                }

                return (
                  <div key={category.id} className="space-y-1">
                    <div className="glass-card p-4 hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                          onClick={() => toggleExpand(category.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                          </button>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300">
                            <FiFolder size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-950 dark:text-white">{category.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {category.isFeatured && (
                            <span className="status-pill bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/15">
                              Featured
                            </span>
                          )}
                          <span className={`status-pill capitalize ${
                            category.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                          }`}>
                            {category.status}
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => openModal(category)} className="icon-button" title="Edit">
                              <FiEdit size={14} />
                            </button>
                            <button onClick={() => deleteCategory(category.id)} className="icon-button text-rose-700 dark:text-rose-300" title="Delete">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
</div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="ml-12 space-y-1 border-l-2 border-teal-200/50 pl-4 dark:border-teal-400/20">
                        {children.map((child) => (
                          <div key={child.id} className="glass-card p-3 hover:-translate-y-0.5 transition-transform">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
                                  <FiTag size={16} />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{child.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{child.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {child.isFeatured && (
                                  <span className="status-pill bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300">
                                    Featured
                                  </span>
                                )}
                                <span className={`status-pill capitalize ${
                                  child.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                                }`}>
                                  {child.status}
                                </span>
                                <div className="flex gap-1">
                                  <button onClick={() => openModal(child)} className="icon-button" title="Edit">
                                    <FiEdit size={14} />
                                  </button>
                                  <button onClick={() => deleteCategory(child.id)} className="icon-button text-rose-700 dark:text-rose-300" title="Delete">
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => openModal({ parentId: category.id })}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-teal-300/50 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50/50 dark:border-teal-400/30 dark:text-teal-300 dark:hover:bg-teal-400/10"
                        >
                          <FiPlus size={14} /> Add Sub Category
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {parentCategories.length === 0 && (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                <FiFolder size={22} />
              </div>
              <p className="mt-3 font-bold text-slate-950 dark:text-white">No categories found</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first category to get started.</p>
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
                    Category
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 dark:text-white">
                    {selectedCategory ? 'Edit Category' : 'Add Category'}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {selectedCategory?.parentId ? 'Add a new subcategory under a parent category.' : 'Create a new top-level category for your products.'}
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
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Name</span>
                      <input
                        type="text"
                        required
                        {...register('name')}
                        className="input-premium h-11 w-full px-4"
                        placeholder="Category name"
                      />
                    </label>
                    
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Description</span>
                      <textarea
                        {...register('description')}
                        className="input-premium w-full px-4 py-3"
                        placeholder="Category description"
                        rows={3}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Parent Category (Optional)</span>
                      <select
                        {...register('parentId')}
                        className="input-premium h-11 w-full px-4"
                      >
                        <option value="">None - Top Level Category</option>
                        {parentCategories
                          .filter(c => c.id !== selectedCategory?.id)
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                      </select>
                    </label>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('isActive')}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('isFeatured')}
                          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Featured</span>
                      </label>
                    </div>
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

export default Categories;
