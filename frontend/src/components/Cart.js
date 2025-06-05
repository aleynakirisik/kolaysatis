import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = ({ cart, updateQuantity, removeFromCart, clearCart, user }) => {
  const [checkingOut, setCheckingOut] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const calculateItemTotal = (item) => {
    const price = item.sale_price || item.price;
    return price * item.quantity;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // %18 KDV
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 29.99; // 500 TL üzeri kargo bedava
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
    toast.success('Sepet güncellendi');
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    toast.success('Ürün sepetten çıkarıldı');
  };

  const handleClearCart = () => {
    if (window.confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      clearCart();
      toast.success('Sepet temizlendi');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.warning('Satın almak için giriş yapmalısınız');
      return;
    }

    setCheckingOut(true);
    
    // Simülasyon - gerçek ödeme işlemi burada olacak
    setTimeout(() => {
      toast.success('Siparişiniz başarıyla alındı! 🎉');
      clearCart();
      setCheckingOut(false);
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="display-1 mb-4">🛒</div>
            <h2>Sepetiniz Boş</h2>
            <p className="text-muted mb-4">
              Henüz sepetinizde ürün bulunmuyor. 
              Alışverişe başlamak için ürünler sayfasını ziyaret edin.
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              🛍️ Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-6">🛒 Sepetim</h1>
          <p className="text-muted">{cart.length} ürün sepetinizde</p>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-outline-danger"
            onClick={handleClearCart}
            disabled={checkingOut}
          >
            🗑️ Sepeti Temizle
          </button>
        </div>
      </div>

      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {cart.map((item, index) => (
                <div key={item.id} className={`row align-items-center ${index !== cart.length - 1 ? 'border-bottom' : ''} py-3`}>
                  {/* Product Image */}
                  <div className="col-md-2 text-center">
                    <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                      <span className="display-6">📱</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="col-md-4">
                    <h6 className="mb-1">{item.name}</h6>
                    <small className="text-muted">SKU: {item.sku}</small>
                    {item.sale_price && (
                      <div>
                        <span className="badge bg-danger">İndirim!</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-md-2">
                    <div className="input-group">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={checkingOut}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                        max={item.stock_quantity}
                        disabled={checkingOut}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={checkingOut || item.quantity >= item.stock_quantity}
                      >
                        +
                      </button>
                    </div>
                    <small className="text-muted">
                      Stok: {item.stock_quantity}
                    </small>
                  </div>

                  {/* Price */}
                  <div className="col-md-2 text-center">
                    <div>
                      {item.sale_price ? (
                        <>
                          <small className="text-decoration-line-through text-muted d-block">
                            {formatPrice(item.price)}
                          </small>
                          <strong className="text-danger">
                            {formatPrice(item.sale_price)}
                          </strong>
                        </>
                      ) : (
                        <strong>{formatPrice(item.price)}</strong>
                      )}
                    </div>
                  </div>

                  {/* Total & Remove */}
                  <div className="col-md-2 text-center">
                    <div className="fw-bold text-primary mb-2">
                      {formatPrice(calculateItemTotal(item))}
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={checkingOut}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-3">
            <Link to="/products" className="btn btn-outline-primary">
              ← Alışverişe Devam Et
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">💰 Sipariş Özeti</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Ara Toplam:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>KDV (%18):</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Kargo:</span>
                <span>
                  {calculateShipping() === 0 ? (
                    <span className="text-success">Ücretsiz</span>
                  ) : (
                    formatPrice(calculateShipping())
                  )}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Toplam:</strong>
                <strong className="text-primary">{formatPrice(calculateTotal())}</strong>
              </div>

              {/* Free shipping notice */}
              {calculateShipping() > 0 && (
                <div className="alert alert-info py-2">
                  <small>
                    🚚 {formatPrice(500 - calculateSubtotal())} daha harcayın, 
                    kargo bedava!
                  </small>
                </div>
              )}

              {/* Checkout Button */}
              {user ? (
                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      İşlem Yapılıyor...
                    </>
                  ) : (
                    <>
                      💳 Satın Al
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <p className="text-muted text-center mb-3">
                    Satın almak için giriş yapmalısınız
                  </p>
                  <Link to="/login" className="btn btn-primary btn-lg w-100">
                    🔐 Giriş Yap
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="card border-0 bg-light mt-3">
            <div className="card-body text-center">
              <div className="display-6 mb-2">🔒</div>
              <h6>Güvenli Ödeme</h6>
              <small className="text-muted">
                Tüm ödemeleriniz 256-bit SSL ile şifrelenir
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;