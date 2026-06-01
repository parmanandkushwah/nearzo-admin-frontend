import React, { useState, useMemo } from 'react';
import { FiEdit, FiTrash2, FiUserX, FiUserCheck, FiMoreVertical, FiSearch, FiChevronLeft, FiChevronRight, FiUsers, FiUser, FiMail, FiPhone, FiShoppingBag, FiCalendar } from 'react-icons/fi';

const initialCustomers = [
  { 
    id: 1, 
    name: 'Rajesh Kumar', 
    email: 'rajesh@example.com', 
    phone: '+91 98765 43210', 
    status: 'active', 
    orders: 12,
    joinDate: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  { 
    id: 2, 
    name: 'Priya Sharma', 
    email: 'priya@example.com', 
    phone: '+91 98765 43211', 
    status: 'active', 
    orders: 8,
    joinDate: '2024-02-20',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  { 
    id: 3, 
    name: 'Amit Patel', 
    email: 'amit@example.com', 
    phone: '+91 98765 43212', 
    status: 'inactive', 
    orders: 5,
    joinDate: '2024-03-10',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  },
  { 
    id: 4, 
    name: 'Neha Singh', 
    email: 'neha@example.com', 
    phone: '+91 98765 43213', 
    status: 'active', 
    orders: 15,
    joinDate: '2024-01-05',
    avatar: 'https://images.unsplash.com/photo-1438761681033-64cee37d32f2?w=100&h=100&fit=crop'
  },
  { 
    id: 5, 
    name: 'Suresh Verma', 
    email: 'suresh@example.com', 
    phone: '+91 98765 43214', 
    status: 'active', 
    orders: 3,
    joinDate: '2024-04-01',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
];

const Customers = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300'
      : 'bg-red-500/15 text-red-700 ring-1 ring-red-500/20 dark:bg-red-400/10 dark:text-red-300';
  };

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
    return { total, active, inactive, totalOrders };
  }, [customers]);

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
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {filteredCustomers.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={customer.avatar} 
                        alt={customer.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{customer.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-slate-600 dark:text-slate-400">{customer.phone}</td>
                  <td className="py-4 px-3">
                    <span className="font-semibold text-slate-950 dark:text-white">{customer.orders}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400"> orders</span>
                  </td>
                  <td className="py-4 px-3 text-slate-600 dark:text-slate-400">{customer.joinDate}</td>
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
                      <button className={`icon-button ${
                        customer.status === 'active' 
                          ? 'text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20' 
                          : 'text-emerald-600 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20'
                      }`}>
                        {customer.status === 'active' ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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