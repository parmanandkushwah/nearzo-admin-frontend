import React, { Fragment, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { FiEye, FiEdit, FiTruck, FiCheck, FiMoreVertical, FiSearch, FiX, FiPackage, FiUser, FiMapPin, FiClock, FiShoppingBag, FiCreditCard, FiCalendar, FiChevronLeft, FiChevronRight, FiShoppingCart, FiDollarSign, FiFileText, FiStar, FiMail } from 'react-icons/fi';

const initialOrder = {
  id: 1,
  orderNo: 'ORD-001',
  status: 'delivered',
  date: '2024-01-15',
  time: '14:30',
  amount: '₹450',
  customer: {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh@example.com',
    address: '123 Main Street, Apartment 4B, New Delhi - 110001'
  },
  store: {
    name: 'Fresh Mart',
    ownerName: 'Mr. Suresh Mishra',
    phone: '+91 11 2345 6789',
    email: 'freshmart@store.com',
    address: '456 Market Road, New Delhi - 110001',
    rating: 4.8
  },
  deliveryBoy: {
    name: 'Amit Verma',
    phone: '+91 98765 12345',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    vehicle: 'Bike',
    vehicleNo: 'DL-01-AB-1234'
  },
  items: [
    { id: 1, name: 'Basmati Rice', price: 120, quantity: 1, mrp: 150, image: 'https://images.unsplash.com/photo-1586201375465-8dbc6b5d5c5c?w=100' },
    { id: 2, name: 'Fresh Apples', price: 200, quantity: 1, mrp: 250, image: 'https://images.unsplash.com/photo-1560806887-1e4cd05dce4a?w=100' }
  ],
  tracking: [
    { status: 'Order Placed', time: '14:30, Jan 15', completed: true },
    { status: 'Order Confirmed', time: '14:35, Jan 15', completed: true },
    { status: 'Preparing Order', time: '14:40, Jan 15', completed: true },
    { status: 'Out for Delivery', time: '15:15, Jan 15', completed: true },
    { status: 'Delivered', time: '15:45, Jan 15', completed: true }
  ]
};

const Orders = () => {
const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, processing: 0, shipped: 0 });

    // Fetch orders stats (for summary cards)
    useEffect(() => {
       const fetchOrderStats = async () => {
         try {
           const token = localStorage.getItem('token');
           const response = await api.get('/admin/orders/stats', {
             headers: {
               Authorization: `Bearer ${token}`
             }
           });

           if (response.data.success) {
             setStats(response.data.stats);
           }
         } catch (error) {
           console.error('Failed to fetch order stats:', error);
         }
       };

       fetchOrderStats();
    }, []);

    // Fetch paginated orders for table
    useEffect(() => {
       const fetchOrders = async () => {
         try {
           setLoading(true);
           const token = localStorage.getItem('token');
           const response = await api.get('/admin/orders', {
             headers: {
               Authorization: `Bearer ${token}`
             },
             params: {
               search,
               page: currentPage,
               limit: itemsPerPage
             }
           });

           if (response.data.success) {
             setOrders(response.data.orders);
             setTotalPages(response.data.pagination.totalPages);
             setTotalOrders(response.data.pagination.total);
           }
         } catch (error) {
           console.error('Failed to fetch orders:', error);
         } finally {
           setLoading(false);
         }
       };

       const timer = setTimeout(fetchOrders, 300); // Debounce
       return () => clearTimeout(timer);
     }, [search, currentPage, itemsPerPage]);

    const getStatusColor = (status) => {
     switch (status) {
       case 'delivered': return 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300';
       case 'pending': return 'bg-yellow-500/15 text-yellow-700 ring-1 ring-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-300';
       case 'processing': return 'bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300';
       case 'shipped': return 'bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300';
       default: return 'bg-slate-100/50 text-slate-600';
     }
   };

   const formatCurrency = (amount) => {
     const value = Number(amount) || 0;
     const formatted = Math.abs(value).toLocaleString('en-IN');
     return value < 0 ? `-₹${formatted}` : `₹${formatted}`;
   };

   const getOrderTracking = (status) => {
     const steps = [
       { label: 'Order Placed', key: 'pending' },
       { label: 'Order Confirmed', key: 'confirmed' },
       { label: 'Preparing Order', key: 'processing' },
       { label: 'Out for Delivery', key: 'out_for_delivery' },
       { label: 'Delivered', key: 'delivered' }
     ];

     const currentIndex = steps.findIndex(step => step.key === status);
     return steps.map((step, idx) => ({
       status: step.label,
       completed: currentIndex >= idx && currentIndex !== -1,
       time: ''
     }));
   };

   const filteredOrders = useMemo(() => {
     if (!search) return orders;
     return orders.filter(o => 
       o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
       o.customer.toLowerCase().includes(search.toLowerCase())
     );
   }, [orders, search]);

   // For pagination info display
   const shownOrders = orders.length;

  const openModal = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const updateStatus = (id, newStatus) => {
    setOrders(items => items.map(o => o.id === id ? { ...o, status: newStatus } : o));
    closeModal();
  };

  const Modal = ({ order, onClose }) => {
    const subtotal = order.subtotal != null ? parseFloat(order.subtotal) : order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const discount = order.discount != null ? parseFloat(order.discount) : 0;
    const deliveryCharge = order.deliveryCharge != null ? parseFloat(order.deliveryCharge) : 0;
    const gst = order.tax != null ? parseFloat(order.tax) : 0;
    const commission = order.commission != null ? parseFloat(order.commission) : 0;
    const totalBill = order.total != null ? parseFloat(order.total) : subtotal - discount + deliveryCharge + gst;

    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px]" />
        <div className="relative z-10 h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border-2 border-white/30 bg-gradient-to-br from-white/85 to-slate-50/85 shadow-2xl shadow-slate-950/50 dark:border-white/20 dark:from-slate-800/85 dark:to-slate-900/85" onClick={(e) => e.stopPropagation()}>
          <div className="flex h-full flex-col">
            <div className="border-b border-white/30 bg-gradient-to-r from-cyan-50/70 to-blue-50/70 px-6 py-5 dark:border-white/20 dark:from-cyan-900/30 dark:to-blue-900/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="status-pill bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200 shadow-sm dark:bg-cyan-400/20 dark:text-cyan-200 dark:ring-cyan-400/30">
                    Order Details
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 dark:text-white">
                    {order.orderNo}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Placed on {order.date} at {order.time}
                  </p>
                </div>
                <button onClick={onClose} className="icon-button shrink-0">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 modal-scroll">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border-2 border-cyan-200/50 bg-gradient-to-br from-cyan-50/80 to-blue-50/80 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-xl dark:border-cyan-400/30 dark:from-cyan-900/40 dark:to-blue-900/40">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                      <FiUser size={18} className="text-cyan-600" /> Customer Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold text-slate-700">Name:</span> {order.customer}</p>
                      <p><span className="font-semibold text-slate-700">Phone:</span> {order.customerPhone}</p>
                      <p><span className="font-semibold text-slate-700">Delivery Address:</span> {order.customerAddress || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-5 shadow-xl shadow-emerald-500/10 backdrop-blur-xl dark:border-emerald-400/30 dark:from-emerald-900/40 dark:to-teal-900/40">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                      <FiMapPin size={18} className="text-emerald-600" /> Store Information
                    </h3>
                    {order.storeInfo && (
                      <div className="space-y-1.5 text-sm">
                        <p><span className="font-semibold text-slate-700">Shop Name:</span> {order.storeInfo.name}</p>
                        <p><span className="font-semibold text-slate-700">Owner Name:</span> {order.storeInfo.ownerName}</p>
                        <p><span className="font-semibold text-slate-700">Mobile:</span> {order.storeInfo.phone}</p>
                        <p><span className="font-semibold text-slate-700">Email:</span> {order.storeInfo.email}</p>
                        <p><span className="font-semibold text-slate-700">Address:</span> {order.storeInfo.address}</p>
                      </div>
                    )}
                  </div>
</div>

                  {order.deliveryBoyInfo && (
                    <div className="rounded-xl border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-5 shadow-xl shadow-amber-500/10 backdrop-blur-xl dark:border-amber-400/30 dark:from-amber-900/40 dark:to-orange-900/40">
                      <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                        <FiTruck size={18} className="text-amber-600" /> Delivery Boy Profile
                      </h3>
                      <div className="flex items-start gap-4">
                        <img 
                          src={order.deliveryBoyInfo.image} 
                          alt={order.deliveryBoyInfo.name}
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-300 shadow-md"
                        />
                        <div className="flex-1 space-y-1.5 text-sm">
                          <p className="font-semibold text-slate-950 dark:text-white text-base">{order.deliveryBoyInfo.name}</p>
                          <p><span className="font-semibold text-slate-700">Mobile:</span> {order.deliveryBoyInfo.phone}</p>
                          <p><span className="font-semibold text-slate-700">Vehicle:</span> {order.deliveryBoyInfo.vehicle} ({order.deliveryBoyInfo.vehicleNo})</p>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-700">Rating:</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={i < Math.floor(order.deliveryBoyInfo.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} size={14} />
                              ))}
                            </div>
                            <span className="text-slate-600">({order.deliveryBoyInfo.rating})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-5 shadow-xl shadow-purple-500/10 backdrop-blur-xl dark:border-purple-400/30 dark:from-purple-900/40 dark:to-pink-900/40">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                      <FiShoppingCart size={18} className="text-purple-600" /> Order Items
                    </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Item</th>
                          <th className="text-center py-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Qty</th>
                          <th className="text-right py-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Price</th>
                          <th className="text-right py-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                                <span className="font-medium text-slate-800 dark:text-white">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-3 px-2 text-right text-slate-600">{formatCurrency(item.price)}</td>
                            <td className="py-3 px-2 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
</div>

                  <div className="rounded-xl border-2 border-cyan-200/50 bg-gradient-to-br from-cyan-50/80 to-blue-50/80 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-xl dark:border-cyan-400/30 dark:from-cyan-900/40 dark:to-blue-900/40">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                      <FiCreditCard size={18} className="text-cyan-600" /> Payment Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Status:</span>
                        <span className="font-medium capitalize">{order.paymentStatus || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Method:</span>
                        <span className="font-medium uppercase">{order.paymentMethod || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-rose-200/50 bg-gradient-to-br from-rose-50/80 to-red-50/80 p-5 shadow-xl shadow-rose-500/10 backdrop-blur-xl dark:border-rose-400/30 dark:from-rose-900/40 dark:to-red-900/40">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                      <FiFileText size={18} className="text-rose-600" /> Billing Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span className="font-medium">{discount ? `- ${formatCurrency(discount)}` : formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Delivery Charge:</span>
                        <span className="font-medium">{formatCurrency(deliveryCharge)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">GST (5%):</span>
                        <span className="font-medium">{formatCurrency(gst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission:</span>
                        <span className="font-medium">{formatCurrency(commission)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-3 flex justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Total Bill:</span>
                        <span className="font-bold text-xl text-emerald-700 dark:text-emerald-300">{formatCurrency(totalBill)}</span>
                      </div>
                    </div>
                  </div>

<div className="rounded-xl border-2 border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/80 p-5 shadow-xl shadow-violet-500/10 backdrop-blur-xl dark:border-violet-400/30 dark:from-violet-900/40 dark:to-purple-900/40">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                      <FiPackage size={18} className="text-violet-600" /> Order Tracking
                    </h3>
                    <div className="px-2">
                      <div className="flex items-center justify-between">
                        {(order.tracking ?? getOrderTracking(order.status)).map((track, idx, trackingArray) => (
                          <Fragment key={idx}>
                            <div className="flex flex-col items-center">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${track.completed ? 'border-violet-500 bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300' : 'border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-800'}`}>
                                {track.completed ? <FiCheck size={18} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                              </div>
                              <p className={`mt-2 text-xs font-semibold text-center ${track.completed ? 'text-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'} max-w-20`}>{track.status}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{track.time}</p>
                            </div>
                            {idx < trackingArray.length - 1 && (
                              <div className={`flex-1 h-1 mx-2 ${track.completed && trackingArray[idx + 1]?.completed ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/30 bg-gradient-to-r from-slate-50/70 to-white/70 p-5 backdrop-blur dark:border-white/20 dark:from-slate-900/40 dark:to-slate-800/40">
              <button onClick={onClose} className="ghost-button flex-1">
                Close
              </button>
              {order.status === 'pending' && (
                <button onClick={() => updateStatus(order.id, 'processing')} className="premium-button flex-1">
                  Start Processing
                </button>
              )}
              {order.status === 'processing' && (
                <button onClick={() => updateStatus(order.id, 'shipped')} className="premium-button flex-1">
                  Mark Shipped
                </button>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="brand-hero flex flex-col justify-between gap-4 rounded-lg p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Order Management</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Real-time Tracking</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Monitor and manage all customer orders with detailed tracking and delivery information.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
            <FiPackage size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Orders</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All time orders</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300">
            <FiCheck size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Delivered</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{stats.delivered}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completed orders</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100 dark:bg-yellow-400/10 dark:text-yellow-300">
            <FiClock size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Pending</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Awaiting processing</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-400/10 dark:text-blue-300">
            <FiPackage size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Processing</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-blue-700 dark:text-blue-300">{stats.processing}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">In progress</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300">
            <FiTruck size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Shipped</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-violet-700 dark:text-violet-300">{stats.shipped}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">On the way</p>
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
              placeholder="Search orders..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {filteredOrders.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-4 px-3 font-semibold">Order No</th>
                <th className="text-left py-4 px-3 font-semibold">Customer</th>
                <th className="text-left py-4 px-3 font-semibold">Store</th>
                <th className="text-left py-4 px-3 font-semibold">Items</th>
                <th className="text-left py-4 px-3 font-semibold">Amount</th>
                <th className="text-left py-4 px-3 font-semibold">Status</th>
                <th className="text-right py-4 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
             <tbody>
               {orders.map((order) => (
                 <tr key={order.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
                   <td className="py-4 px-3 font-medium">{order.orderNo}</td>
                   <td className="py-4 px-3">
                     <div>
                       <p className="font-medium text-slate-950 dark:text-white">{order.customer}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{order.customerPhone}</p>
                     </div>
                   </td>
                   <td className="py-4 px-3 text-slate-600 dark:text-slate-400">{order.store}</td>
                   <td className="py-4 px-3 text-slate-600 dark:text-slate-400">{order.itemsCount} items</td>
                   <td className="py-4 px-3 font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(order.amount)}</td>
                   <td className="py-4 px-3">
                     <span className={`status-pill capitalize ${getStatusColor(order.status)}`}>
                       {order.status}
                     </span>
                   </td>
                   <td className="py-4 px-3 text-right">
                     <button onClick={() => openModal(order)} className="ghost-button">
                       <FiEye size={16} />
                     </button>
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
                 Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
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

      {selectedOrder && <Modal order={selectedOrder} onClose={closeModal} />}
    </div>
  );
};

export default Orders;