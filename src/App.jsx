import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { toggleTheme } from './redux/themeSlice';
import Layout from './layouts/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/vendors/Vendors';
import VendorDetail from './pages/vendors/VendorDetail';
import Categories from './pages/categories/Categories';
import StoreCategories from './pages/categories/StoreCategories';
import Products from './pages/products/Products';
import Orders from './pages/orders/Orders';
import Customers from './pages/customers/Customers';
import Settings from './pages/settings/Settings';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.theme);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    dispatch(toggleTheme(savedTheme));
  }, [dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/*" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:id" element={<VendorDetail />} />
<Route path="categories" element={<Categories />} />
          <Route path="store-categories" element={<StoreCategories />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;