import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CustomerOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Simulated orders data
      const mockOrders = [
        {
          id: 1,
          order_number: 'KS-2024-001',
          date: '2024-12-01',
          status: 'delivered',
          total: 1250.00,
          items: [
            { id: 1, name: 'iPhone 15 Pro', quantity: 1, price: 1250.00, image: '📱' }
          ]
        },
        {
          id: 2,
          order_number: 'KS-2024-002',
          date: '2024-12-10',
          status: 'shipped',
          total: 850.00,
          items: [
            { id: 2, name: 'Samsung Galaxy S24', quantity: 1, price: 850.00, image: '📱' }
          ]
        },
        {
          id: 3,
          order_number: 'KS-2024-003',
          date: '2024-12-15',
          status: 'processing',
          total: 299.99,
          items: [
            { id: 3, name: 'Nike Air Max', quantity: 1, price: 299.99, image: '👟' }
          ]
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Orders loading error:', error);
      toast.error('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'Bekliyor', color: 'warning', icon: '⏳' },
      processing: { label: 'Hazırlanıyor', color: 'info', icon: '📦' },
      shipped: { label: 'Kargoda', color: 'primary', icon: '🚚' },
      delivered: { label: 'Teslim Edildi', color: 'success', icon: '✅' },
      cancelled: { label: 'İptal Edildi', color: 'danger', icon: '❌' },
      returned: { label: 'İade Edildi', color: 'secondary', icon: '↩️' }
    };
    return statuses[status] || { label: status, color: 'secondary', icon: '❓' };
  };

  const filterOrders = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  };

  const handleTrackOrder = (orderNumber) => {
    toast.info(`${orderNumber} numaralı sipariş takip özelliği yakında gelecek!`);
  };

  const handleReorder = (orderId) => {
    toast.info('Tekrar sipariş özelliği yakında gelecek!');
  };

  const handleReturnRequest = (orderId) => {
    toast.info('İade talebi özelliği yakında gelecek!');
  };

  const stats = getOrderStats();
  const filteredOrders = filterOrders(activeTab);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Siparişleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-6">📋 Siparişlerim</h1>
          <p className="text-muted">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-primary">📋</div>
              <h5>{stats.total}</h5>
              <small className="text-muted">Toplam</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-warning">⏳</div>
              <h5>{stats.processing}</h5>
              <small className="text-muted">Hazırlanıyor</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-primary">🚚</div>
              <h5>{stats.shipped}</h5>
              <small className="text-muted">Kargoda</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-success">✅</div>
              <h5>{stats.delivered}</h5>
              <small className="text-muted">Teslim Edildi</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-danger">❌</div>
              <h5>{stats.cancelled}</h5>
              <small className="text-muted">İptal</small>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="display-6 text-info">💰</div>
              <h5>{formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}</h5>
              <small className="text-muted">Toplam Harcama</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
                type="button"
              >
                📋 Tümü ({stats.total})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'processing' ? 'active' : ''}`}
                onClick={() => setActiveTab('processing')}
                type="button"
              >
                📦 Hazırlanıyor ({stats.processing})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'shipped' ? 'active' : ''}`}
                onClick={() => setActiveTab('shipped')}
                type="button"
              >
                🚚 Kargoda ({stats.shipped})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'delivered' ? 'active' : ''}`}
                onClick={() => setActiveTab('delivered')}
                type="button"
              >
                ✅ Teslim Edildi ({stats.delivered})
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <div className="display-4 mb-3">📦</div>
              <h5>
                {activeTab === 'all' ? 'Henüz siparişiniz bulunmuyor' : 'Bu durumda sipariş bulunamadı'}
              </h5>
              <p className="text-muted mb-4">
                {activeTab === 'all' 
                  ? 'Alışverişe başlamak için ürünleri inceleyin'
                  : 'Diğer sipariş durumlarını kontrol edin'
                }
              </p>
              {activeTab === 'all' && (
                <Link to="/products" className="btn btn-primary">
                  🛍️ Alışverişe Başla
                </Link>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div key={order.id} className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          {/* Order Info */}
                          <div className="col-md-3">
                            <h6 className="mb-1">
                              {statusInfo.icon} {order.order_number}
                            </h6>
                            <small className="text-muted">
                              {formatDate(order.date)}
                            </small>
                            <div className="mt-2">
                              <span className={`badge bg-${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Products */}
                          <div className="col-md-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="d-flex align-items-center mb-2">
                                <span className="me-2">{item.image}</span>
                                <div>
                                  <div className="fw-semibold">{item.name}</div>
                                  <small className="text-muted">
                                    {item.quantity} adet × {formatPrice(item.price)}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total */}
                          <div className="col-md-2 text-center">
                            <div className="fw-bold text-primary">
                              {formatPrice(order.total)}
                            </div>
                            <small className="text-muted">Toplam</small>
                          </div>

                          {/* Actions */}
                          <div className="col-md-3">
                            <div className="d-grid gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleTrackOrder(order.order_number)}
                              >
                                📍 Takip Et
                              </button>
                              
                              {order.status === 'delivered' && (
                                <div className="btn-group">
                                  <button
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => handleReorder(order.id)}
                                  >
                                    🔄 Tekrar Sipariş
                                  </button>
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => handleReturnRequest(order.id)}
                                  >
                                    ↩️ İade
                                  </button>
                                </div>
                              )}

                              {['pending', 'processing'].includes(order.status) && (
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => toast.info('Sipariş iptal özelliği yakında gelecek!')}
                                >
                                  ❌ İptal Et
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {orders.length > 0 && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-light">
            <h6 className="mb-0">🚀 Hızlı İşlemler</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <Link to="/products" className="btn btn-primary w-100">
                  🛍️ Yeni Alışveriş
                </Link>
              </div>
              <div className="col-md-3">
                <button className="btn btn-outline-info w-100">
                  📞 Müşteri Hizmetleri
                </button>
              </div>
              <div className="col-md-3">
                <button className="btn btn-outline-success w-100">
                  💳 Ödeme Geçmişi
                </button>
              </div>
              <div className="col-md-3">
                <button className="btn btn-outline-secondary w-100">
                  📧 Fatura Talep Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;