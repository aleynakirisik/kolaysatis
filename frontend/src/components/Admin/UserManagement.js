import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'customer',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Users loading error:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'customer',
      is_active: true
    });
    setErrors({});
    setEditingUser(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ad zorunludur';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Soyad zorunludur';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!editingUser && !formData.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update user
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...formData, name: `${formData.first_name} ${formData.last_name}` }
            : user
        );
        setUsers(updatedUsers);
        toast.success('Kullanıcı başarıyla güncellendi!');
      } else {
        // Create user
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
        const newUser = {
          id: users.length + 1,
          ...formData,
          name: `${formData.first_name} ${formData.last_name}`,
          created_at: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        toast.success('Kullanıcı başarıyla oluşturuldu!');
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error('İşlem başarısız!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated API call
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Kullanıcı başarıyla silindi!');
    } catch (error) {
      toast.error('Kullanıcı silinirken hata oluştu!');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated API call
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      );
      setUsers(updatedUsers);
      toast.success(`Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi!`);
    } catch (error) {
      toast.error('İşlem başarısız!');
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      admins: users.filter(u => u.role === 'admin').length,
      sellers: users.filter(u => u.role === 'seller').length,
      customers: users.filter(u => u.role === 'customer').length
    };
  };

  const stats = getUserStats();

  return (
    <div className="container-fluid mt-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6">👥 Kullanıcı Yönetimi</h1>
              <p className="text-muted">Sistem kullanıcılarını yönetin</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleAdd}
            >
              ➕ Yeni Kullanıcı
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-primary">👥</div>
              <h5>{stats.total}</h5>
              <small className="text-muted">Toplam</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-success">✅</div>
              <h5>{stats.active}</h5>
              <small className="text-muted">Aktif</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-danger">👑</div>
              <h5>{stats.admins}</h5>
              <small className="text-muted">Admin</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-warning">🏪</div>
              <h5>{stats.sellers}</h5>
              <small className="text-muted">Satıcı</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-info">👤</div>
              <h5>{stats.customers}</h5>
              <small className="text-muted">Müşteri</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Kullanıcı ara (ad, soyad, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tüm Roller</option>
                <option value="admin">👑 Admin</option>
                <option value="seller">🏪 Satıcı</option>
                <option value="customer">👤 Müşteri</option>
              </select>
            </div>
            <div className="col-md-3">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                }}
              >
                🗑️ Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">👥 Kullanıcı Listesi ({filteredUsers.length})</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <div className="display-4 mb-3">👥</div>
              <h5>Kullanıcı bulunamadı</h5>
              <p className="text-muted">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kullanıcı</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>Kayıt Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{getRoleIcon(user.role)}</span>
                          <div>
                            <strong>{user.first_name} {user.last_name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'admin' ? 'bg-danger' :
                          user.role === 'seller' ? 'bg-success' :
                          'bg-info'
                        }`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={user.is_active}
                            onChange={() => toggleUserStatus(user.id, user.is_active)}
                          />
                          <label className="form-check-label">
                            {user.is_active ? 'Aktif' : 'Pasif'}
                          </label>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'N/A'}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(user)}
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(user.id)}
                            title="Sil"
                          >
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

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? '✏️ Kullanıcı Düzenle' : '➕ Yeni Kullanıcı Ekle'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Ad *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Ad"
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback">{errors.first_name}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Soyad *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Soyad"
                      />
                      {errors.last_name && (
                        <div className="invalid-feedback">{errors.last_name}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Şifre {editingUser ? '(Değiştirmek için doldur)' : '*'}
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Rol *</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="customer">👤 Müşteri</option>
                        <option value="seller">🏪 Satıcı</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        id="isActive"
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Kullanıcı aktif
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        💾 {editingUser ? 'Güncelle' : 'Oluştur'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;