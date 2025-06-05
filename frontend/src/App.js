import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { authAPI } from './services/api';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import SellerPanel from './components/SellerPanel';
import AddProduct from './components/AddProduct';
import CustomerOrders from './components/CustomerOrders';
import AdminUserManagement from './components/Admin/UserManagement';
import Profile from './components/Profile'; // Bu import eksikti

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          await authAPI.getProfile();
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Cart loading error:', error);
          localStorage.removeItem('cart');
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // handleUserUpdate fonksiyonu eklendi
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCart([]);
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <h4>KolaySatış Yükleniyor...</h4>
          <p className="text-muted">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          cartItemCount={cart.reduce((total, item) => total + item.quantity, 0)}
        />
        
        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={<Home addToCart={addToCart} />} 
            />
            
            <Route 
              path="/products" 
              element={<ProductList addToCart={addToCart} />} 
            />
            
            <Route 
              path="/products/:id" 
              element={<ProductDetail addToCart={addToCart} />} 
            />
            
            <Route 
              path="/cart" 
              element={
                <Cart 
                  cart={cart}
                  updateQuantity={updateCartQuantity}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  user={user}
                />
              } 
            />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                user ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            
            <Route 
              path="/register" 
              element={
                user ? 
                <Navigate to="/dashboard" replace /> : 
                <Register onLogin={handleLogin} />
              } 
            />

            {/* Protected User Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? 
                <Dashboard user={user} /> : 
                <Navigate to="/login" replace />
              } 
            />

            {/* Profile Route - Tüm kullanıcılar erişebilir */}
            <Route 
              path="/profile" 
              element={
                user ? 
                <Profile user={user} onUserUpdate={handleUserUpdate} /> : 
                <Navigate to="/login" replace />
              } 
            />

            {/* Customer Orders Route - Sadece müşteriler */}
            <Route 
              path="/orders" 
              element={
                user ? 
                <CustomerOrders user={user} /> : 
                <Navigate to="/login" replace />
              } 
            />

            {/* Seller Routes */}
            <Route 
              path="/seller/*" 
              element={
                user && (user.role === 'seller' || user.role === 'admin') ? 
                <SellerPanel user={user} /> : 
                <Navigate to="/" replace />
              } 
            />

            {/* Add Product Route (Seller) */}
            <Route 
              path="/seller/products/new" 
              element={
                user && (user.role === 'seller' || user.role === 'admin') ? 
                <AddProduct user={user} /> : 
                <Navigate to="/" replace />
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                user && user.role === 'admin' ? 
                <AdminPanel user={user} /> : 
                <Navigate to="/" replace />
              } 
            />

            {/* Admin User Management Route */}
            <Route 
              path="/admin/users" 
              element={
                user && user.role === 'admin' ? 
                <AdminUserManagement /> : 
                <Navigate to="/" replace />
              } 
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="container mt-5 text-center">
                  <div className="display-1 mb-3">🤔</div>
                  <h1>404 - Sayfa Bulunamadı</h1>
                  <p className="text-muted">Aradığınız sayfa mevcut değil.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    ← Geri Dön
                  </button>
                </div>
              } 
            />
          </Routes>
        </main>
        
        <Footer />
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
};

export default App;