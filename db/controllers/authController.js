const db = require('../conexion');
const bcrypt = require('bcryptjs');

const authController = {};

authController.mostrarLogin = (req, res) => {
    res.render('Login', {
        title: 'Iniciar Sesión',
        error: null
    });
};

authController.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const [usuarios] = await db.query(
            `SELECT * FROM usuarios 
             WHERE correo = ? AND activo = 1`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.render('Login', {
                title: 'Iniciar Sesión',
                error: 'Correo o contraseña incorrectos.'
            });
        }

        const usuario = usuarios[0];
        const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!passwordValida) {
            return res.render('Login', {
                title: 'Iniciar Sesión',
                error: 'Correo o contraseña incorrectos.'
            });
        }

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            id_organizacion: usuario.id_organizacion,
            nombre_completo: usuario.nombre_completo,
            correo: usuario.correo,
            tipo_usuario: usuario.tipo_usuario
        };

        res.redirect('/');

    } catch (error) {
        console.error('Error en login:', error);
        res.render('Login', {
            title: 'Iniciar Sesión',
            error: 'Ocurrió un error al iniciar sesión.'
        });
    }
};

authController.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};

module.exports = authController;