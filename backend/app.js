require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const csrf = require('csurf');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const xss = require('xss-clean');

// Swagger konfigürasyonu
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

// Güvenlik ve JWT Ayarları
const JWT_SECRET = process.env.JWT_SECRET || 'kolaysatis_super_secret_key_2024';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'kolaysatis_refresh_key_2024';
const TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 saat
const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer'
};

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Çok fazla istek gönderdiniz, lütfen bir süre sonra tekrar deneyin.'
});

// Veritabanı bağlantısı
const sequelize = require('./config/database');

// Session store
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: SESSION_TIMEOUT
});

// Middleware'ler
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:']
    }
  }
}));
app.use(xss());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(limiter);
app.use(session({
  secret: process.env.SESSION_SECRET || 'kolaysatis_session_secret_2024',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: SESSION_TIMEOUT,
    sameSite: 'strict'
  }
}));

// CSRF koruması (API'ler için devre dışı, form tabanlı işlemler için etkin)
const csrfProtection = csrf({ cookie: true });
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  csrfProtection(req, res, next);
});

// Swagger UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Veritabanı modelleri
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Auth middleware'leri
const { authenticateToken, requireRole } = require('./middleware/auth');

// JWT Token oluşturma fonksiyonu
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );
};

// SQL Injection koruması için veri temizleme
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/['";\\]/g, '');
  }
  return input;
};

// Oturum zaman aşımı kontrolü
const checkSessionTimeout = (req, res, next) => {
  if (req.session && req.session.lastActivity) {
    const inactiveTime = Date.now() - req.session.lastActivity;
    if (inactiveTime > SESSION_TIMEOUT) {
      req.session.destroy();
      res.clearCookie('refreshToken');
      res.clearCookie('cart');
      return res.status(401).json({
        message: 'Oturum süreniz doldu, lütfen tekrar giriş yapın.',
        error: 'Session expired'
      });
    }
  }
  
  if (req.session) {
    req.session.lastActivity = Date.now();
  }
  next();
};

// Rol bazlı erişim kontrol middleware'i
const roleCheck = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Yetkilendirme gerekiyor',
        error: 'Unauthorized'
      });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Bu işlem için yetkiniz yok',
        error: 'Forbidden',
        requiredRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin kontrolü
const requireAdmin = roleCheck([ROLES.ADMIN]);

// Satıcı veya Admin kontrolü
const requireSellerOrAdmin = roleCheck([ROLES.SELLER, ROLES.ADMIN]);

// Müşteri kontrolü
const requireCustomer = roleCheck([ROLES.CUSTOMER]);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Ana Sayfa
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "KolaySatis Backend API çalışıyor!"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 swagger:
 *                   type: string
 *                   example: "/api-docs"
 *                 database:
 *                   type: string
 *                   example: "PostgreSQL + Sequelize"
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                 security:
 *                   type: object
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'KolaySatis Backend API çalışıyor!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    swagger: '/api-docs',
    database: 'PostgreSQL + Sequelize',
    features: [
      'JWT Authentication',
      'Token Refresh Mechanism',
      'Session Management',
      'Shopping Cart in Cookies',
      'Role-Based Access Control',
      'Swagger API Documentation'
    ],
    security: {
      xss: true,
      sqlInjection: true,
      csrf: true,
      rateLimiting: true,
      roleBasedAccess: true
    }
  });
});

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: API Test Endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Test başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API endpoint test başarılı!',
    status: 'success'
  });
});

/**
 * @swagger
 * /api/db-test:
 *   get:
 *     summary: Veritabanı Bağlantı Testi
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Veritabanı bağlantısı başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database bağlantısı başarılı!"
 *                 status:
 *                   type: string
 *                   example: "connected"
 *                 database:
 *                   type: string
 *                   example: "PostgreSQL"
 *       500:
 *         description: Veritabanı bağlantı hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/db-test', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    console.log('✅ Database bağlantısı başarılı!');
    res.json({
      message: 'Database bağlantısı başarılı!',
      status: 'connected',
      database: 'PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database bağlantı hatası!',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users-test:
 *   get:
 *     summary: Kullanıcı Tablosu Test
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Kullanıcı tablosu hazır
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User tablosu hazır!"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 userCount:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: Tablo hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/users-test', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    const User = require('./models/User');

    await sequelize.sync();

    // User sayısını al
    const userCount = await User.count();
    
    res.json({
      message: 'User tablosu hazır!',
      status: 'success',
      userCount: userCount,
      info: 'Tablo başarıyla oluşturuldu'
    });
  } catch (error) {
    res.status(500).json({
      message: 'User tablo hatası!',
      status: 'error', 
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/create-test-users:
 *   get:
 *     summary: Test Kullanıcıları Oluştur
 *     tags: [Development]
 *     description: Geliştirme amaçlı test kullanıcıları oluşturur (Admin, Satıcı, Müşteri)
 *     responses:
 *       200:
 *         description: Test kullanıcıları başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Test kullanıcıları başarıyla oluşturuldu!"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       500:
 *         description: Test kullanıcıları oluşturulamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/create-test-users', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    // Tabloyu sync et
    const sequelize = require('./config/database');
    await sequelize.sync();

     // Önceki test kullanıcılarını sil
    await User.destroy({ where: {} });
      
    // Test kullanıcılarını tanımla
    const ROLES = {
      ADMIN: 'admin',
      SELLER: 'seller',
      CUSTOMER: 'customer'
    };
    const testUsers = [
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@kolaysatis.com',
        password: await bcrypt.hash('123456', 10),
        role: ROLES.ADMIN
      },
      {
        first_name: 'Satıcı',
        last_name: 'Test',
        email: 'seller@kolaysatis.com', 
        password: await bcrypt.hash('123456', 10),
        role: ROLES.SELLER
      },
      {
        first_name: 'Müşteri',
        last_name: 'Test',
        email: 'customer@kolaysatis.com',
        password: await bcrypt.hash('123456', 10),
        role: ROLES.CUSTOMER
      }
    ];
    
    const createdUsers = await User.bulkCreate(testUsers);
    
    res.json({
      message: 'Test kullanıcıları başarıyla oluşturuldu!',
      status: 'success',
      count: createdUsers.length,
      users: createdUsers.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role
      }))
    });

  } catch (error) {
    res.status(500).json({
      message: 'Test kullanıcıları oluşturulamadı!',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/create-test-categories:
 *   get:
 *     summary: Test Kategorileri Oluştur
 *     tags: [Development]
 *     description: Geliştirme amaçlı test kategorileri oluşturur
 *     responses:
 *       200:
 *         description: Test kategorileri başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
app.get('/api/create-test-categories', async (req, res) => {
  try {
    const Category = require('./models/Category');
    const sequelize = require('./config/database');
    // Tabloyu sync et
    await sequelize.sync();
    // Önceki test kategorilerini sil
    await Category.destroy({ where: {} });
    // Test kategorilerini tanımla
    const testCategories = [
      {
        name: 'Elektronik',
        description: 'Elektronik ürünler kategorisi',
        sort_order: 1
      },
      {
        name: 'Giyim',
        description: 'Giyim ve aksesuar kategorisi',
        sort_order: 2
      },
      {
        name: 'Ev & Bahçe',
        description: 'Ev ve bahçe ürünleri',
        sort_order: 3
      }
    ];
    
    const createdCategories = await Category.bulkCreate(testCategories);
    
    res.json({
      message: 'Test kategorileri başarıyla oluşturuldu!',
      status: 'success',
      count: createdCategories.length,
      categories: createdCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      }))
    });

  } catch (error) {
    res.status(500).json({
      message: 'Test kategorileri oluşturulamadı!',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/create-test-products:
 *   get:
 *     summary: Test Ürünleri Oluştur
 *     tags: [Development]
 *     description: Geliştirme amaçlı test ürünleri oluşturur
 *     responses:
 *       200:
 *         description: Test ürünleri başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
app.get('/api/create-test-products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const Category = require('./models/Category');
    const sequelize = require('./config/database');
    // Tabloyu sync et
    await sequelize.sync();
    
    const seller = await User.findOne({ where: { role: ROLES.SELLER } });
    const categories = await Category.findAll();
    
    if (!seller || categories.length === 0) {
      return res.status(400).json({
        message: 'Önce kullanıcı ve kategorileri oluşturun!',
        status: 'error'
      });
    }
    // Önceki test ürünlerini sil
    await Product.destroy({ where: {} });
    // Test ürünlerini tanımla
    const testProducts = [
      {
        name: 'iPhone 15 Pro',
        description: 'Apple iPhone 15 Pro 128GB',
        short_description: 'En yeni iPhone modeli',
        price: 45000.00,
        sale_price: 42000.00,
        sku: 'IPHONE15PRO128',
        stock_quantity: 10,
        category_id: categories[0].id,
        seller_id: seller.id,
        status: 'published'
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Samsung Galaxy S24 256GB',
        short_description: 'Android telefon',
        price: 35000.00,
        sku: 'GALAXYS24256',
        stock_quantity: 15,
        category_id: categories[0].id,
        seller_id: seller.id,
        status: 'published'
      },
      {
        name: 'Nike Air Max',
        description: 'Nike Air Max spor ayakkabı',
        short_description: 'Rahat spor ayakkabı',
        price: 2500.00,
        sku: 'NIKEAIRMAX001',
        stock_quantity: 20,
        category_id: categories[1].id,
        seller_id: seller.id,
        status: 'published'
      }
    ];
    
    const createdProducts = await Product.bulkCreate(testProducts);
    
    res.json({
      message: 'Test ürünleri başarıyla oluşturuldu!',
      status: 'success',
      count: createdProducts.length,
      products: createdProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku,
        status: product.status
      }))
    });

  } catch (error) {
    res.status(500).json({
      message: 'Test ürünleri oluşturulamadı!',
      status: 'error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Token Yenileme
 *     tags: [Authentication]
 *     description: Refresh token kullanarak yeni access token alır
 *     responses:
 *       200:
 *         description: Token başarıyla yenilendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token başarıyla yenilendi"
 *                 token:
 *                   type: string
 *                   description: "Yeni access token"
 *                 expiresIn:
 *                   type: string
 *                   example: "15m"
 *       401:
 *         description: Refresh token bulunamadı veya geçersiz
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token bulunamadı',
        error: 'Unauthorized'
      });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        message: 'Kullanıcı geçersiz veya aktif değil!',
        error: 'Unauthorized'
      });
    }

    const newAccessToken = generateToken(user);
    const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRATION 
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Token başarıyla yenilendi',
      token: newAccessToken,
      expiresIn: TOKEN_EXPIRATION
    });
  } catch (error) {
    console.error('❌ Refresh token hatası:', error.message);
    res.clearCookie('refreshToken');
    
    return res.status(403).json({
      message: 'Refresh token geçersiz veya süresi dolmuş!',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Kullanıcı Girişi
 *     tags: [Authentication]
 *     description: E-posta ve şifre ile kullanıcı girişi yapar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Admin Girişi
 *               value:
 *                 email: "admin@kolaysatis.com"
 *                 password: "123456"
 *             seller:
 *               summary: Satıcı Girişi
 *               value:
 *                 email: "seller@kolaysatis.com"
 *                 password: "123456"
 *             customer:
 *               summary: Müşteri Girişi
 *               value:
 *                 email: "customer@kolaysatis.com"
 *                 password: "123456"
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Geçersiz giriş bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/login', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli email adresi girin'),
  body('password').notEmpty().withMessage('Şifre zorunlu')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation hatası!',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email);
    const user = await User.findOne({ where: { email: sanitizedEmail } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: 'Email veya şifre hatalı!',
        error: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        message: 'Hesabınız aktif değil!',
        error: 'Account not active'
      });
    }

    await user.update({ last_login: new Date() });
    const token = generateToken(user);
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRATION 
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    req.session.userId = user.id;
    req.session.lastActivity = Date.now();

    res.json({
      message: 'Giriş başarılı!',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role
      },
      token,
      expiresIn: TOKEN_EXPIRATION
    });
  } catch (error) {
    res.status(500).json({
      message: 'Giriş yapılamadı!',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Kullanıcı Çıkışı
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Yetkilendirme gerekli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/logout', authenticateToken, (req, res) => {
  req.session.destroy();
  res.clearCookie('refreshToken');
  res.clearCookie('cart');
  
  res.json({
    message: 'Başarıyla çıkış yapıldı',
    status: 'success'
  });
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Sepet Güncelle
 *     tags: [Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     name:
 *                       type: string
 *     responses:
 *       200:
 *         description: Sepet başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sepet başarıyla güncellendi!"
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Geçersiz sepet verisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Sepet Getir
 *     tags: [Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sepet başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 */
app.post('/api/cart', authenticateToken, checkSessionTimeout, (req, res) => {
  const cart = req.body.cart;

  if (!cart || !Array.isArray(cart) || !cart.every(item => 
    item.productId && item.quantity && item.price
  )) {
    return res.status(400).json({
      message: 'Geçersiz sepet verisi!',
      error: 'Invalid cart format'
    });
  }

  // XSS koruması için çıktı temizleme
  const sanitizedCart = cart.map(item => ({
    productId: sanitizeInput(item.productId),
    quantity: sanitizeInput(item.quantity),
    price: sanitizeInput(item.price),
    name: xss(item.name)
  }));

  res.cookie('cart', JSON.stringify(sanitizedCart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TIMEOUT
  });

  res.json({
    message: 'Sepet başarıyla güncellendi!',
    cart: sanitizedCart
  });
});

app.get('/api/cart', authenticateToken, checkSessionTimeout, (req, res) => {
  const cartCookie = req.cookies.cart;

  if (!cartCookie) {
    return res.json({
      message: 'Sepet boş',
      cart: []
    });
  }

  try {
    const cart = JSON.parse(cartCookie);
    res.json({
      message: 'Sepet başarıyla getirildi',
      cart
    });
  } catch (err) {
    res.clearCookie('cart');
    res.status(400).json({
      message: 'Sepet verisi bozuk, sepet sıfırlandı',
      cart: []
    });
  }
});

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Kullanıcı Kaydı
 *     tags: [Authentication]
 *     description: Yeni kullanıcı hesabı oluşturur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             customer:
 *               summary: Müşteri Kaydı
 *               value:
 *                 first_name: "Ahmet"
 *                 last_name: "Yılmaz"
 *                 email: "ahmet@example.com"
 *                 password: "123456"
 *                 role: "customer"
 *             seller:
 *               summary: Satıcı Kaydı
 *               value:
 *                 first_name: "Ayşe"
 *                 last_name: "Kaya"
 *                 email: "ayse@example.com"
 *                 password: "123456"
 *                 role: "seller"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kullanıcı başarıyla oluşturuldu!"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation hatası veya email zaten mevcut
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/register', [
  body('first_name').notEmpty().trim().escape().withMessage('Ad zorunlu'),
  body('last_name').notEmpty().trim().escape().withMessage('Soyad zorunlu'),
  body('email').isEmail().normalizeEmail().withMessage('Geçerli email adresi girin'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Geçersiz rol')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation hatası!',
        errors: errors.array()
      });
    }

    const { first_name, last_name, email, password, role = ROLES.CUSTOMER } = req.body;
    
    // SQL Injection koruması
    const sanitizedEmail = sanitizeInput(email);
    const existingUser = await User.findOne({ where: { email: sanitizedEmail } });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Bu email adresi zaten kullanılıyor!',
        error: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      first_name: sanitizeInput(first_name),
      last_name: sanitizeInput(last_name),
      email: sanitizedEmail,
      password: hashedPassword,
      role: sanitizeInput(role)
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu!',
      user: {
        id: newUser.id,
        name: `${newUser.first_name} ${newUser.last_name}`,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Kullanıcı oluşturulamadı!',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Kullanıcı Profili
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil bilgileri"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Yetkilendirme gerekli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/profile', authenticateToken, checkSessionTimeout, (req, res) => {
  res.json({
    message: 'Profil bilgileri',
    user: req.user
  });
});

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin Dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Admin paneli bilgileri (sadece admin erişebilir)
 *     responses:
 *       200:
 *         description: Admin dashboard bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin paneline hoş geldiniz!"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 125
 *                     activeProducts:
 *                       type: integer
 *                       example: 42
 *                     recentOrders:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Yetkilendirme gerekli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetkisiz erişim (admin rolü gerekli)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, checkSessionTimeout, (req, res) => {
  res.json({
    message: 'Admin paneline hoş geldiniz!',
    user: req.user,
    stats: {
      totalUsers: 125,
      activeProducts: 42,
      recentOrders: 15
    }
  });
});

/**
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: Satıcının Ürünleri
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     description: Satıcının kendi ürünlerini listeler (satıcı veya admin erişebilir)
 *     responses:
 *       200:
 *         description: Satıcı ürünleri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Satıcı ürünleri"
 *                 count:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Yetkilendirme gerekli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetkisiz erişim (satıcı veya admin rolü gerekli)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/seller/products', authenticateToken, requireSellerOrAdmin, checkSessionTimeout, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.user.id },
      attributes: ['id', 'name', 'price', 'stock_quantity', 'status']
    });
    
    res.json({
      message: 'Satıcı ürünleri',
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ürünler getirilemedi',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/customer/cart:
 *   post:
 *     summary: Müşteri Sepet İşlemleri
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     description: Müşteri sepet güncelleme (sadece müşteri erişebilir)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     name:
 *                       type: string
 *     responses:
 *       200:
 *         description: Sepet başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Yetkisiz erişim (müşteri rolü gerekli)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/customer/cart', authenticateToken, requireCustomer, checkSessionTimeout, (req, res) => {
  const cart = req.body.cart;

  if (!cart || !Array.isArray(cart) || !cart.every(item => 
    item.productId && item.quantity && item.price
  )) {
    return res.status(400).json({
      message: 'Geçersiz sepet verisi!',
      error: 'Invalid cart format'
    });
  }

  // XSS koruması için çıktı temizleme
  const sanitizedCart = cart.map(item => ({
    productId: sanitizeInput(item.productId),
    quantity: sanitizeInput(item.quantity),
    price: sanitizeInput(item.price),
    name: xss(item.name)
  }));

  res.cookie('cart', JSON.stringify(sanitizedCart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TIMEOUT
  });

  res.json({
    message: 'Sepet başarıyla güncellendi!',
    cart: sanitizedCart
  });
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm Ürünleri Listele
 *     tags: [Products]
 *     description: Sistemdeki tüm ürünleri listeler
 *     responses:
 *       200:
 *         description: Ürünler başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ürünler listelendi"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       404:
 *         description: Ürün bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ürün bulunamadı"
 *                 products:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.findAll();
    if (products.length === 0) {
      return res.status(404).json({
        message: 'Ürün bulunamadı',
        products: []
      });
    }
    res.json({
      message: 'Ürünler listelendi',
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ürünler listelenemedi',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Tüm Kategorileri Listele
 *     tags: [Categories]
 *     description: Sistemdeki tüm kategorileri sıralı olarak listeler
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kategoriler listelendi"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/categories', async (req, res) => {
  try {
    const Category = require('./models/Category');
    // Kategorileri sıralı olarak al
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC']]
    });
    
    res.json({
      message: 'Kategoriler listelendi',
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      message: 'Kategoriler listelenemedi',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Tüm Kullanıcıları Listele
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Sistemdeki tüm kullanıcıları listeler (sadece admin erişebilir)
 *     responses:
 *       200:
 *         description: Kullanıcılar başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kullanıcılar listelendi"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Yetkilendirme gerekli
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Yetkisiz erişim (admin rolü gerekli)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active']
    });
    
    res.json({
      message: 'Kullanıcılar listelendi',
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Kullanıcılar listelenemedi',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: CSRF Token Al
 *     tags: [Security]
 *     description: Form tabanlı işlemler için CSRF token alır
 *     responses:
 *       200:
 *         description: CSRF token başarıyla döndürüldü
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   description: CSRF token
 */
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı!' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ 
      message: 'Geçersiz CSRF token!',
      error: 'CSRF token validation failed'
    });
  }

  console.error('Server Hatası:', err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Veritabanı senkronizasyonu ve sunucu başlatma
sequelize.sync().then(() => {
  sessionStore.sync();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KolaySatis Backend ${PORT} portunda çalışıyor!`);
    console.log(`🔐 Güvenlik Önlemleri:`);
    console.log(`- XSS Koruması: Aktif`);
    console.log(`- SQL Injection Önleme: Aktif`);
    console.log(`- CSRF Koruması: Aktif`);
    console.log(`- Rol Bazlı Erişim: Aktif (Admin, Satıcı, Müşteri)`);
    console.log(`- Rate Limiting: Aktif`);
    console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`📋 API Test: http://localhost:${PORT}/api/test`);
    console.log(`🗄️ DB Test: http://localhost:${PORT}/api/db-test`);
    console.log(`👤 Users Test: http://localhost:${PORT}/api/users-test`);
  });
}).catch(err => {
  console.error('Veritabanı bağlantı hatası:', err);
});