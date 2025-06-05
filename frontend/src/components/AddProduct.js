// frontend/src/components/AddProduct.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI } from '../services/api';
import { toast } from 'react-toastify';

const AddProduct = ({ user }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    category_id: '',
    status: 'draft'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Categories loading error:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKU${timestamp}${randomStr}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı zorunludur';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ürün açıklaması zorunludur';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (formData.sale_price && parseFloat(formData.sale_price) >= parseFloat(formData.price)) {
      newErrors.sale_price = 'İndirimli fiyat normal fiyattan düşük olmalıdır';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU kodu zorunludur';
    }

    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Geçerli bir stok miktarı giriniz';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Kategori seçimi zorunludur';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Lütfen formu eksiksiz doldurun!');
      return;
    }

    setSaving(true);
    try {
      // API call simülasyonu - gerçek API endpoint'i eklenebilir
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: parseInt(formData.category_id),
        seller_id: user.id
      };

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Ürün başarıyla eklendi!');
      navigate('/seller/products');
    } catch (error) {
      console.error('Product creation error:', error);
      toast.error('Ürün eklenirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const fillSampleData = () => {
    setFormData({
      name: 'Örnek Ürün',
      description: 'Bu bir örnek ürün açıklamasıdır. Ürününüzün özelliklerini, faydalarını ve kullanım alanlarını detaylı şekilde açıklayın.',
      short_description: 'Kısa ve özlü ürün açıklaması',
      price: '299.99',
      sale_price: '249.99',
      sku: generateSKU(),
      stock_quantity: '50',
      category_id: categories.length > 0 ? categories[0].id.toString() : '',
      status: 'draft'
    });
    setErrors({});
  };

  return (
    <div className="container mt-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6">➕ Yeni Ürün Ekle</h1>
              <p className="text-muted">Satışa sunmak istediğiniz ürünü ekleyin</p>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => navigate('/seller/products')}
              >
                ← Geri Dön
              </button>
              <button
                type="button"
                className="btn btn-outline-info"
                onClick={fillSampleData}
                disabled={saving}
              >
                🎯 Örnek Veri Doldur
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Form */}
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">📝 Temel Bilgiler</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ürün adını giriniz"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Kısa Açıklama
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    placeholder="Ürün için kısa açıklama (opsiyonel)"
                    maxLength="500"
                  />
                  <small className="text-muted">
                    Ürün listesinde görünecek kısa açıklama
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Detaylı Açıklama *
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Ürününüzün detaylı açıklamasını yazınız"
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Kategori *
                  </label>
                  <select
                    className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Kategori seçiniz</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <div className="invalid-feedback">{errors.category_id}</div>
                  )}
                  {loading && (
                    <small className="text-muted">Kategoriler yükleniyor...</small>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">💰 Fiyat Bilgileri</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Satış Fiyatı (₺) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <div className="invalid-feedback">{errors.price}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      İndirimli Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${errors.sale_price ? 'is-invalid' : ''}`}
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleChange}
                      placeholder="0.00 (opsiyonel)"
                    />
                    {errors.sale_price && (
                      <div className="invalid-feedback">{errors.sale_price}</div>
                    )}
                    <small className="text-muted">
                      İndirimli fiyat normal fiyattan düşük olmalıdır
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">📦 Stok Bilgileri</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      SKU Kodu *
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className={`form-control ${errors.sku ? 'is-invalid' : ''}`}
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="SKU kodu"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData(prev => ({...prev, sku: generateSKU()}))}
                      >
                        🎲 Otomatik
                      </button>
                    </div>
                    {errors.sku && (
                      <div className="invalid-feedback">{errors.sku}</div>
                    )}
                    <small className="text-muted">
                      Ürün için benzersiz stok kodu
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Stok Miktarı *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`form-control ${errors.stock_quantity ? 'is-invalid' : ''}`}
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      placeholder="0"
                    />
                    {errors.stock_quantity && (
                      <div className="invalid-feedback">{errors.stock_quantity}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">🏷️ Yayın Durumu</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Ürün Durumu
                  </label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">📝 Taslak (Henüz yayında değil)</option>
                    <option value="published">✅ Yayında (Müşteriler görebilir)</option>
                  </select>
                  <small className="text-muted">
                    Taslak olarak kaydetip daha sonra yayınlayabilirsiniz
                  </small>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          💾 Ürünü Kaydet
                        </>
                      )}
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg w-100"
                      onClick={() => navigate('/seller/products')}
                      disabled={saving}
                    >
                      ❌ İptal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Preview Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">👁️ Ürün Önizleme</h6>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{height: '150px'}}>
                  <span className="display-4">📱</span>
                </div>
              </div>
              <h6 className="card-title">
                {formData.name || 'Ürün Adı'}
              </h6>
              <p className="card-text text-muted small">
                {formData.short_description || 'Kısa açıklama buraya gelecek...'}
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {formData.sale_price && formData.price ? (
                    <>
                      <span className="text-decoration-line-through text-muted small">
                        ₺{parseFloat(formData.price || 0).toFixed(2)}
                      </span>
                      <br />
                      <span className="text-danger fw-bold">
                        ₺{parseFloat(formData.sale_price || 0).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="fw-bold text-primary">
                      ₺{parseFloat(formData.price || 0).toFixed(2)}
                    </span>
                  )}
                </div>
                <small className="text-muted">
                  Stok: {formData.stock_quantity || 0}
                </small>
              </div>
              <div className="mt-2">
                <span className={`badge ${
                  formData.status === 'published' ? 'bg-success' : 'bg-warning'
                }`}>
                  {formData.status === 'published' ? 'Yayında' : 'Taslak'}
                </span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">💡 İpuçları</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <strong>📝 Başlık:</strong> Net ve açıklayıcı bir ürün adı seçin
                </li>
                <li className="mb-2">
                  <strong>📷 Görsel:</strong> Kaliteli ürün fotoğrafları ekleyin
                </li>
                <li className="mb-2">
                  <strong>💰 Fiyat:</strong> Rekabetçi ve adil fiyat belirleyin
                </li>
                <li className="mb-2">
                  <strong>📦 Stok:</strong> Gerçek stok miktarını girin
                </li>
                <li className="mb-2">
                  <strong>🏷️ Kategori:</strong> Doğru kategori seçimi önemli
                </li>
                <li>
                  <strong>✅ Durum:</strong> Hazır olduğunda yayınlayın
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;