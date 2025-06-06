import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.data && response.data.user && response.data.token) {
        // onLogin callback'ini çağır
        onLogin(response.data.user, response.data.token);
        
        toast.success('Giriş başarılı! 🎉');
        
        // Dashboard'a yönlendir
        navigate('/dashboard');
      } else {
        setError('Giriş yapılamadı! Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Bağlantı hatası! Lütfen tekrar deneyin.');
      }
      toast.error('Giriş yapılamadı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo ve Başlık */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span className="display-4">🛒</span>
                  </div>
                  <h2 className="fw-bold text-dark">KolaySatis</h2>
                  <p className="text-muted">E-Ticaret Platformu</p>
                </div>

                {/* Ana Sayfaya Dön Butonu */}
                <div className="text-center mb-3">
                  <Link to="/" className="btn btn-outline-secondary btn-sm">
                    ← Ana Sayfaya Dön
                  </Link>
                </div>

                {/* Hata Mesajı */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <span className="me-2">⚠️</span>
                    {error}
                  </div>
                )}

                {/* Login Formu */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      📧 Email Adresi
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      🔒 Şifre
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Giriş Yapılıyor...
                      </>
                    ) : (
                      <>
                        🚀 Giriş Yap
                      </>
                    )}
                  </button>
                </form>

                {/* Test Kullanıcıları */}
                <div className="border-top pt-3 mt-3">
                  <h6 className="text-center text-muted mb-3">Test Kullanıcıları</h6>
                  <div className="row g-2">
                    <div className="col-4">
                      <button 
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={() => setFormData({email: 'admin@kolaysatis.com', password: '123456'})}
                        type="button"
                      >
                        👑 Admin
                      </button>
                    </div>
                    <div className="col-4">
                      <button 
                        className="btn btn-outline-success btn-sm w-100"
                        onClick={() => setFormData({email: 'seller@kolaysatis.com', password: '123456'})}
                        type="button"
                      >
                        🏪 Satıcı
                      </button>
                    </div>
                    <div className="col-4">
                      <button 
                        className="btn btn-outline-info btn-sm w-100"
                        onClick={() => setFormData({email: 'customer@kolaysatis.com', password: '123456'})}
                        type="button"
                      >
                        👤 Müşteri
                      </button>
                    </div>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Hesabınız yok mu? 
                    <Link to="/register" className="text-decoration-none ms-1">
                      Kayıt Ol
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;