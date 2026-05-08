const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Conectado a la base de datos PostgreSQL exitosamente'))
    .catch(error => console.error('Error crítico al conectar a PostgreSQL:', error.message));

module.exports = { pool };