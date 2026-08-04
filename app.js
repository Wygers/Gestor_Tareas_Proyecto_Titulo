const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./db/conexion');
const authRoutes = require('./routes/auth.routes');
const tareasRoutes = require('./routes/tareas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const organizacionesRoutes = require('./routes/organizaciones.routes');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'gestor_tareas_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

app.use('/auth', authRoutes);
app.use('/tareas', tareasRoutes);
app.use('/usuarios', usuariosRoutes); 
app.use('/ListaOrganizaciones', organizacionesRoutes);

app.get(['/', '/home'], (req, res) => {
    res.render('home', {
        title: 'Gestor de Tareas Profesional',
        usuario: req.session.usuario || null
    });
});

app.use((req, res) => {
    res.status(404).send('<h1>404 - Ruta no encontrada</h1><a href="/">Volver al inicio</a>');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});