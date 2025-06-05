import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfileData(response.data.user);
      setFormData({
        first_name: response.data.user.first_name || '',
        last_name: response.data.user.last_name || '',
        email: response.data.user.email || ''
      });
    } catch (error) {
      console.error('Profile loading error:', error);
      toast.error('Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      // API endpoint'i eklendiğinde kullanılacak
      toast.success('Profil güncelleme özelliği yakında gelecek!');
      setEditing(false);
    } catch (error) {
      toast.error('Profil güncellenemedi');
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

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Profile Header */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="display-1 mb-3">
                {getRoleIcon(profileData?.role || user?.role)}
              </div>
              <h2>{profileData?.name || user?.name}</h2>
              <p className="text-muted">{profileData?.email || user?.email}</p>
              <span className={`badge ${
                (profileData?.role || user?.role) === 'admin' ? 'bg-danger' :
                (profileData?.role || user?.role) === 'seller' ? 'bg-success' :
                'bg-info'
              } fs-6`}>
                {getRoleName(profileData?.role || user?.role)}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👤 Profil Bilgileri</h5>
              <button 
                className="btn btn-light btn-sm"
                onClick={() => setEditing(!editing)}
              >
                {editing ? '❌ İptal' : '✏️ Düzenle'}
              </button>
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Ad</label>
                      <input
                        type="text"
                        className="form-control"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Soyad</label>
                      <input
                        type="text"
                        className="form-control"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">E-posta</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      ✅ Kaydet
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditing(false)}
                    >
                      ❌ İptal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Ad:</label>
                    <p className="mb-0">{profileData?.first_name || 'Belirtilmemiş'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Soyad:</label>
                    <p className="mb-0">{profileData?.last_name || 'Belirtilmemiş'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">E-posta:</label>
                    <p className="mb-0">{profileData?.email || user?.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Rol:</label>
                    <p className="mb-0">{getRoleName(profileData?.role || user?.role)}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Kullanıcı ID:</label>
                    <p className="mb-0">#{profileData?.id || user?.id}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Hesap Durumu:</label>
                    <p className="mb-0">
                      <span className="badge bg-success">✅ Aktif</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">⚙️ Hesap İşlemleri</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <button className="btn btn-outline-warning w-100">
                    🔒 Şifre Değiştir
                  </button>
                </div>
                <div className="col-md-4">
                  <button className="btn btn-outline-info w-100">
                    📧 E-posta Değiştir
                  </button>
                </div>
                <div className="col-md-4">
                  <button className="btn btn-outline-secondary w-100">
                    📱 Bildirim Ayarları
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific Actions */}
          {(profileData?.role === 'seller' || user?.role === 'seller') && (
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">🏪 Satıcı İşlemleri</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <button className="btn btn-outline-success w-100">
                      📦 Ürünlerimi Yönet
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button className="btn btn-outline-info w-100">
                      📊 Satış Raporları
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(profileData?.role === 'admin' || user?.role === 'admin') && (
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">👑 Admin İşlemleri</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <button className="btn btn-outline-danger w-100">
                      👥 Kullanıcı Yönetimi
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-warning w-100">
                      🏷️ Kategori Yönetimi
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-secondary w-100">
                      ⚙️ Sistem Ayarları
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;