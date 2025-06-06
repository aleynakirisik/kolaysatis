import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { toast } from 'react-toastify';

const ProductList = ({ addToCart }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // URL parametrelerini güncelle
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    
    filterProducts();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.allSettled([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data.products || []);
      }

      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value.data.categories || []);
      }
    } catch (error) {
      console.error('Data loading error:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Kategori filtresi
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category_id.toString() === filters.category
      );
    }

    // Arama filtresi
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'price' || filters.sortBy === 'sale_price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
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

  const filteredProducts = filterProducts();

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-6">📦 Ürünler</h1>
          <p className="text-muted">
            {filteredProducts.length} ürün bulundu
            {filters.category && categories.find(c => c.id.toString() === filters.category) && 
              ` - ${categories.find(c => c.id.toString() === filters.category).name} kategorisinde`
            }
          </p>
        </div>
      </div>

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title d-flex justify-content-between align-items-center">
                🔍 Filtreler
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearFilters}
                >
                  Temizle
                </button>
              </h5>

              {/* Search */}
              <div className="mb-3">
                <label className="form-label">Ürün Ara</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ürün adı..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-3">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="mb-3">
                <label className="form-label">Sıralama</label>
                <select
                  className="form-select"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                >
                  <option value="name-asc">İsim (A-Z)</option>
                  <option value="name-desc">İsim (Z-A)</option>
                  <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                  <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                  <option value="created_at-desc">En Yeni</option>
                  <option value="created_at-asc">En Eski</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-lg-9">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="display-1 mb-3">📦</div>
              <h3>Ürün Bulunamadı</h3>
              <p className="text-muted">
                Aradığınız kriterlere uygun ürün bulunamadı. 
                Filtreleri temizleyerek tekrar deneyin.
              </p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="row">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    {/* Product Image */}
                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '250px'}}>
                      <span className="display-4">📱</span>
                    </div>

                    {/* Product Badge */}
                    {product.sale_price && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-danger">İndirim!</span>
                      </div>
                    )}

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">
                        <Link 
                          to={`/products/${product.id}`} 
                          className="text-decoration-none"
                        >
                          {product.name}
                        </Link>
                      </h5>
                      
                      <p className="card-text text-muted flex-grow-1">
                        {product.short_description || product.description?.substring(0, 100) + '...'}
                      </p>

                      {/* Category */}
                      <div className="mb-2">
                        <span className="badge bg-light text-dark">
                          {categories.find(c => c.id === product.category_id)?.name || 'Kategori'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
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
                      </div>

                      {/* Actions */}
                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <div className="btn-group">
                            <Link
                              to={`/products/${product.id}`}
                              className="btn btn-outline-primary"
                            >
                              👁️ İncele
                            </Link>
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock_quantity === 0 || product.status !== 'published'}
                            >
                              {product.stock_quantity > 0 && product.status === 'published' 
                                ? '🛒 Sepete Ekle' 
                                : '❌ Stokta Yok'
                              }
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product Status */}
                      {product.status !== 'published' && (
                        <div className="mt-2">
                          <span className="badge bg-warning">
                            {product.status === 'draft' ? 'Taslak' : 
                             product.status === 'out_of_stock' ? 'Stokta Yok' :
                             product.status === 'discontinued' ? 'Üretimi Durduruldu' : 
                             product.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination placeholder */}
          {filteredProducts.length > 12 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className="page-item disabled">
                  <span className="page-link">Önceki</span>
                </li>
                <li className="page-item active">
                  <span className="page-link">1</span>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">Sonraki</a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;