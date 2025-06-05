import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, testAPI } from '../services/api';
import { toast } from 'react-toastify';

const Home = ({ addToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak verileri yükle
      const [productsRes, categoriesRes] = await Promise.allSettled([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);

      // Ürünleri ayarla (ilk 6 tanesi featured olarak)
      if (productsRes.status === 'fulfilled') {
        const products = productsRes.value.data.products || [];
        setFeaturedProducts(products.slice(0, 6));
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      }

      // Kategorileri ayarla
      if (categoriesRes.status === 'fulfilled') {
        const cats = categoriesRes.value.data.categories || [];
        setCategories(cats);
        setStats(prev => ({ ...prev, totalCategories: cats.length }));
      }

    } catch (error) {
      console.error('Home data loading error:', error);
      toast.error('Ana sayfa verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} sepete eklendi! 🛒`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const initializeTestData = async () => {
    try {
      setLoading(true);
      toast.info('Test verileri oluşturuluyor...');

      await testAPI.createTestUsers();
      await testAPI.createTestCategories();
      await testAPI.createTestProducts();
      
      toast.success('Test verileri başarıyla oluşturuldu!');
      loadHomeData(); // Verileri yeniden yükle
    } catch (error) {
      console.error('Test data creation error:', error);
      toast.error('Test verileri oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Ana sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">
                🛒 KolaySatış'a Hoş Geldiniz!
              </h1>
              <p className="lead mb-4">
                Türkiye'nin en güvenilir e-ticaret platformunda alışverişin keyfini çıkarın. 
                Binlerce ürün, uygun fiyatlar ve hızlı teslimat ile!
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/products" className="btn btn-light btn-lg">
                  🛍️ Alışverişe Başla
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="display-1 mb-3">🛒📱💎</div>
              <h3>Modern E-Ticaret Deneyimi</h3>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Stats Section */}
        <section className="row mb-5">
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-primary mb-2">📦</div>
                <h4 className="card-title">{stats.totalProducts}</h4>
                <p className="card-text text-muted">Toplam Ürün</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-2">🏷️</div>
                <h4 className="card-title">{stats.totalCategories}</h4>
                <p className="card-text text-muted">Kategori</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-2">👥</div>
                <h4 className="card-title">1000+</h4>
                <p className="card-text text-muted">Mutlu Müşteri</p>
              </div>
            </div>
          </div>
        </section>

        {/* Test Data Section */}
        {featuredProducts.length === 0 && (
          <section className="mb-5">
            <div className="card border-warning">
              <div className="card-body text-center">
                <h5 className="card-title">⚠️ Henüz Ürün Bulunmuyor</h5>
                <p className="card-text">
                  Sisteminizi test etmek için örnek veriler oluşturmak ister misiniz?
                </p>
                <button 
                  className="btn btn-warning"
                  onClick={initializeTestData}
                  disabled={loading}
                >
                  🧪 Test Verilerini Oluştur
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="mb-5">
            <h2 className="text-center mb-4">🏷️ Kategoriler</h2>
            <div className="row">
              {categories.map((category) => (
                <div key={category.id} className="col-md-4 mb-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center">
                      <div className="display-6 mb-3">📂</div>
                      <h5 className="card-title">{category.name}</h5>
                      <p className="card-text text-muted">{category.description}</p>
                      <Link 
                        to={`/products?category=${category.id}`} 
                        className="btn btn-outline-primary"
                      >
                        Ürünleri Gör
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>⭐ Öne Çıkan Ürünler</h2>
              <Link to="/products" className="btn btn-outline-primary">
                Tümünü Gör →
              </Link>
            </div>
            <div className="row">
              {featuredProducts.map((product) => (
                <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                      <span className="display-4">📱</span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text text-muted flex-grow-1">
                        {product.short_description || product.description}
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            {product.sale_price ? (
                              <>
                                <span className="text-decoration-line-through text-muted">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-danger fw-bold ms-2">
                                  {formatPrice(product.sale_price)}
                                </span>
                              </>
                            ) : (
                              <span className="fw-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <small className="text-muted">
                            Stok: {product.stock_quantity}
                          </small>
                        </div>
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock_quantity === 0}
                          >
                            {product.stock_quantity > 0 ? '🛒 Sepete Ekle' : '❌ Stokta Yok'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="mb-5">
          <h2 className="text-center mb-4">✨ Neden KolaySatış?</h2>
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="text-center">
                <div className="display-6 text-primary mb-3">🚚</div>
                <h5>Hızlı Teslimat</h5>
                <p className="text-muted">24 saat içinde kapınızda</p>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="text-center">
                <div className="display-6 text-success mb-3">🔒</div>
                <h5>Güvenli Ödeme</h5>
                <p className="text-muted">256-bit SSL şifreleme</p>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="text-center">
                <div className="display-6 text-info mb-3">↩️</div>
                <h5>Kolay İade</h5>
                <p className="text-muted">15 gün içinde iade</p>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="text-center">
                <div className="display-6 text-warning mb-3">📞</div>
                <h5>7/24 Destek</h5>
                <p className="text-muted">Her zaman yanınızdayız</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;