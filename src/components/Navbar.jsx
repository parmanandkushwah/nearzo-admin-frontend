import React from 'react';
import { FiBell, FiCalendar, FiCommand, FiMenu, FiMoon, FiSearch, FiSun, FiUser } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, isMobile }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  return (
    <header className="sticky top-0 z-10 border-b border-secondary-200/70 bg-white/[0.78] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="icon-button shrink-0"
              title="Open menu"
            >
              <FiMenu size={19} />
            </button>
          )}

          <div className="relative hidden w-full max-w-xl sm:block">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              placeholder="Search vendors, orders, products..."
              className="input-premium h-11 w-full pl-11 pr-28"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-400 lg:flex dark:border-white/10 dark:bg-white/[0.04]">
              <FiCommand size={12} /> K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white/[0.72] px-3 py-2 text-sm font-semibold text-slate-600 md:flex dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <FiCalendar size={16} />
            Tue, May 19
          </div>

          <button
            onClick={() => dispatch(toggleTheme(theme === 'light' ? 'dark' : 'light'))}
            className="icon-button"
            title={theme === 'light' ? 'Use dark theme' : 'Use light theme'}
          >
            {theme === 'light' ? <FiMoon size={19} /> : <FiSun size={19} />}
          </button>

          <button className="icon-button relative" title="Notifications">
            <FiBell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent-400 ring-2 ring-white dark:ring-slate-950" />
          </button>

          <div className="ml-1 flex items-center gap-3 rounded-lg border border-slate-200 bg-white/[0.78] py-1.5 pl-2 pr-3 dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-[0_14px_26px_-18px_rgba(108,76,241,0.8)] dark:bg-white dark:text-slate-950">
              <FiUser size={17} />
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-4 text-slate-900 dark:text-white">Super Admin</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Marketplace ops</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
