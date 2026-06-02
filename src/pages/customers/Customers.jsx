import React, { useState, useEffect, useMemo } from 'react';
import { FiEdit, FiTrash2, FiUserX, FiUserCheck, FiMoreVertical, FiSearch, FiChevronLeft, FiChevronRight, FiUsers, FiUser, FiMail, FiPhone, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('No auth token found - using empty customer list');
          setCustomers([]);
          return;
        }

        const response = await api.get('/admin/customers', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 }
        });

        if (response.data.success) {
          setCustomers(response.data.customers);
        } else {
          console.error('API returned error:', response.data.message);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error.response?.data || error.message);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch = [customer.name, customer.email, customer.phone]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const totalOrders = customers.reduce((sum, c) => sum + (c.orders || 0), 0);
    return { total, active, inactive, totalOrders };
  }, [customers]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(
        `/admin/customers/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCustomers((current) =>
          current.map((customer) =>
            customer.id === id ? { ...customer, status } : customer
          )
        );
      }
    } catch (error) {
      console.error('Failed to update customer status:', error);
      alert('Failed to update customer status');
    }
  };

  const deleteCustomer = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this customer?')) {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await api.delete(`/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCustomers((current) => current.filter((customer) => customer.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer');
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300'
      : 'bg-red-500/15 text-red-700 ring-1 ring-red-500/20 dark:bg-red-400/10 dark:text-red-300';
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="brand-hero flex flex-col justify-between gap-4 rounded-lg p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Customer Management</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">All Customers</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Customers</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Manage customer accounts, view purchase history, and track engagement.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
            <FiUsers size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Customers</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.total}</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300">
            <FiUserCheck size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Active</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{stats.active}</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300">
            <FiShoppingBag size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Orders</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-amber-700 dark:text-amber-300">{stats.totalOrders}</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300">
            <FiUser size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Inactive</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-violet-700 dark:text-violet-300">{stats.inactive}</p>
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
              placeholder="Search customers..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${
                  statusFilter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {status}
              </button>
            ))}
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {filteredCustomers.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-3 text-slate-600 dark:text-slate-400">Loading customers...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-4 px-3 font-semibold">Customer</th>
                  <th className="text-left py-4 px-3 font-semibold">Contact</th>
                  <th className="text-left py-4 px-3 font-semibold">Orders</th>
                  <th className="text-left py-4 px-3 font-semibold">Join Date</th>
                  <th className="text-left py-4 px-3 font-semibold">Status</th>
                  <th className="text-right py-4 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center">
                      <FiSearch size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">No customers found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try a different search or filter.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-2 ring-slate-200">
                            <FiUser size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-white">{customer.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-slate-600 dark:text-slate-400">{customer.phone || '-'}</td>
                      <td className="py-4 px-3">
                        <span className="font-semibold text-slate-950 dark:text-white">{customer.orders || 0}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400"> orders</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 dark:text-slate-400">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`status-pill capitalize ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="icon-button">
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => updateStatus(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
                            className={`icon-button ${
                              customer.status === 'active' 
                                ? 'text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20' 
                                : 'text-emerald-600 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            {customer.status === 'active' ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                          </button>
                          <button 
                            onClick={() => deleteCustomer(customer.id)}
                            className="icon-button text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 dark:border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="icon-button h-9 w-9 disabled:opacity-50"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="icon-button h-9 w-9 disabled:opacity-50"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Customers;