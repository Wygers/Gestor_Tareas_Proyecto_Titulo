const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_gestor_tareas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conectado a MySQL (sistema_gestor_tareas)');
        connection.release();
    } catch (error) {
        console.error('Error de conexión a MySQL:', error);
    }
})();

module.exports = db;