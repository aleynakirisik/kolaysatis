const { Sequelize } = require('sequelize');

// Docker ortamında PostgreSQL kullan
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'kolaysatis',
  username: process.env.DB_USER || 'kolaysatis_user',
  password: process.env.DB_PASSWORD || 'kolaysatis_pass', 
  host: process.env.DB_HOST || 'database',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
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