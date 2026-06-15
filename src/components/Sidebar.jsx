import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  FiAlertCircle,
  FiBarChart2,
  FiChevronLeft,
  FiGrid,
  FiHome,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiShoppingCart,
  FiTruck,
  FiUsers,
  FiX
} from 'react-icons/fi';
import logo from '../assets/nearzo-logo.png';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: 'Command Center',
      items: [{ path: '/dashboard', icon: FiHome, label: 'Dashboard' }]
    },
    {
      title: 'Marketplace',
      items: [
        { path: '/vendors', icon: FiTruck, label: 'Vendors' },
        { path: '/store-categories', icon: FiShoppingBag, label: 'Store Categories' },
        { path: '/categories', icon: FiGrid, label: 'Product Categories' },
        { path: '/products', icon: FiPackage, label: 'Master Products' },
        { path: '/non-master-products', icon: FiAlertCircle, label: 'Non-Master Products' },
        { path: '/orders', icon: FiShoppingCart, label: 'Orders' },
        { path: '/customers', icon: FiUsers, label: 'Customers' }
      ]
    },
    {
      title: 'Control',
      items: [{ path: '/settings', icon: FiSettings, label: 'Settings' }]
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/10 bg-gradient-to-b from-primary-700 via-primary-600 to-[#1F2937] text-white shadow-[24px_0_70px_-42px_rgba(31,41,55,0.9)]
          lg:relative
          ${isOpen ? 'w-72' : 'w-20'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-all duration-300
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
              <div className="flex h-12 w-48 items-center justify-center ml-5">
                <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
              {isMobile && isOpen ? (
                <button onClick={() => setIsOpen(false)} className="icon-button border-white/10 bg-white/10 text-white hover:bg-white/[0.15]">
                  <FiX size={18} />
                </button>
              ) : null}
            </div>

        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -right-4 top-6 hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:bg-slate-50 lg:flex dark:border-white/10 dark:bg-slate-900 dark:text-white"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FiChevronLeft className={!isOpen ? 'rotate-180' : ''} size={17} />
          </button>
        )}

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {menuGroups.map((group) => (
            <div key={group.title}>
              {isOpen && (
                <p className="mb-2 px-3 text-[11px] font-extrabold uppercase text-teal-100/45">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold
                      ${isActive
                        ? 'bg-white text-primary-700 shadow-[0_18px_34px_-26px_rgba(255,255,255,0.7)]'
                        : 'text-white/70 hover:bg-white/[0.1] hover:text-white'
                      }
                      ${!isOpen ? 'justify-center' : ''}
                    `}
                    title={!isOpen ? item.label : undefined}
                  >
                    <item.icon size={20} />
                    {isOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {isOpen && (
            <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.1] p-3 shadow-[0_18px_34px_-30px_rgba(0,0,0,0.75)]">
              <p className="text-xs font-bold uppercase text-teal-100/55">Today</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-lg font-extrabold">42</p>
                  <p className="text-xs text-white/55">open vendor tasks</p>
                </div>
                <FiBarChart2 className="text-teal-200" size={22} />
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/[0.12] hover:text-white ${!isOpen ? 'justify-center' : ''}`}
            title={!isOpen ? 'Logout' : undefined}
          >
            <FiLogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
