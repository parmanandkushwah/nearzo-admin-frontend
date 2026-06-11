import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiEye,
  FiFilter,
  FiMoreVertical,
  FiRefreshCw,
  FiShoppingBag,
  FiShoppingCart,
  FiTruck,
  FiUsers
} from 'react-icons/fi';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    kpis: [],
    revenueData: [],
    vendorMix: [],
    orderPipeline: [],
    topVendors: [],
    alerts: []
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const authHeaders = {
          Authorization: `Bearer ${token}`
        };

        const [statsRes, salesRes, vendorMixRes, alertsRes] = await Promise.all([
          api.get('/dashboard/stats', { headers: authHeaders }),
          api.get('/dashboard/sales', { headers: authHeaders }),
          api.get('/dashboard/vendor-mix', { headers: authHeaders }),
          api.get('/dashboard/alerts', { headers: authHeaders })
        ]);

        const stats = statsRes.data;
        const sales = salesRes.data;
        const vendorMix = vendorMixRes.data;
        const alerts = alertsRes.data;

        if (!stats.success) {
          throw new Error(`Failed to fetch dashboard stats: ${statsRes.status}`);
        }

        if (stats.success) {
            setStats(stats);
            setDashboardData(prev => ({
              ...prev,
              kpis: [
                {
                  title: 'Gross Merchandise Value',
                  value: `Rs ${(stats.stats.monthlyRevenue || 0).toFixed(2)}`,
                  change: stats.kpiChanges?.revenueChange || '+12.8%',
                  caption: 'vs last month',
                  icon: FiDollarSign,
                  tone: 'teal'
                },
                {
                  title: 'Orders Processed',
                  value: stats.stats.totalOrders.toLocaleString(),
                  change: stats.kpiChanges?.ordersChange || '+8.3%',
                  caption: `${stats.stats.dailyOrders} today`,
                  icon: FiShoppingCart,
                  tone: 'slate'
                },
                {
                  title: 'Active Vendors',
                  value: stats.stats.totalVendors.toString(),
                  change: stats.kpiChanges?.vendorsChange || '+5.1%',
                  caption: `${stats.stats.pendingVendors} pending review`,
                  icon: FiTruck,
                  tone: 'amber'
                },
                {
                  title: 'Customer Base',
                  value: stats.stats.totalUsers.toLocaleString(),
                  change: stats.kpiChanges?.customersChange || '+16.2%',
                  caption: `${stats.newCustomersThisMonth?.toLocaleString() || '1,042'} new this month`,
                  icon: FiUsers,
                  tone: 'indigo'
                }
              ],
              orderPipeline: [
                { label: 'Placed', value: stats.stats.orderPipeline.placed, icon: FiShoppingBag, color: 'bg-white/15 text-white ring-1 ring-white/15' },
                { label: 'Packed', value: stats.stats.orderPipeline.packed, icon: FiBox, color: 'bg-accent-400 text-[#1F2937]' },
                { label: 'In Transit', value: stats.stats.orderPipeline.inTransit, icon: FiTruck, color: 'bg-white text-primary-700' },
                { label: 'Attention', value: stats.stats.orderPipeline.attention, icon: FiAlertTriangle, color: 'bg-rose-500 text-white' }
              ],
              topVendors: stats.stats.topVendors || []
            }));
          }

        if (sales.success) {
          setDashboardData(prev => ({ ...prev, revenueData: sales.salesData }));
        }

        if (vendorMix.success) {
          setDashboardData(prev => ({ ...prev, vendorMix: vendorMix.vendorMix }));
        }

        if (alerts.success) {
          setDashboardData(prev => ({ ...prev, alerts: alerts.alerts }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // If token is invalid, redirect to login
        if (error.message && error.message.includes('401')) {
          // Dispatch logout or redirect - for now just clear token and reload
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toneClasses = {
    teal: 'bg-primary-50 text-primary-700 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-200 dark:ring-primary-400/15',
    slate: 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-white/10 dark:text-slate-100 dark:ring-white/10',
    amber: 'bg-accent-50 text-accent-700 ring-accent-100 dark:bg-accent-400/10 dark:text-accent-200 dark:ring-accent-400/15',
    indigo: 'bg-secondary-100 text-primary-700 ring-secondary-200 dark:bg-primary-400/10 dark:text-primary-200 dark:ring-primary-400/15'
  };

  const navigate = useNavigate();

  const handleAlertAction = (type) => {
    switch (type) {
      case 'Review':
        navigate('/vendors');
        break;
      case 'Act':
        navigate('/orders');
        break;
      case 'Watch':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const KpiCard = ({ item }) => {
    const Icon = item.icon;

    return (
      <div className="panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ring-1 ${toneClasses[item.tone]}`}>
            <Icon size={21} />
          </div>
          <span className="status-pill bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <FiArrowUpRight size={13} />
            {item.change}
          </span>
        </div>
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.title}</p>
          <h3 className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{item.value}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.caption}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="brand-hero rounded-lg text-white">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-7">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Live marketplace</span>
              <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Multi vendor operations</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Monitor vendor quality, dispatch performance, revenue health, and customer activity from one polished operations view.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="premium-button bg-white from-white to-secondary-100 text-primary-700 hover:from-white hover:to-white">
                <FiEye size={17} />
                View Analytics
              </button>
              <button className="ghost-button border-white/[0.12] bg-white/[0.08] text-white hover:bg-white/[0.12]">
                <FiDownload size={17} />
                Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {dashboardData.orderPipeline.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-[0_18px_36px_-34px_rgba(0,0,0,0.8)]">
                  <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-2xl font-extrabold">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-white/60">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData.kpis.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
         <div className="panel p-5 sm:p-6">
           <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
             <div>
               <h2 className="font-display text-xl font-extrabold text-slate-950 dark:text-white">Revenue Momentum</h2>
               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Weekly GMV and order volume by day</p>
             </div>
             <div className="flex gap-2">
               <button className="ghost-button px-3">
                 <FiFilter size={16} />
                 This week
               </button>
               <button className="icon-button">
                 <FiMoreVertical size={18} />
               </button>
             </div>
           </div>

           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={dashboardData.revenueData} margin={{ left: -10, right: 10, top: 12, bottom: 0 }}>
                 <defs>
                   <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6C4CF1" stopOpacity={0.35} />
                     <stop offset="95%" stopColor="#6C4CF1" stopOpacity={0.02} />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                 <Tooltip
                   cursor={{ stroke: '#6C4CF1', strokeWidth: 1 }}
                   contentStyle={{
                     border: '1px solid rgba(148, 163, 184, 0.28)',
                     borderRadius: '8px',
                     boxShadow: '0 18px 44px -28px rgba(15, 23, 42, 0.55)'
                   }}
                 />
                 <Area type="monotone" dataKey="revenue" stroke="#6C4CF1" strokeWidth={3} fill="url(#revenueGradient)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </div>

         <div className="panel p-5 sm:p-6">
           <div className="mb-6 flex items-center justify-between">
             <div>
               <h2 className="font-display text-xl font-extrabold text-slate-950 dark:text-white">Vendor Mix</h2>
               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Share by active categories</p>
             </div>
             <button className="icon-button">
               <FiRefreshCw size={17} />
             </button>
           </div>

           <div className="grid items-center gap-4 sm:grid-cols-[0.95fr_1fr] xl:grid-cols-1 2xl:grid-cols-[0.95fr_1fr]">
             <div className="h-56">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={dashboardData.vendorMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                     {dashboardData.vendorMix.map((entry) => (
                       <Cell key={entry.name} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip
                     contentStyle={{
                       border: '1px solid rgba(148, 163, 184, 0.28)',
                       borderRadius: '8px'
                     }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>

             <div className="space-y-3">
               {dashboardData.vendorMix.map((item) => (
                 <div key={item.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                     <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                   </div>
                   <span className="text-sm font-extrabold text-slate-950 dark:text-white">{item.value}%</span>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </section>

       <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
         <div className="panel p-5 sm:p-6">
           <div className="mb-5 flex items-center justify-between">
             <div>
               <h2 className="font-display text-xl font-extrabold text-slate-950 dark:text-white">Top Vendor Health</h2>
               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Revenue, ratings, and fulfillment strength</p>
             </div>
             <button className="ghost-button px-3 cursor-pointer" onClick={() => navigate('/vendors')}>Manage</button>
           </div>

           <div className="space-y-4">
             {dashboardData.topVendors.map((vendor) => (
               <div key={vendor.name} className="soft-panel p-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-3">
                     <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-white dark:text-slate-950">
                       <FiShoppingBag size={18} />
                     </div>
                     <div>
                       <p className="font-bold text-slate-950 dark:text-white">{vendor.name}</p>
                       <p className="text-sm text-slate-500 dark:text-slate-400">{vendor.area}</p>
                     </div>
                   </div>
                   <div className="flex gap-5 text-right">
                     <div>
                       <p className="text-xs font-bold uppercase text-slate-400">Revenue</p>
                       <p className="font-extrabold text-slate-950 dark:text-white">{vendor.revenue}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold uppercase text-slate-400">Rating</p>
                       <p className="font-extrabold text-slate-950 dark:text-white">{vendor.rating}</p>
                     </div>
                   </div>
                 </div>
                 <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                   <div className="h-2 rounded-full bg-gradient-to-r from-accent-400 to-accent-500" style={{ width: `${vendor.health}%` }} />
                 </div>
               </div>
             ))}
           </div>
         </div>

         <div className="panel p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-950 dark:text-white">Operations Queue</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">High-priority items for admin action</p>
              </div>
              <span className="status-pill bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">{dashboardData.alerts.length} alerts</span>
            </div>

            <div className="space-y-3">
              {dashboardData.alerts.map((alert) => {
                const Icon = alert.icon === 'FiClock' ? FiClock :
                            alert.icon === 'FiAlertTriangle' ? FiAlertTriangle :
                            FiCreditCard;

                return (
                  <div key={alert.title} className="soft-panel flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-primary-700 dark:bg-primary-400/10 dark:text-primary-200">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950 dark:text-white">{alert.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{alert.meta}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAlertAction(alert.type)}
                      className="ghost-button shrink-0 px-3 cursor-pointer"
                    >{alert.type}</button>
                  </div>
                );
              })}
            </div>
          </div>
       </section>

        <section className="panel p-5 sm:p-6">
           <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
             <div>
               <h2 className="font-display text-xl font-extrabold text-slate-950 dark:text-white">Fulfillment Snapshot</h2>
               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Orders, payment stability, and dispatch quality</p>
             </div>
             <span className="status-pill bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
               <FiCheckCircle size={13} />
               {stats?.stats?.fulfillmentHealth?.toFixed(1) || 96.4}% healthy
             </span>
           </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.revenueData} margin={{ left: -10, right: 10, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid rgba(148, 163, 184, 0.28)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="orders" radius={[8, 8, 0, 0]} fill="#32D39A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    );
  };

export default Dashboard;