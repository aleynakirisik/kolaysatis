import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' // Varsayılan rol: müşteri
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    // Form validasyonu
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Kayıt işlemi başarısız!');
      }
    } catch (err) {
      setError('Bağlantı hatası! Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo ve Başlık */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span className="display-4">🛒</span>
                  </div>
                  <h2 className="fw-bold text-dark">KolaySatis</h2>
                  <p className="text-muted">Yeni Hesap Oluşturun</p>
                </div>

                {/* Ana Sayfaya Dön Butonu */}
                <div className="text-center mb-3">
                  <Link to="/" className="btn btn-outline-secondary btn-sm me-2">
                    ← Ana Sayfa
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-sm">
                    Giriş Yap
                  </Link>
                </div>

                {/* Başarı Mesajı */}
                {success && (
                  <div className="alert alert-success" role="alert">
                    <span className="me-2">✅</span>
                    {success}
                  </div>
                )}

                {/* Hata Mesajı */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <span className="me-2">⚠️</span>
                    {error}
                  </div>
                )}

                {/* Register Formu */}
                <form onSubmit={handleSubmit}>
                  {/* Ad ve Soyad */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        👤 Ad
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Adınız"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        👤 Soyad
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Rol Seçimi */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      🎭 Hesap Türü
                    </label>
                    <select
                      className="form-control form-control-lg"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="customer">👤 Müşteri - Alışveriş yapmak için</option>
                      <option value="seller">🏪 Satıcı - Ürün satmak için</option>
                    </select>
                  </div>

                  {/* Şifre */}
                  <div className="row mb-3">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        🔒 Şifre Tekrar
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {/* Kayıt Butonu */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Kayıt Yapılıyor...
                      </>
                    ) : (
                      <>
                        🚀 Hesap Oluştur
                      </>
                    )}
                  </button>
                </form>

                {/* Hızlı Test Kayıtları */}
                <div className="border-top pt-3 mt-3">
                  <h6 className="text-center text-muted mb-3">Hızlı Test Kayıtları</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <button 
                        className="btn btn-outline-success btn-sm w-100"
                        onClick={() => setFormData({
                          firstName: 'Test',
                          lastName: 'Satici',
                          email: 'test.seller@kolaysatis.com',
                          password: '123456',
                          confirmPassword: '123456',
                          role: 'seller'
                        })}
                        type="button"
                      >
                        🏪 Test Satıcı
                      </button>
                    </div>
                    <div className="col-6">
                      <button 
                        className="btn btn-outline-info btn-sm w-100"
                        onClick={() => setFormData({
                          firstName: 'Test',
                          lastName: 'Musteri',
                          email: 'test.customer@kolaysatis.com',
                          password: '123456',
                          confirmPassword: '123456',
                          role: 'customer'
                        })}
                        type="button"
                      >
                        👤 Test Müşteri
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-muted">
                    Zaten hesabınız var mı? 
                    <Link to="/login" className="text-decoration-none ms-1">
                      Giriş Yapın
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

export default Register;