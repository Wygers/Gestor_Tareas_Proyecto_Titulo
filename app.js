const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const db = require('./db/conexion');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.usuario = null;
    next();
});
app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS fecha');

        res.render('home', {
            title: 'Gestor de Tareas Profesional',
            fechaServidor: rows[0].fecha
        });
    } catch (error) {
        console.error('Error consultando MySQL:', error.message);
        res.status(500).send('Error de conexión a base de datos');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});