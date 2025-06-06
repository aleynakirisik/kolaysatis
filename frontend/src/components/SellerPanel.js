import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { sellerAPI } from '../services/api';
import { toast } from 'react-toastify';

const SellerPanel = ({ user }) => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getProducts();
      const userProducts = response.data.products || [];
      
      setProducts(userProducts);
      setStats({
        totalProducts: userProducts.length,
        activeProducts: userProducts.filter(p => p.status === 'published').length,
        draftProducts: userProducts.filter(p => p.status === 'draft').length
      });
    } catch (error) {
      console.error('Seller data loading error:', error);
      toast.error('Satıcı verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const SellerDashboard = () => (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm bg-primary text-white">
            <div className="card-body text-center">
              <div className="display-6 mb-2">📦</div>
              <h4 className="card-title">{stats.totalProducts}</h4>
              <p className="card-text">Toplam Ürünlerim</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm bg-success text-white">
            <div className="card-body text-center">
              <div className="display-6 mb-2">✅</div>
              <h4 className="card-title">{stats.activeProducts}</h4>
              <p className="card-text">Yayında</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm bg-warning text-dark">
            <div className="card-body text-center">
              <div className="display-6 mb-2">📝</div>
              <h4 className="card-title">{stats.draftProducts}</h4>
              <p className="card-text">Taslak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">🚀 Hızlı İşlemler</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <Link to="/seller/products/new" className="btn btn-primary w-100">
                ➕ Yeni Ürün Ekle
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/seller/products" className="btn btn-outline-info w-100">
                📦 Ürünlerimi Yönet
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/seller/orders" className="btn btn-outline-success w-100">
                📋 Siparişlerim
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/seller/profile" className="btn btn-outline-secondary w-100">
                👤 Satıcı Profili
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductManagement = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📦 Ürün Yönetimi</h5>
        <Link to="/seller/products/new" className="btn btn-light btn-sm">
          ➕ Yeni Ürün
        </Link>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-4 mb-3">📦</div>
            <h5>Henüz ürününüz bulunmuyor</h5>
            <p className="text-muted">İlk ürününüzü eklemek için başlayın.</p>
            <Link to="/seller/products/new" className="btn btn-primary">
              ➕ İlk Ürünümü Ekle
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Ürün Adı</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      <span className={`badge ${product.stock_quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        product.status === 'published' ? 'bg-success' :
                        product.status === 'draft' ? 'bg-warning' :
                        'bg-secondary'
                      }`}>
                        {product.status === 'published' ? 'Yayında' :
                         product.status === 'draft' ? 'Taslak' :
                         product.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link 
                          to={`/seller/products/${product.id}/edit`}
                          className="btn btn-outline-primary"
                        >
                          ✏️
                        </Link>
                        <Link 
                          to={`/products/${product.id}`}
                          className="btn btn-outline-secondary"
                        >
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const OrderManagement = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">📋 Sipariş Yönetimi</h5>
      </div>
      <div className="card-body text-center py-5">
        <div className="display-4 mb-3">📋</div>
        <h5>Sipariş Yönetimi</h5>
        <p className="text-muted">Bu özellik yakında gelecek</p>
      </div>
    </div>
  );

  const SellerProfile = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-secondary text-white">
        <h5 className="mb-0">👤 Satıcı Profili</h5>
      </div>
      <div className="card-body text-center py-5">
        <div className="display-4 mb-3">👤</div>
        <h5>Profil Ayarları</h5>
        <p className="text-muted">Bu özellik yakında gelecek</p>
      </div>
    </div>
  );

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">🏪 Satıcı Panel</h6>
            </div>
            <div className="card-body p-0">
              <nav className="nav flex-column">
                <Link 
                  to="/seller" 
                  className={`nav-link ${location.pathname === '/seller' ? 'active bg-success text-white' : ''}`}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/seller/products" 
                  className={`nav-link ${location.pathname === '/seller/products' ? 'active bg-success text-white' : ''}`}
                >
                  📦 Ürünlerim
                </Link>
                <Link 
                  to="/seller/orders" 
                  className={`nav-link ${location.pathname === '/seller/orders' ? 'active bg-success text-white' : ''}`}
                >
                  📋 Siparişlerim
                </Link>
                <Link 
                  to="/seller/profile" 
                  className={`nav-link ${location.pathname === '/seller/profile' ? 'active bg-success text-white' : ''}`}
                >
                  👤 Profil
                </Link>
                <hr className="my-2" />
                <Link to="/dashboard" className="nav-link">
                  ← Normal Dashboard
                </Link>
              </nav>
            </div>
          </div>

          {/* Seller Info */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body text-center">
              <div className="display-6 mb-2">🏪</div>
              <h6>{user.name}</h6>
              <small className="text-muted">{user.email}</small>
              <div className="mt-2">
                <span className="badge bg-success">Satıcı</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <Routes>
            <Route path="/" element={<SellerDashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/profile" element={<SellerProfile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SellerPanel;