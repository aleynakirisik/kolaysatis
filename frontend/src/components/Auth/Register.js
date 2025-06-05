// frontend/src/components/Auth/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ad zorunludur';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Soyad zorunludur';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Lütfen formu eksiksiz doldurun!');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      });

      if (response.data) {
        toast.success('Kayıt başarılı! Giriş yapılıyor...');
        
        // Auto login after registration
        if (response.data.token && response.data.user) {
          onLogin(response.data.user, response.data.token);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.param] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        toast.error('Kayıt işlemi başarısız! Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = (role) => {
    const testData = {
      seller: {
        first_name: 'Test',
        last_name: 'Satıcı',
        email: `test.seller.${Date.now()}@kolaysatis.com`,
        password: '123456',
        confirmPassword: '123456',
        role: 'seller'
      },
      customer: {
        first_name: 'Test',
        last_name: 'Müşteri',
        email: `test.customer.${Date.now()}@kolaysatis.com`,
        password: '123456',
        confirmPassword: '123456',
        role: 'customer'
      }
    };
    
    setFormData(testData[role]);
    setErrors({});
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

                {/* Navigation */}
                <div className="text-center mb-3">
                  <Link to="/" className="btn btn-outline-secondary btn-sm me-2">
                    ← Ana Sayfa
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-sm">
                    Giriş Yap
                  </Link>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit}>
                  {/* Ad ve Soyad */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        👤 Ad *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.first_name ? 'is-invalid' : ''}`}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Adınız"
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback">{errors.first_name}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        👤 Soyad *
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${errors.last_name ? 'is-invalid' : ''}`}
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                      />
                      {errors.last_name && (
                        <div className="invalid-feedback">{errors.last_name}</div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      📧 Email Adresi *
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Rol Seçimi */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      🎭 Hesap Türü *
                    </label>
                    <select
                      className="form-select form-control-lg"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="customer">👤 Müşteri - Alışveriş yapmak için</option>
                      <option value="seller">🏪 Satıcı - Ürün satmak için</option>
                    </select>
                  </div>

                  {/* Şifre */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        🔒 Şifre *
                      </label>
                      <input
                        type="password"
                        className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        🔒 Şifre Tekrar *
                      </label>
                      <input
                        type="password"
                        className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
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
                        onClick={() => fillTestData('seller')}
                        type="button"
                        disabled={loading}
                      >
                        🏪 Test Satıcı
                      </button>
                    </div>
                    <div className="col-6">
                      <button 
                        className="btn btn-outline-info btn-sm w-100"
                        onClick={() => fillTestData('customer')}
                        type="button"
                        disabled={loading}
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