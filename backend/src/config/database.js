const { Sequelize } = require('sequelize');

// Database bağlantısı
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'kolaysatis',
  username: process.env.DB_USER || 'kolaysatis_user', 
  password: process.env.DB_PASSWORD || 'kolaysatis_pass',
  host: process.env.DB_HOST || 'database', // Docker container adı
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false, // SQL loglarını kapatıyoruz
  define: {
    timestamps: true, // createdAt ve updatedAt otomatik
    underscored: true, // snake_case
  },
  retry: {
    match: [
      /ConnectionError/,
      /ConnectionRefusedError/,
      /AccessDeniedError/,
      /HostNotFoundError/,
      /HostNotReachableError/,
      /InvalidConnectionError/,
      /ConnectionTimedOutError/
    ],
    max: 5
  }
});

module.exports = sequelize;