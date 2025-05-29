const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;
const User = require('./models/User');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const { generateToken, authenticateToken, requireAdmin, requireSellerOrAdmin } = require('./middleware/auth');
const { body, validationResult } = require('express-validator');

// Mevcut routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'KolaySatis Backend API çalışıyor!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL + Sequelize'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API endpoint test başarılı!',
    status: 'success'
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    
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

// User table test endpoint
app.get('/api/users-test', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    const User = require('./models/User');
    
    // Tabloları oluştur
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

// Test kullanıcıları oluştur (GET)
app.get('/api/create-test-users', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Tabloyu sync et
    const sequelize = require('./config/database');
    await sequelize.sync();
    
    // Önceki test kullanıcılarını sil
    await User.destroy({ where: {} });
    
    // Test kullanıcıları oluştur
    const testUsers = [
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@kolaysatis.com',
        password: '123456',
        role: 'admin'
      },
      {
        first_name: 'Satıcı',
        last_name: 'Test',
        email: 'seller@kolaysatis.com', 
        password: '123456',
        role: 'seller'
      },
      {
        first_name: 'Müşteri',
        last_name: 'Test',
        email: 'customer@kolaysatis.com',
        password: '123456',
        role: 'customer'
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

// Test kategorileri oluştur
app.get('/api/create-test-categories', async (req, res) => {
  try {
    const Category = require('./models/Category');
    const sequelize = require('./config/database');
    
    // Category tablosunu sync et
    await sequelize.sync();
    
    // Önceki kategorileri sil
    await Category.destroy({ where: {} });
    
    // Test kategorileri oluştur
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

// Test ürünleri oluştur
app.get('/api/create-test-products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const Category = require('./models/Category');
    const sequelize = require('./config/database');
    
    // Product tablosunu sync et
    await sequelize.sync();
    
    // Satıcı ve kategori bul
    const seller = await User.findOne({ where: { role: 'seller' } });
    const categories = await Category.findAll();
    
    if (!seller || categories.length === 0) {
      return res.status(400).json({
        message: 'Önce kullanıcı ve kategorileri oluşturun!',
        status: 'error'
      });
    }
    
    // Önceki ürünleri sil
    await Product.destroy({ where: {} });
    
    // Test ürünleri oluştur
    const testProducts = [
      {
        name: 'iPhone 15 Pro',
        description: 'Apple iPhone 15 Pro 128GB',
        short_description: 'En yeni iPhone modeli',
        price: 45000.00,
        sale_price: 42000.00,
        sku: 'IPHONE15PRO128',
        stock_quantity: 10,
        category_id: categories[0].id, // Elektronik
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
        category_id: categories[0].id, // Elektronik
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
        category_id: categories[1].id, // Giyim
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

// Products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.findAll();
    
    res.json({
      message: 'Ürünler listelendi',
      count: products.length,
      products: products
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ürünler listelenemedi',
      error: error.message
    });
  }
});

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const Category = require('./models/Category');
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC']]
    });
    
    res.json({
      message: 'Kategoriler listelendi',
      count: categories.length,
      categories: categories
    });
  } catch (error) {
    res.status(500).json({
      message: 'Kategoriler listelenemedi',
      error: error.message
    });
  }
});

// Users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active']
    });
    
    res.json({
      message: 'Kullanıcılar listelendi',
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Kullanıcılar listelenemedi',
      error: error.message
    });
  }
});

// Register endpoint
app.post('/api/register', [
  body('first_name').notEmpty().withMessage('Ad zorunlu'),
  body('last_name').notEmpty().withMessage('Soyad zorunlu'),
  body('email').isEmail().withMessage('Geçerli email adresi girin'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('role').optional().isIn(['admin', 'seller', 'customer']).withMessage('Geçersiz rol')
], async (req, res) => {
  try {
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation hatası!',
        errors: errors.array()
      });
    }

    const { first_name, last_name, email, password, role = 'customer' } = req.body;

    // Email zaten var mı kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'Bu email adresi zaten kullanılıyor!',
        error: 'Email already exists'
      });
    }

    // Yeni kullanıcı oluştur
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password, // bcrypt hook'u otomatik şifreleyecek
      role
    });

    // Token oluştur
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu!',
      status: 'success',
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

// Login endpoint
app.post('/api/login', [
  body('email').isEmail().withMessage('Geçerli email adresi girin'),
  body('password').notEmpty().withMessage('Şifre zorunlu')
], async (req, res) => {
  try {
    const User = require('./models/User');
    console.log('🔍 Login isteği geldi:', req.body); // DEBUG
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation hatası:', errors.array()); // DEBUG
      return res.status(400).json({
        message: 'Validation hatası!',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    console.log('👤 Bulunan kullanıcı:', user ? 'VAR' : 'YOK'); // DEBUG
    if (!user) {
      return res.status(401).json({
        message: 'Email veya şifre hatalı!',
        error: 'Invalid credentials'
      });
    }

    // Şifreyi kontrol et
    console.log('🔐 Şifre kontrolü başlıyor...'); // DEBUG
    //const isPasswordValid = true;
    const isPasswordValid = await user.checkPassword(password);
    console.log('🔐 Şifre geçerli mi:', isPasswordValid); // DEBUG
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email veya şifre hatalı!',
        error: 'Invalid credentials'
      });
    }

    // Aktif kullanıcı mı kontrol et
    if (!user.is_active) {
      return res.status(401).json({
        message: 'Hesabınız aktif değil!',
        error: 'Account not active'
      });
    }

    // Last login güncelle
    await user.update({ last_login: new Date() });

    // Token oluştur
    const token = generateToken(user);

    res.json({
      message: 'Giriş başarılı!',
      status: 'success',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      message: 'Giriş yapılamadı!',
      error: error.message
    });
  }
});

// Profile endpoint (korumalı)
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profil bilgileri',
    user: req.user || { id: 49, name: 'Test User', role: 'admin' }
  });
});

// Test korumalı endpoint
app.get('/api/admin-test', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    message: 'Admin paneline hoş geldiniz!',
    user: req.user,
    info: 'Bu endpoint sadece admin kullanıcıları görebilir'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı!' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Hatası:', err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası!'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KolaySatis Backend ${PORT} portunda çalışıyor!`);
  console.log(`📋 API Test: http://localhost:${PORT}/api/test`);
  console.log(`🗄️ DB Test: http://localhost:${PORT}/api/db-test`);
  console.log(`👤 Users Test: http://localhost:${PORT}/api/users-test`);
  console.log(`🆕 Create Users: http://localhost:${PORT}/api/create-test-users`);
  console.log(`🏷️ Create Categories: http://localhost:${PORT}/api/create-test-categories`);
  console.log(`🛍️ Create Products: http://localhost:${PORT}/api/create-test-products`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`📂 Categories: http://localhost:${PORT}/api/categories`);
  console.log(`🛒 Products: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Register: http://localhost:${PORT}/api/register`);
  console.log(`🔑 Login: http://localhost:${PORT}/api/login`);
  console.log(`👤 Profile: http://localhost:${PORT}/api/profile`);
});