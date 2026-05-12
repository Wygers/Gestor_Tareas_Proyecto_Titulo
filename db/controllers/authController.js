const db = require('../conexion');
const bcrypt = require('bcryptjs');

const authController = {};

/* =========================
   MOSTRAR LOGIN
========================= */

authController.mostrarLogin = (req, res) => {

    res.render('Login', {
        title: 'Iniciar Sesión',
        error: null
    });

};

/* =========================
   MOSTRAR REGISTRO
========================= */

authController.mostrarRegistro = (req, res) => {

    res.render('Registro', {
        title: 'Registro de Usuario',
        error: null
    });

};

/* =========================
   LOGIN
========================= */

authController.login = async (req, res) => {

    const { correo, contraseña } = req.body;

    try {

        if (!correo || !contraseña) {

            return res.render('Login', {
                title: 'Iniciar Sesión',
                error: 'Debe completar todos los campos.'
            });

        }

        const [usuarios] = await db.query(
            `
            SELECT *
            FROM usuarios
            WHERE correo = ?
            AND activo = 1
            `,
            [correo]
        );

        if (usuarios.length === 0) {

            return res.render('Login', {
                title: 'Iniciar Sesión',
                error: 'Correo o contraseña incorrectos.'
            });

        }

        const usuario = usuarios[0];

        const passwordValida = await bcrypt.compare(
            contraseña,
            usuario.contraseña
        );

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

/* =========================
   REGISTRO USUARIO
========================= */

authController.registrarUsuario = async (req, res) => {

    const {
        nombre_completo,
        correo,
        contraseña,
        tipo_usuario
    } = req.body;

    try {

        if (
            !nombre_completo ||
            !correo ||
            !contraseña ||
            !tipo_usuario
        ) {

            return res.render('Registro', {
                title: 'Registro de Usuario',
                error: 'Todos los campos son obligatorios.'
            });

        }

        /* =========================
           VALIDAR CORREO
        ========================= */

        const [usuarioExistente] = await db.query(
            `
            SELECT id_usuario
            FROM usuarios
            WHERE correo = ?
            `,
            [correo]
        );

        if (usuarioExistente.length > 0) {

            return res.render('Registro', {
                title: 'Registro de Usuario',
                error: 'El correo ya está registrado.'
            });

        }

        /* =========================
           ENCRIPTAR CONTRASEÑA
        ========================= */

        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(
            contraseña,
            salt
        );

        /* =========================
           INSERTAR USUARIO
        ========================= */

        await db.query(
            `
            INSERT INTO usuarios
            (
                id_organizacion,
                nombre_completo,
                correo,
                contraseña,
                tipo_usuario,
                activo
            )
            VALUES (?, ?, ?, ?, ?, 1)
            `,
            [
                1,
                nombre_completo,
                correo,
                passwordHash,
                tipo_usuario
            ]
        );

        res.redirect('/auth/login');

    } catch (error) {

        console.error('Error al registrar usuario:', error);

        res.render('Registro', {
            title: 'Registro de Usuario',
            error: 'Error interno del servidor.'
        });

    }

};

/* =========================
   LOGOUT
========================= */

authController.logout = (req, res) => {

    req.session.destroy(() => {

        res.redirect('/auth/login');

    });

};

module.exports = authController;