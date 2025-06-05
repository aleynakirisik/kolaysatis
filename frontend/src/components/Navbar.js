import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Navbar = ({ user, onLogout, cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
      navigate('/');
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'seller': return '🏪';
      case 'customer': return '👤';
      default: return '👤';
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'seller': return 'Satıcı';
      case 'customer': return 'Müşteri';
      default: return 'Kullanıcı';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/">
          <span className="me-2">🛒</span>
          KolaySatis
        </Link>

        {/* Toggle button for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar items */}
        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setIsCollapsed(true)}>
                🏠 Ana Sayfa
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products" onClick={() => setIsCollapsed(true)}>
                📦 Ürünler
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard" onClick={() => setIsCollapsed(true)}>
                    📊 Dashboard
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin" onClick={() => setIsCollapsed(true)}>
                      👑 Admin Panel
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          {/* Right side items */}
          <ul className="navbar-nav">
            {user ? (
              <>
                {/* Sepet */}
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/cart" onClick={() => setIsCollapsed(true)}>
                    🛒 Sepet
                    {cartItemCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                </li>

                {/* User dropdown */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    id="userDropdown"
                  >
                    <span className="me-1">{getRoleIcon(user.role)}</span>
                    {user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <div className="dropdown-item-text">
                        <small className="text-muted">
                          {getRoleName(user.role)} - {user.email}
                        </small>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/dashboard">
                        📊 Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        👤 Profil
                      </Link>
                    </li>
                    {user.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item" to="/admin">
                          👑 Admin Panel
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                        type="button"
                      >
                        🚪 Çıkış Yap
                      </button>
                    </li>
                  </ul>
                </li>

                {/* Mobil için direkt çıkış butonu */}
                <li className="nav-item d-lg-none">
                  <button 
                    className="nav-link btn btn-link text-danger"
                    onClick={handleLogout}
                    type="button"
                  >
                    🚪 Çıkış Yap
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setIsCollapsed(true)}>
                    🔐 Giriş Yap
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={() => setIsCollapsed(true)}>
                    📝 Kayıt Ol
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Bootstrap dropdown için gerekli script */}
      <script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossOrigin="anonymous"
      ></script>
    </nav>
  );
};

export default Navbar;