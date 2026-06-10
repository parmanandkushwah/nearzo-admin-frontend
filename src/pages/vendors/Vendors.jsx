import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import {
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiEdit,
  FiEye,
  FiFilter,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSearch,
  FiStar,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
  FiUpload,
  FiUsers,
  FiX
} from 'react-icons/fi';

const initialForm = {
  shopName: '',
  owner: '',
  phone: '',
  area: '',
  latitude: '',
  longitude: '',
  category: 'Grocery',
  status: 'pending',
  email: '',
  shopRegisterNo: '',
  gstNo: '',
  password: ''
};

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [shopCategories, setShopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewVendor, setViewVendor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 10;
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialForm
  });

  const navigate = useNavigate();

  // Fetch shop categories for dropdown
  useEffect(() => {
    const fetchShopCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/shop-categories/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setShopCategories(response.data.shopCategories);
        }
      } catch (error) {
        console.error('Failed to fetch shop categories:', error);
      }
    };
    fetchShopCategories();
  }, []);

  // Fetch vendors from API
   useEffect(() => {
     const fetchVendors = async () => {
       try {
         setLoading(true);
         const token = localStorage.getItem('token');
         const response = await api.get('/admin/vendors', {
           headers: {
             Authorization: `Bearer ${token}`
           },
           params: {
             search,
             status: statusFilter,
             limit: 100
           }
         });

         if (response.data.success) {
           setVendors(response.data.vendors);
         }
       } catch (error) {
         console.error('Failed to fetch vendors:', error);
       } finally {
         setLoading(false);
       }
     };

     const timer = setTimeout(fetchVendors, 300); // Debounce
     return () => clearTimeout(timer);
   }, [search, statusFilter]);

   // Reset to first page when search or filter changes
   useEffect(() => {
     setCurrentPage(1);
   }, [search, statusFilter]);

   const filteredVendors = useMemo(() => {
     return vendors.filter((vendor) => {
       const matchesSearch = [vendor.shopName, vendor.owner, vendor.area, vendor.category]
         .join(' ')
         .toLowerCase()
         .includes(search.toLowerCase());

       const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
       return matchesSearch && matchesStatus;
     });
   }, [vendors, search, statusFilter]);

   // Paginate filtered vendors
   const paginatedVendors = useMemo(() => {
     const startIndex = (currentPage - 1) * vendorsPerPage;
     const endIndex = startIndex + vendorsPerPage;
     return filteredVendors.slice(startIndex, endIndex);
   }, [filteredVendors, currentPage, vendorsPerPage]);

   // Calculate total pages
   const totalPages = Math.max(1, Math.ceil(filteredVendors.length / vendorsPerPage));

  const stats = useMemo(() => {
    const approved = vendors.filter((vendor) => vendor.status === 'approved').length;
    const pending = vendors.filter((vendor) => vendor.status === 'pending').length;
    const avgDelivery = vendors.length > 0
      ? Math.round(vendors.reduce((total, vendor) => total + Number(vendor.avgDeliveryTime || 0), 0) / vendors.length)
      : 0;
    const slowVendors = vendors.filter((vendor) => vendor.avgDeliveryTime > 35).length;

    return { approved, pending, avgDelivery, slowVendors };
  }, [vendors]);

  const openCreateForm = () => {
    setEditingVendor(null);
    reset(initialForm);
    setShowForm(true);
  };

  const openEditForm = (vendor) => {
    setEditingVendor(vendor);
    reset(vendor);
    setViewVendor(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVendor(null);
    reset(initialForm);
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const hasFiles = data.shopImage?.[0] || data.aadharFront?.[0] || data.aadharBack?.[0] || data.shopRegisterDoc?.[0];

      if (hasFiles) {
        const formData = new FormData();
        formData.append('shopName', data.shopName || '');
        formData.append('ownerName', data.owner || '');
        formData.append('email', data.email || '');
        formData.append('phone', data.phone || '');
        formData.append('area', data.area || '');
        formData.append('category', data.category || '');
        formData.append('status', data.status || 'pending');
        if (data.password) formData.append('password', data.password);
        if (data.shopRegisterNo) formData.append('shopRegisterNo', data.shopRegisterNo);
        if (data.gstNo) formData.append('gstNo', data.gstNo);
        if (data.latitude !== '' && data.latitude != null) formData.append('latitude', data.latitude);
        if (data.longitude !== '' && data.longitude != null) formData.append('longitude', data.longitude);
        if (data.shopImage?.[0]) formData.append('shopImage', data.shopImage[0]);
        if (data.aadharFront?.[0]) formData.append('aadharFront', data.aadharFront[0]);
        if (data.aadharBack?.[0]) formData.append('aadharBack', data.aadharBack[0]);
        if (data.shopRegisterDoc?.[0]) formData.append('shopRegisterImage', data.shopRegisterDoc[0]);

        const endpoint = editingVendor ? `/admin/vendors/${editingVendor.id}` : '/admin/vendors';
        const method = editingVendor ? 'put' : 'post';
        const response = await api[method](endpoint, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          if (editingVendor) {
            setVendors((current) =>
              current.map((vendor) =>
                vendor.id === editingVendor.id
                  ? { ...vendor, ...response.data.vendor }
                  : vendor
              )
            );
            alert('Vendor updated successfully');
          } else {
            setVendors((current) => [response.data.vendor, ...current]);
            alert('Vendor created successfully');
          }
        }
      } else {
        const payload = {
          shopName: data.shopName,
          owner: data.owner,
          phone: data.phone,
          area: data.area,
          category: data.category,
          status: data.status,
          email: data.email,
          password: data.password,
          shopRegisterNo: data.shopRegisterNo,
          gstNo: data.gstNo,
          latitude: data.latitude !== '' ? data.latitude : null,
          longitude: data.longitude !== '' ? data.longitude : null
        };

        if (editingVendor) {
          const response = await api.put(
            `/admin/vendors/${editingVendor.id}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (response.data.success) {
            setVendors((current) =>
              current.map((vendor) =>
                vendor.id === editingVendor.id
                  ? { ...vendor, ...response.data.vendor }
                  : vendor
              )
            );
            alert('Vendor updated successfully');
          }
        } else {
          const response = await api.post(
            '/admin/vendors',
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (response.data.success) {
            setVendors((current) => [response.data.vendor, ...current]);
            alert('Vendor created successfully');
          }
        }
      }

      closeForm();
    } catch (error) {
      console.error('Failed to save vendor:', error);
      alert(error.response?.data?.message || 'Failed to save vendor');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(
        `/admin/vendors/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setVendors((current) =>
          current.map((vendor) =>
            vendor.id === id ? { ...vendor, status } : vendor
          )
        );
        setViewVendor((current) =>
          current?.id === id ? { ...current, status } : current
        );
        alert('Vendor status updated successfully');
      }
    } catch (error) {
      console.error('Failed to update vendor status:', error);
      alert('Failed to update vendor status');
    }
  };

  const deleteVendor = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this vendor?')) {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await api.delete(
        `/admin/vendors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setVendors((current) => current.filter((vendor) => vendor.id !== id));
        setViewVendor((current) => (current?.id === id ? null : current));
        alert('Vendor deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/15';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/15';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/15';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10';
    }
  };

  const getDeliveryStyle = (minutes) => {
    if (minutes <= 25) return 'text-emerald-700 dark:text-emerald-300';
    if (minutes <= 35) return 'text-amber-700 dark:text-amber-300';
    return 'text-rose-700 dark:text-rose-300';
  };

  const StatCard = ({ icon: Icon, label, value, caption, tone }) => (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );

  const FormField = ({ label, children }) => (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );

  const Modal = ({ children, onClose }) => createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4" onClick={onClose}>
      <div className="relative z-10 h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-white/[0.94] shadow-2xl shadow-slate-950/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#1F2937]/[0.96]" onClick={(e) => e.stopPropagation()}>
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
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Vendor operations</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Delivery time monitoring</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Vendors</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Add, approve, monitor, and manage marketplace vendors with visibility into delivery speed, on-time rate, revenue, and overall performance.
          </p>
        </div>

        <button onClick={openCreateForm} className="premium-button bg-white from-white to-secondary-100 text-primary-700 hover:from-white hover:to-white">
          <FiPlus size={17} />
          Add Vendor
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FiShoppingBag}
          label="Total Vendors"
          value={vendors.length}
          caption={`${stats.approved} approved vendors`}
          tone="bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-400/15"
        />
        <StatCard
          icon={FiClock}
          label="Average Delivery"
          value={`${stats.avgDelivery} min`}
          caption="Across all active vendors"
          tone="bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/15"
        />
        <StatCard
          icon={FiAlertTriangle}
          label="Slow Vendors"
          value={stats.slowVendors}
          caption="Above 35 minutes average"
          tone="bg-rose-50 text-rose-700 ring-1 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-200 dark:ring-rose-400/15"
        />
        <StatCard
          icon={FiUsers}
          label="Pending Reviews"
          value={stats.pending}
          caption="Need admin approval"
          tone="bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-100 dark:ring-white/10"
        />
      </section>

      <section className="table-shell">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by shop, owner, area, or category..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'approved', 'pending', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-2 text-sm font-bold capitalize ${
                  statusFilter === status
                    ? 'bg-primary-500 text-white shadow-[0_12px_24px_-18px_rgba(108,76,241,0.85)] dark:bg-white dark:text-slate-950'
                    : 'border border-secondary-200 bg-white/75 text-slate-600 hover:border-primary-200 hover:bg-secondary-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

         <div className="overflow-x-auto">
           {loading ? (
             <div className="p-10 text-center">
               <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300 animate-spin">
                 <FiClock size={22} />
               </div>
               <p className="mt-3 font-bold text-slate-950 dark:text-white">Loading vendors...</p>
             </div>
           ) : (
             <>
               <table className="w-full min-w-[980px]">
                 <thead>
                   <tr>
                     <th>Vendor</th>
                     <th>Category</th>
                     <th>Status</th>
                     <th>Orders</th>
                     <th>Revenue</th>
                     <th>Avg Delivery</th>
                     <th>On-time</th>
                     <th className="text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {paginatedVendors.map((vendor) => (
                     <tr key={vendor.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                       <td>
                         <div className="flex items-center gap-3">
                           <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                             <FiShoppingBag size={18} />
                           </div>
                           <div>
                             <p className="font-bold text-slate-950 dark:text-white">{vendor.shopName}</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400">{vendor.owner} - {vendor.area}</p>
                           </div>
                         </div>
                       </td>
                       <td className="font-semibold text-slate-700 dark:text-slate-200">{vendor.category}</td>
                       <td>
                         <span className={`status-pill capitalize ${getStatusStyle(vendor.status)}`}>{vendor.status}</span>
                       </td>
                       <td className="font-bold text-slate-950 dark:text-white">{vendor.orders}</td>
                       <td className="font-bold text-emerald-700 dark:text-emerald-300">{vendor.revenue}</td>
                       <td>
                         <div className={`flex items-center gap-2 font-extrabold ${getDeliveryStyle(vendor.avgDeliveryTime)}`}>
                           <FiClock size={16} />
                           {vendor.avgDeliveryTime} min
                         </div>
                       </td>
                       <td>
                         <div className="min-w-32">
                           <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                             <span>{vendor.onTimeRate}%</span>
                             <span>{vendor.activeRiders} riders</span>
                           </div>
                           <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                             <div className="h-2 rounded-full bg-gradient-to-r from-accent-400 to-accent-500" style={{ width: `${vendor.onTimeRate}%` }} />
                           </div>
                         </div>
                       </td>
                       <td>
                         <div className="flex justify-end gap-2">
                           <button onClick={() => navigate(`/vendors/${vendor.id}`)} className="icon-button" title="View vendor">
                             <FiEye size={16} />
                           </button>
                           <button onClick={() => openEditForm(vendor)} className="icon-button" title="Edit vendor">
                             <FiEdit size={16} />
                           </button>
                           <button onClick={() => deleteVendor(vendor.id)} className="icon-button text-rose-700 dark:text-rose-300" title="Delete vendor">
                             <FiTrash2 size={16} />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {filteredVendors.length > vendorsPerPage && (
                 <div className="mt-6 flex items-center justify-between px-4">
                   <p className="text-sm text-slate-500 dark:text-slate-400">
                     Showing {((currentPage - 1) * vendorsPerPage + 1)} to {
                       Math.min(currentPage * vendorsPerPage, filteredVendors.length)
                     } of {filteredVendors.length} vendors
                   </p>
                   <div className="flex items-center gap-2">
                     <button
                       onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                       disabled={currentPage === 1}
                       className={`rounded-lg px-3 py-2 text-sm font-bold ${
                         currentPage === 1
                           ? 'border border-secondary-200 bg-white/75 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300'
                           : 'bg-primary-500 text-white shadow-[0_12px_24px_-18px_rgba(108,76,241,0.85)] dark:bg-white dark:text-slate-950'
                       }`}
                     >
                       Previous
                     </button>
                     <span className="px-3 py-2 text-sm font-bold">
                       Page {currentPage} of {totalPages}
                     </span>
                     <button
                       onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                       disabled={currentPage === totalPages}
                       className={`rounded-lg px-3 py-2 text-sm font-bold ${
                         currentPage === totalPages
                           ? 'border border-secondary-200 bg-white/75 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300'
                           : 'bg-primary-500 text-white shadow-[0_12px_24px_-18px_rgba(108,76,241,0.85)] dark:bg-white dark:text-slate-950'
                       }`}
                     >
                       Next
                     </button>
                   </div>
                 </div>
               )}
              </>
            )}
          </div>
        {filteredVendors.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
              <FiFilter size={22} />
            </div>
            <p className="mt-3 font-bold text-slate-950 dark:text-white">No vendors found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different search or status filter.</p>
          </div>
        )}
      </section>

{showForm && (
        <Modal onClose={closeForm}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="border-b border-white/20 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="status-pill bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-400/15">
                    Vendor profile
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 dark:text-white">
                    {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Keep the business details clean and track delivery performance from the same profile.
                  </p>
                </div>
                <button type="button" onClick={closeForm} className="icon-button shrink-0">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 modal-scroll">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Shop Image</h3>
                  <div className="mt-4">
                    <label className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-6 cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                      <FiUpload size={20} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {editingVendor?.logo ? 'Change shop image' : 'Upload shop image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        {...register('shopImage')}
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setValue('shopImage', [file]);
                          }
                        }}
                      />
                    </label>
                    {watch('shopImage')?.[0] && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/80 p-2 ring-1 ring-slate-200/80 dark:bg-white/[0.05] dark:ring-white/10">
                        <img
                          src={URL.createObjectURL(watch('shopImage')[0])}
                          alt="Shop preview"
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {editingVendor?.logo ? 'New image will be uploaded on save.' : 'Preview - image will be uploaded on save.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4">Business Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Shop Name">
                      <input {...register('shopName')} required className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Owner Name">
                      <input {...register('owner')} required className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Email">
                      <input type="email" {...register('email')} required className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Phone">
                      <input {...register('phone')} className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Area">
                      <input {...register('area')} className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Latitude">
                      <input
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        {...register('latitude')}
                        placeholder="e.g., 28.6139"
                        className="input-premium h-11 w-full px-4"
                      />
                    </FormField>
                    <FormField label="Longitude">
                      <input
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        {...register('longitude')}
                        placeholder="e.g., 77.2090"
                        className="input-premium h-11 w-full px-4"
                      />
                    </FormField>
                    <FormField label="Category">
                      <select {...register('category')} className="input-premium h-11 w-full px-4">
                        <option value="">Select Category</option>
                        {shopCategories.map(cat => (
                          <option key={cat.id} value={cat.shopCategoryName}>
                            {cat.shopCategoryName}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="GST Number">
                      <input {...register('gstNo')} className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Shop Registration Number">
                      <input {...register('shopRegisterNo')} className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Password">
                      <input type="password" {...register('password')} required className="input-premium h-11 w-full px-4" />
                    </FormField>
                    <FormField label="Status">
                      <select {...register('status')} className="input-premium h-11 w-full px-4">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4">Documents</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Aadhar Front">
                      <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                        <FiUpload size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Aadhar Front</span>
                        <input
                          type="file"
                          accept="image/*"
                          {...register('aadharFront')}
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setValue('aadharFront', [file]);
                          }}
                        />
                      </label>
                      {watch('aadharFront')?.[0] && (
                        <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {watch('aadharFront')[0].name}
                        </p>
                      )}
                    </FormField>
                    <FormField label="Aadhar Back">
                      <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                        <FiUpload size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Aadhar Back</span>
                        <input
                          type="file"
                          accept="image/*"
                          {...register('aadharBack')}
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setValue('aadharBack', [file]);
                          }}
                        />
                      </label>
                      {watch('aadharBack')?.[0] && (
                        <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {watch('aadharBack')[0].name}
                        </p>
                      )}
                    </FormField>
                    <FormField label="Shop Registration Document">
                      <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4 cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                        <FiUpload size={16} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Upload Shop Reg Doc</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          {...register('shopRegisterDoc')}
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setValue('shopRegisterDoc', [file]);
                          }}
                        />
                      </label>
                      {watch('shopRegisterDoc')?.[0] && (
                        <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {watch('shopRegisterDoc')[0].name}
                        </p>
                      )}
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/20 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
              <button type="button" onClick={closeForm} className="ghost-button flex-1">
                Cancel
              </button>
              <button type="submit" className="premium-button flex-1">
                {editingVendor ? 'Update Vendor' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </Modal>
      )}

        
    </div>
  );
};

export default Vendors;
