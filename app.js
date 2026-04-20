const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos (IMPORTANTE para CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Evitar error usuario undefined
app.use((req, res, next) => {
    res.locals.usuario = null;
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Gestor de Tareas Profesional'
    });
});

// Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});