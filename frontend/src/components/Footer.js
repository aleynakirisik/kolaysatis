import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-5">
      <div className="container py-5">
        <div className="row">
          {/* Company Info */}
          <div className="col-lg-4 mb-4">
            <h5 className="mb-3 text-white">
              <span className="me-2">🛒</span>
              KolaySatis
            </h5>
            <p className="text-light">
              Türkiye'nin en güvenilir e-ticaret platformu. 
              Binlerce ürün, uygun fiyatlar ve hızlı teslimat ile 
              alışverişin keyfini çıkarın.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="text-light" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="text-light" aria-label="Instagram">
                📷
              </a>
              <a href="#" className="text-light" aria-label="LinkedIn">
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="mb-3 text-white">Hızlı Erişim</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">
                  🏠 Ana Sayfa
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-light text-decoration-none">
                  📦 Ürünler
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-light text-decoration-none">
                  🛒 Sepetim
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/dashboard" className="text-light text-decoration-none">
                  📊 Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="mb-3 text-white">Kategoriler</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products?category=1" className="text-light text-decoration-none">
                  📱 Elektronik
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=2" className="text-light text-decoration-none">
                  👕 Giyim
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=3" className="text-light text-decoration-none">
                  🏠 Ev & Bahçe
                </Link>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  📚 Kitap
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="mb-3 text-white">Müşteri Hizmetleri</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  ❓ Sıkça Sorulan Sorular
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  📞 İletişim
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  ↩️ İade & Değişim
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-light text-decoration-none">
                  📋 Sipariş Takibi
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="mb-3 text-white">İletişim</h6>
            <ul className="list-unstyled text-light">
              <li className="mb-2">
                <small>
                  📍 İstanbul, Türkiye
                </small>
              </li>
              <li className="mb-2">
                <small>
                  📞 +90 (555) 123 45 67
                </small>
              </li>
              <li className="mb-2">
                <small>
                  📧 info@kolaysatis.com
                </small>
              </li>
              <li className="mb-2">
                <small>
                  🕐 7/24 Müşteri Hizmetleri
                </small>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <hr className="my-4 border-light" />
        <div className="row">
          <div className="col-md-3 mb-3 text-center">
            <div className="mb-2">🚚</div>
            <h6 className="mb-1 text-white">Hızlı Kargo</h6>
            <small className="text-light">24 saat içinde teslimat</small>
          </div>
          <div className="col-md-3 mb-3 text-center">
            <div className="mb-2">🔒</div>
            <h6 className="mb-1 text-white">Güvenli Ödeme</h6>
            <small className="text-light">256-bit SSL şifreleme</small>
          </div>
          <div className="col-md-3 mb-3 text-center">
            <div className="mb-2">↩️</div>
            <h6 className="mb-1 text-white">Kolay İade</h6>
            <small className="text-light">15 gün içinde iade</small>
          </div>
          <div className="col-md-3 mb-3 text-center">
            <div className="mb-2">💳</div>
            <h6 className="mb-1 text-white">Esnek Ödeme</h6>
            <small className="text-light">Tüm kartlar kabul edilir</small>
          </div>
        </div>

        {/* Payment Methods */}
        <hr className="my-4 border-light" />
        <div className="row align-items-center">
          <div className="col-md-6 mb-3">
            <h6 className="mb-2 text-white">Ödeme Yöntemleri</h6>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge bg-light text-dark p-2">💳 Visa</span>
              <span className="badge bg-light text-dark p-2">💳 Mastercard</span>
              <span className="badge bg-light text-dark p-2">💰 Garanti</span>
              <span className="badge bg-light text-dark p-2">🏦 İş Bankası</span>
              <span className="badge bg-light text-dark p-2">📱 Apple Pay</span>
              <span className="badge bg-light text-dark p-2">🤖 Google Pay</span>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <h6 className="mb-2 text-white">Güvenlik Sertifikaları</h6>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge bg-success p-2">🔒 SSL</span>
              <span className="badge bg-info p-2">🛡️ PCI DSS</span>
              <span className="badge bg-warning text-dark p-2">✅ Güvenli</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-md-6 mb-2 mb-md-0">
              <p className="mb-0 text-light">
                &copy; {currentYear} KolaySatis. Tüm hakları saklıdır.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex gap-3 justify-content-md-end">
                <a href="#" className="text-light text-decoration-none">
                  📄 Gizlilik Politikası
                </a>
                <a href="#" className="text-light text-decoration-none">
                  📋 Kullanım Şartları
                </a>
                <a href="#" className="text-light text-decoration-none">
                  🍪 Çerez Politikası
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;