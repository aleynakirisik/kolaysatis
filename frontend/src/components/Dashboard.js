// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, sellerAPI, adminAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivity: [],
    userProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'admin') {
        const response = await adminAPI.getDashboard();
        setDashboardData({
          stats: response.data.stats || {},
          recentActivity: [],
          userProducts: []
        });
      } else if (user.role === 'seller') {
        const response = await sellerAPI.getProducts();
        setDashboardData({
          stats: {
            totalProducts: response.data.count || 0,
            activeProducts: response.data.products?.filter(p => p.status === 'published').length || 0,
            draftProducts: response.data.products?.filter(p => p.status === 'draft').length || 0
          },
          userProducts: response.data.products || [],
          recentActivity: []
        });
      } else {
        // Customer dashboard
        setDashboardData({
          stats: {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0
          },
          recentActivity: [],
          userProducts: []
        });
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast.error('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-6">
            {getRoleIcon(user.role)} Dashboard
          </h1>
          <p className="text-muted">
            Hoş geldiniz, {user.name} ({getRoleName(user.role)})
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {user.role === 'admin' && (
          <>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-primary mb-2">👥</div>
                  <h4 className="card-title">{dashboardData.stats.totalUsers || 0}</h4>
                  <p className="card-text text-muted">Toplam Kullanıcı</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-success mb-2">📦</div>
                  <h4 className="card-title">{dashboardData.stats.activeProducts || 0}</h4>
                  <p className="card-text text-muted">Aktif Ürünler</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-info mb-2">📋</div>
                  <h4 className="card-title">{dashboardData.stats.recentOrders || 0}</h4>
                  <p className="card-text text-muted">Son Siparişler</p>
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === 'seller' && (
          <>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-primary mb-2">📦</div>
                  <h4 className="card-title">{dashboardData.stats.totalProducts || 0}</h4>
                  <p className="card-text text-muted">Toplam Ürünlerim</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-success mb-2">✅</div>
                  <h4 className="card-title">{dashboardData.stats.activeProducts || 0}</h4>
                  <p className="card-text text-muted">Yayında</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-warning mb-2">📝</div>
                  <h4 className="card-title">{dashboardData.stats.draftProducts || 0}</h4>
                  <p className="card-text text-muted">Taslak</p>
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === 'customer' && (
          <>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-primary mb-2">📋</div>
                  <h4 className="card-title">{dashboardData.stats.totalOrders || 0}</h4>
                  <p className="card-text text-muted">Toplam Siparişler</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-warning mb-2">⏳</div>
                  <h4 className="card-title">{dashboardData.stats.pendingOrders || 0}</h4>
                  <p className="card-text text-muted">Bekleyen</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="display-6 text-success mb-2">✅</div>
                  <h4 className="card-title">{dashboardData.stats.completedOrders || 0}</h4>
                  <p className="card-text text-muted">Tamamlanan</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">🚀 Hızlı İşlemler</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {user.role === 'admin' && (
                  <>
                    <div className="col-md-3 mb-2">
                      <Link to="/admin" className="btn btn-outline-primary w-100">
                        👑 Admin Panel
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/admin/users" className="btn btn-outline-secondary w-100">
                        👥 Kullanıcıları Yönet
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/admin/products" className="btn btn-outline-success w-100">
                        📦 Ürünleri Yönet
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/admin/categories" className="btn btn-outline-info w-100">
                        🏷️ Kategoriler
                      </Link>
                    </div>
                  </>
                )}

                {user.role === 'seller' && (
                  <>
                    <div className="col-md-3 mb-2">
                      <Link to="/seller/products/new" className="btn btn-primary w-100">
                        ➕ Yeni Ürün
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/seller/products" className="btn btn-outline-success w-100">
                        📦 Ürünlerim
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/seller/orders" className="btn btn-outline-info w-100">
                        📋 Siparişlerim
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/seller/profile" className="btn btn-outline-secondary w-100">
                        👤 Profil
                      </Link>
                    </div>
                  </>
                )}

                {user.role === 'customer' && (
                  <>
                    <div className="col-md-3 mb-2">
                      <Link to="/products" className="btn btn-primary w-100">
                        🛍️ Alışveriş
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/orders" className="btn btn-outline-info w-100">
                        📋 Siparişlerim
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/cart" className="btn btn-outline-success w-100">
                        🛒 Sepetim
                      </Link>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Link to="/profile" className="btn btn-outline-secondary w-100">
                        👤 Profil
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on role */}
      {user.role === 'seller' && dashboardData.userProducts.length > 0 && (
        <div className="row">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">📦 Son Ürünlerim</h5>
              </div>
              <div className="card-body">
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
                      {dashboardData.userProducts.slice(0, 5).map((product) => (
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
                {dashboardData.userProducts.length > 5 && (
                  <div className="text-center mt-3">
                    <Link to="/seller/products" className="btn btn-primary">
                      Tüm Ürünleri Gör ({dashboardData.userProducts.length})
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'customer' && (
        <div className="row">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">🛍️ Önerilen Ürünler</h5>
              </div>
              <div className="card-body text-center">
                <div className="display-4 mb-3">🛒</div>
                <h5>Size Özel Öneriler</h5>
                <p className="text-muted mb-4">
                  Alışveriş geçmişinize göre önerilen ürünleri görmek için 
                  daha fazla alışveriş yapın.
                </p>
                <Link to="/products" className="btn btn-primary">
                  🛍️ Alışverişe Başla
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="row">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">⚠️ Sistem Durumu</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>📊 Platform İstatistikleri</h6>
                    <ul className="list-unstyled">
                      <li>✅ Sistem durumu: Normal</li>
                      <li>🔄 Son güncelleme: Bugün</li>
                      <li>📈 Performans: İyi</li>
                      <li>🔒 Güvenlik: Aktif</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>🔧 Yönetim Araçları</h6>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-info btn-sm">
                        📊 Raporları Görüntüle
                      </button>
                      <button className="btn btn-outline-warning btn-sm">
                        🔧 Sistem Ayarları
                      </button>
                      <button className="btn btn-outline-success btn-sm">
                        💾 Yedekleme
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;