// frontend/src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI, testAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminPanel = ({ user }) => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProducts: 0,
    recentOrders: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, usersRes] = await Promise.allSettled([
        adminAPI.getDashboard(),
        adminAPI.getUsers()
      ]);

      if (dashboardRes.status === 'fulfilled') {
        setStats(dashboardRes.value.data.stats || {});
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.users || []);
      }
    } catch (error) {
      console.error('Admin data loading error:', error);
      toast.error('Admin verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    try {
      setLoading(true);
      toast.info('Test verileri oluşturuluyor...');

      await testAPI.createTestUsers();
      await testAPI.createTestCategories();
      await testAPI.createTestProducts();
      
      toast.success('Test verileri başarıyla oluşturuldu!');
      loadAdminData(); // Verileri yeniden yükle
    } catch (error) {
      console.error('Test data creation error:', error);
      toast.error('Test verileri oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const AdminDashboard = () => (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm bg-primary text-white">
            <div className="card-body text-center">
              <div className="display-6 mb-2">👥</div>
              <h4 className="card-title">{stats.totalUsers || users.length}</h4>
              <p className="card-text">Toplam Kullanıcı</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm bg-success text-white">
            <div className="card-body text-center">
              <div className="display-6 mb-2">📦</div>
              <h4 className="card-title">{stats.activeProducts || 0}</h4>
              <p className="card-text">Aktif Ürünler</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm bg-info text-white">
            <div className="card-body text-center">
              <div className="display-6 mb-2">📋</div>
              <h4 className="card-title">{stats.recentOrders || 0}</h4>
              <p className="card-text">Son Siparişler</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">🚀 Hızlı İşlemler</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <button 
                className="btn btn-primary w-100"
                onClick={createTestData}
                disabled={loading}
              >
                {loading ? '⏳ İşlem Yapılıyor...' : '🧪 Test Verilerini Oluştur'}
              </button>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-info w-100">
                📊 Raporları Görüntüle
              </button>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-success w-100">
                💾 Sistem Yedeği Al
              </button>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-warning w-100">
                🔧 Sistem Ayarları
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">🖥️ Sistem Durumu</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>📊 Platform İstatistikleri</h6>
              <ul className="list-unstyled">
                <li>✅ <strong>Sistem Durumu:</strong> Normal</li>
                <li>🔄 <strong>Son Güncelleme:</strong> Bugün</li>
                <li>📈 <strong>Performans:</strong> İyi</li>
                <li>🔒 <strong>Güvenlik:</strong> Aktif</li>
                <li>💾 <strong>Veritabanı:</strong> PostgreSQL</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>🔧 Güvenlik Özellikleri</h6>
              <ul className="list-unstyled">
                <li>✅ <strong>JWT Authentication:</strong> Aktif</li>
                <li>✅ <strong>XSS Koruması:</strong> Aktif</li>
                <li>✅ <strong>SQL Injection:</strong> Önleniyor</li>
                <li>✅ <strong>CSRF Koruması:</strong> Aktif</li>
                <li>✅ <strong>Rate Limiting:</strong> Aktif</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const UserManagement = () => (
    <div>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">👥 Kullanıcı Yönetimi</h5>
          <button className="btn btn-light btn-sm">
            ➕ Yeni Kullanıcı
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <div className="display-4 mb-3">👥</div>
              <h5>Henüz kullanıcı bulunmuyor</h5>
              <p className="text-muted">Test kullanıcıları oluşturmak için ana paneli kullanın.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ad Soyad</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <strong>{user.first_name} {user.last_name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'admin' ? 'bg-danger' :
                          user.role === 'seller' ? 'bg-success' :
                          'bg-info'
                        }`}>
                          {user.role === 'admin' ? '👑 Admin' :
                           user.role === 'seller' ? '🏪 Satıcı' :
                           '👤 Müşteri'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {user.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary">
                            ✏️
                          </button>
                          <button className="btn btn-outline-danger">
                            🗑️
                          </button>
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
    </div>
  );

  const ProductManagement = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">📦 Ürün Yönetimi</h5>
      </div>
      <div className="card-body text-center py-5">
        <div className="display-4 mb-3">📦</div>
        <h5>Ürün Yönetimi</h5>
        <p className="text-muted">Bu özellik yakında gelecek</p>
      </div>
    </div>
  );

  const CategoryManagement = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">🏷️ Kategori Yönetimi</h5>
      </div>
      <div className="card-body text-center py-5">
        <div className="display-4 mb-3">🏷️</div>
        <h5>Kategori Yönetimi</h5>
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
            <div className="card-header bg-dark text-white">
              <h6 className="mb-0">👑 Admin Panel</h6>
            </div>
            <div className="card-body p-0">
              <nav className="nav flex-column">
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname === '/admin' ? 'active bg-primary text-white' : ''}`}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`nav-link ${location.pathname === '/admin/users' ? 'active bg-primary text-white' : ''}`}
                >
                  👥 Kullanıcılar
                </Link>
                <Link 
                  to="/admin/products" 
                  className={`nav-link ${location.pathname === '/admin/products' ? 'active bg-primary text-white' : ''}`}
                >
                  📦 Ürünler
                </Link>
                <Link 
                  to="/admin/categories" 
                  className={`nav-link ${location.pathname === '/admin/categories' ? 'active bg-primary text-white' : ''}`}
                >
                  🏷️ Kategoriler
                </Link>
                <hr className="my-2" />
                <Link to="/dashboard" className="nav-link">
                  ← Normal Dashboard
                </Link>
              </nav>
            </div>
          </div>

          {/* Admin Info */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body text-center">
              <div className="display-6 mb-2">👑</div>
              <h6>{user.name}</h6>
              <small className="text-muted">{user.email}</small>
              <div className="mt-2">
                <span className="badge bg-danger">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;