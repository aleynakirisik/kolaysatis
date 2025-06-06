🛒 KolaySatis E-Ticaret Platformu
Modern, güvenli ve ölçeklenebilir e-ticaret platformu. React frontend, Node.js backend ve PostgreSQL veritabanı ile geliştirilmiştir.
📋 İçindekiler

Özellikler
Teknoloji Yığını
Kurulum
Kullanım
API Dokümantasyonu
Güvenlik
Test Kullanıcıları
Katkı Sağlama
Lisans

✨ Özellikler
🔐 Kimlik Doğrulama & Yetkilendirme

JWT tabanlı kimlik doğrulama
Refresh token mekanizması
Rol bazlı erişim kontrolü (Admin, Satıcı, Müşteri)
Güvenli session yönetimi

🛍️ E-Ticaret Özellikleri

Ürün katalog yönetimi
Kategori sistemi
Gelişmiş sepet işlevleri
Stok takibi
Fiyat ve indirim yönetimi

👑 Admin Paneli

Kullanıcı yönetimi
Ürün ve kategori CRUD işlemleri
Sistem istatistikleri
Test verisi oluşturma araçları

🏪 Satıcı Paneli

Kendi ürünlerini yönetme
Sipariş takibi
Satış istatistikleri

💳 Müşteri Özellikleri

Ürün arama ve filtreleme
Sepet yönetimi
Sipariş geçmişi
Profil yönetimi

🛠 Teknoloji Yığını
Frontend

React 18 - Modern UI kütüphanesi
React Router - SPA yönlendirme
Bootstrap 5 - Responsive tasarım
Axios - HTTP istekleri
React Hook Form - Form yönetimi
React Toastify - Bildirimler

Backend

Node.js - JavaScript runtime
Express.js - Web framework
Sequelize - ORM (Object-Relational Mapping)
PostgreSQL - İlişkisel veritabanı
JWT - Token tabanlı kimlik doğrulama
bcryptjs - Şifre hashleme

Güvenlik

Helmet - HTTP header güvenliği
CORS - Cross-Origin Resource Sharing
Rate Limiting - İstek sınırlama
XSS Clean - XSS saldırı koruması
CSRF Protection - CSRF token koruması
Input Validation - Veri doğrulama

DevOps

Docker - Konteynerizasyon
Docker Compose - Multi-container yönetimi

🚀 Kurulum
Gereksinimler

Node.js (v18 veya üzeri)
Docker & Docker Compose
Git

1. Projeyi Klonlayın
bashgit clone https://github.com/aleynakirisik/KolaySatis.git
cd KolaySatis
2. Docker ile Kurulum (Önerilen)
bash# Tüm servisleri başlatın
docker-compose up -d

# Logları takip edin
docker-compose logs -f
3. Manuel Kurulum
Backend Kurulumu
bashcd backend
npm install

# Çevre değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanını başlatın
npm run dev
Frontend Kurulumu
bashcd frontend
npm install

# Development sunucusunu başlatın
npm start
4. Veritabanı Kurulumu
bash# PostgreSQL'i Docker ile çalıştırın
docker run --name kolaysatis-db \
  -e POSTGRES_DB=kolaysatis \
  -e POSTGRES_USER=kolaysatis_user \
  -e POSTGRES_PASSWORD=kolaysatis_pass \
  -p 5432:5432 -d postgres:15
📱 Kullanım
Uygulama URL'leri

Frontend: http://localhost:3000
Backend API: http://localhost:3001
API Dokümantasyonu: http://localhost:3001/api/test

İlk Adımlar

http://localhost:3000 adresine gidin
Test kullanıcılarından biriyle giriş yapın
Dashboard üzerinden platformu keşfedin

📚 API Dokümantasyonu
Kimlik Doğrulama Endpoints
httpPOST /api/register     # Kullanıcı kaydı
POST /api/login        # Giriş yapma
POST /api/logout       # Çıkış yapma
POST /api/refresh-token # Token yenileme
GET  /api/profile      # Profil bilgileri
Ürün Endpoints
httpGET    /api/products           # Tüm ürünler
GET    /api/products/:id       # Ürün detayı
POST   /api/products           # Yeni ürün (Satıcı/Admin)
PUT    /api/products/:id       # Ürün güncelle (Satıcı/Admin)
DELETE /api/products/:id       # Ürün sil (Satıcı/Admin)
Kategori Endpoints
httpGET    /api/categories         # Tüm kategoriler
GET    /api/categories/:id     # Kategori detayı
POST   /api/categories         # Yeni kategori (Admin)
PUT    /api/categories/:id     # Kategori güncelle (Admin)
DELETE /api/categories/:id     # Kategori sil (Admin)
Sepet Endpoints
httpGET    /api/cart              # Sepet görüntüle
POST   /api/cart              # Sepet güncelle
DELETE /api/cart              # Sepeti temizle
Admin Endpoints
httpGET    /api/admin/dashboard   # Admin istatistikleri
GET    /api/users             # Kullanıcı listesi
POST   /api/users             # Yeni kullanıcı
PUT    /api/users/:id         # Kullanıcı güncelle
DELETE /api/users/:id         # Kullanıcı sil
🔒 Güvenlik
Proje aşağıdaki güvenlik önlemlerini içerir:

JWT Authentication: Güvenli token tabanlı kimlik doğrulama
Password Hashing: bcrypt ile şifre hashleme
Rate Limiting: Brute force saldırı koruması
CORS Protection: Cross-origin istekleri kontrol
XSS Protection: Cross-site scripting koruması
CSRF Protection: Cross-site request forgery koruması
SQL Injection Prevention: Parameterized queries
Input Validation: Kullanıcı girdi doğrulama
Secure Headers: Helmet.js ile HTTP header güvenliği

👥 Test Kullanıcıları
Platform test edilmesi için hazır kullanıcılar içerir:
Admin Kullanıcısı

Email: admin@kolaysatis.com
Şifre: 123456
Yetkiler: Tüm sistem yönetimi

Satıcı Kullanıcısı

Email: seller@kolaysatis.com
Şifre: 123456
Yetkiler: Ürün yönetimi, sipariş takibi

Müşteri Kullanıcısı

Email: customer@kolaysatis.com
Şifre: 123456
Yetkiler: Alışveriş, sepet yönetimi

Test Verilerini Oluşturma
bash# API endpoint'leri ile test verilerini oluşturun
GET /api/create-test-users
GET /api/create-test-categories
GET /api/create-test-products
🏗 Proje Yapısı
KolaySatis/
├── backend/                 # Node.js backend
│   ├── config/             # Veritabanı yapılandırması
│   ├── middleware/         # Express middleware'leri
│   ├── models/             # Sequelize modelleri
│   ├── routes/             # API route'ları
│   ├── app.js              # Ana uygulama dosyası
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── services/       # API servisleri
│   │   ├── App.js          # Ana React bileşeni
│   │   └── index.js
│   └── package.json
├── docker-compose.yml      # Docker Compose yapılandırması
└── README.md