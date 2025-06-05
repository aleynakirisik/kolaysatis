// frontend/src/components/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { toast } from 'react-toastify';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProductDetail();
  }, [id]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      setError('');

      // Ürün detayını yükle
      const response = await productAPI.getById(id);
      const productData = response.data.product || response.data;
      
      if (!productData) {
        setError('Ürün bulunamadı');
        return;
      }

      setProduct(productData);

      // Kategori bilgisini yükle
      if (productData.category_id) {
        try {
          const categoryResponse = await categoryAPI.getById(productData.category_id);
          setCategory(categoryResponse.data.category || categoryResponse.data);
        } catch (catError) {
          console.error('Category loading error:', catError);
          // Kategori yüklenemezse devam et
        }
      }

    } catch (error) {
      console.error('Product detail loading error:', error);
      if (error.response?.status === 404) {
        setError('Ürün bulunamadı');
      } else {
        setError('Ürün detayları yüklenirken hata oluştu');
      }
      toast.error('Ürün detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock_quantity < quantity) {
      toast.error('Yeterli stok bulunmuyor!');
      return;
    }

    addToCart(product, quantity);
    toast.success(`${quantity} adet ${product.name} sepete eklendi! 🛒`);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > product.stock_quantity) {
      setQuantity(product.stock_quantity);
      toast.warning('Maksimum stok miktarına ulaştınız');
    } else {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="badge bg-success">Satışta</span>;
      case 'draft':
        return <span className="badge bg-warning">Taslak</span>;
      case 'out_of_stock':
        return <span className="badge bg-danger">Stokta Yok</span>;
      case 'discontinued':
        return <span className="badge bg-secondary">Üretimi Durduruldu</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Ürün detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="display-1 mb-4">😞</div>
            <h2>Ürün Bulunamadı</h2>
            <p className="text-muted mb-4">{error || 'Aradığınız ürün mevcut değil.'}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                ← Geri Dön
              </button>
              <Link to="/products" className="btn btn-primary">
                📦 Tüm Ürünler
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Ana Sayfa</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">Ürünler</Link>
          </li>
          {category && (
            <li className="breadcrumb-item">
              <Link to={`/products?category=${product.category_id}`}>
                {category.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Product Images */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {/* Main Product Image */}
              <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '400px'}}>
                <span className="display-1">📱</span>
              </div>
              
              {/* Thumbnail Images */}
              <div className="p-3">
                <div className="row g-2">
                  {[1, 2, 3, 4].map((thumb) => (
                    <div key={thumb} className="col-3">
                      <div className="bg-light border rounded d-flex align-items-center justify-content-center" style={{height: '60px'}}>
                        <small>📱</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <div className="mb-3">
            {/* Product Status */}
            <div className="mb-2">
              {getStatusBadge(product.status)}
              {category && (
                <span className="badge bg-light text-dark ms-2">
                  {category.name}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="display-6 mb-3">{product.name}</h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="lead text-muted mb-4">
                {product.short_description}
              </p>
            )}

            {/* Price */}
            <div className="mb-4">
              {product.sale_price ? (
                <div>
                  <span className="text-decoration-line-through text-muted h5 me-3">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-danger h4 fw-bold">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="badge bg-danger ms-2">
                    %{Math.round(((product.price - product.sale_price) / product.price) * 100)} İndirim
                  </span>
                </div>
              ) : (
                <span className="text-primary h4 fw-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock Info */}
            <div className="mb-4">
              <div className="d-flex align-items-center">
                <span className="me-2">Stok Durumu:</span>
                {product.stock_quantity > 0 ? (
                  <span className="badge bg-success">
                    {product.stock_quantity} adet mevcut
                  </span>
                ) : (
                  <span className="badge bg-danger">Stokta yok</span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="mb-4">
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted">SKU:</small>
                  <div className="fw-semibold">{product.sku}</div>
                </div>
                {category && (
                  <div className="col-6">
                    <small className="text-muted">Kategori:</small>
                    <div className="fw-semibold">{category.name}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product.status === 'published' && product.stock_quantity > 0 && (
              <div className="mb-4">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">Miktar:</label>
                    <div className="input-group">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        min="1"
                        max={product.stock_quantity}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="d-grid gap-2 d-md-flex">
                      <button
                        className="btn btn-primary btn-lg flex-grow-1"
                        onClick={handleAddToCart}
                      >
                        🛒 Sepete Ekle - {formatPrice((product.sale_price || product.price) * quantity)}
                      </button>
                      <button className="btn btn-outline-danger btn-lg">
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Out of stock message */}
            {(product.status !== 'published' || product.stock_quantity === 0) && (
              <div className="alert alert-warning mb-4">
                <strong>⚠️ Bu ürün şu anda satışta değil</strong>
                <br />
                {product.stock_quantity === 0 ? 'Stokta bulunmuyor' : 'Satış durumu: ' + product.status}
              </div>
            )}

            {/* Shipping Info */}
            <div className="card bg-light border-0 mb-4">
              <div className="card-body">
                <h6 className="card-title">🚚 Kargo Bilgileri</h6>
                <ul className="list-unstyled mb-0">
                  <li>✅ Ücretsiz kargo (500₺ ve üzeri)</li>
                  <li>📦 1-3 iş günü içinde kargo</li>
                  <li>↩️ 15 gün içinde iade</li>
                  <li>🔒 Güvenli ödeme</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="row mt-5">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">📝 Ürün Açıklaması</h5>
              </div>
              <div className="card-body">
                <p className="card-text" style={{whiteSpace: 'pre-line'}}>
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Products Placeholder */}
      <div className="row mt-5">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">🔄 Benzer Ürünler</h5>
            </div>
            <div className="card-body text-center py-5">
              <div className="display-4 mb-3">🔍</div>
              <h6>Benzer Ürünler</h6>
              <p className="text-muted">Bu özellik yakında gelecek</p>
              <Link to="/products" className="btn btn-outline-primary">
                Tüm Ürünleri Gör
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;