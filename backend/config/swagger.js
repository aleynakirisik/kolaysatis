const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KolaySatis API',
      version: '1.0.0',
      description: 'KolaySatis E-Ticaret Platformu REST API Dokümantasyonu',
      contact: {
        name: 'KolaySatis Geliştirici Ekibi',
        email: 'dev@kolaysatis.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.kolaysatis.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in httpOnly cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'Kullanıcı benzersiz ID\'si',
              example: 1
            },
            first_name: {
              type: 'string',
              description: 'Kullanıcının adı',
              example: 'Ahmet'
            },
            last_name: {
              type: 'string',
              description: 'Kullanıcının soyadı',
              example: 'Yılmaz'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Kullanıcının e-posta adresi',
              example: 'ahmet@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'seller', 'customer'],
              description: 'Kullanıcı rolü',
              example: 'customer'
            },
            is_active: {
              type: 'boolean',
              description: 'Kullanıcının aktif durumu',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Hesap oluşturulma tarihi'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Son güncelleme tarihi'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price', 'sku', 'category_id', 'seller_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'Ürün benzersiz ID\'si',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Ürün adı',
              example: 'iPhone 15 Pro'
            },
            description: {
              type: 'string',
              description: 'Ürün açıklaması',
              example: 'Apple iPhone 15 Pro 128GB Titanyum'
            },
            short_description: {
              type: 'string',
              description: 'Kısa ürün açıklaması',
              example: 'En yeni iPhone modeli'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Ürün fiyatı (TL)',
              example: 45000.00
            },
            sale_price: {
              type: 'number',
              format: 'decimal',
              description: 'İndirimli fiyat (TL)',
              example: 42000.00,
              nullable: true
            },
            sku: {
              type: 'string',
              description: 'Stok kodu (benzersiz)',
              example: 'IPHONE15PRO128'
            },
            stock_quantity: {
              type: 'integer',
              description: 'Stok miktarı',
              example: 10,
              minimum: 0
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'out_of_stock', 'discontinued'],
              description: 'Ürün durumu',
              example: 'published'
            },
            category_id: {
              type: 'integer',
              description: 'Kategori ID\'si',
              example: 1
            },
            seller_id: {
              type: 'integer',
              description: 'Satıcı ID\'si',
              example: 2
            }
          }
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'integer',
              description: 'Kategori benzersiz ID\'si',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Kategori adı',
              example: 'Elektronik'
            },
            description: {
              type: 'string',
              description: 'Kategori açıklaması',
              example: 'Elektronik ürünler kategorisi'
            },
            slug: {
              type: 'string',
              description: 'URL dostu kategori adı',
              example: 'elektronik'
            },
            is_active: {
              type: 'boolean',
              description: 'Kategori aktif durumu',
              example: true
            },
            sort_order: {
              type: 'integer',
              description: 'Sıralama önceliği',
              example: 1
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Kullanıcı e-posta adresi',
              example: 'admin@kolaysatis.com'
            },
            password: {
              type: 'string',
              description: 'Kullanıcı şifresi',
              example: '123456'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Giriş başarılı!'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            expiresIn: {
              type: 'string',
              description: 'Token süre bilgisi',
              example: '24h'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password'],
          properties: {
            first_name: {
              type: 'string',
              description: 'Ad',
              example: 'Ahmet'
            },
            last_name: {
              type: 'string',
              description: 'Soyad',
              example: 'Yılmaz'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-posta adresi',
              example: 'ahmet@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Şifre (en az 6 karakter)',
              example: '123456'
            },
            role: {
              type: 'string',
              enum: ['seller', 'customer'],
              default: 'customer',
              description: 'Kullanıcı rolü',
              example: 'customer'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Hata mesajı',
              example: 'Bir hata oluştu'
            },
            error: {
              type: 'string',
              description: 'Hata kodu',
              example: 'VALIDATION_ERROR'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  param: {
                    type: 'string',
                    example: 'email'
                  },
                  msg: {
                    type: 'string',
                    example: 'Geçerli email adresi girin'
                  }
                }
              },
              description: 'Validation hataları listesi'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Başarı mesajı',
              example: 'İşlem başarılı'
            },
            status: {
              type: 'string',
              example: 'success'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./app.js', './routes/*.js'], // API dokümantasyonu için dosya yolları
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #007bff; }
    .swagger-ui .scheme-container { background: #f8f9fa; }
  `,
  customSiteTitle: "KolaySatis API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    filter: true,
    displayRequestDuration: true
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};