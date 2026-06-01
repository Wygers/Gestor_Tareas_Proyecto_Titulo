const db = require('../conexion');
const bcrypt = require('bcryptjs');

const authController = {};

authController.showLogin = (req, res) => {
    if (req.session.usuario) return res.redirect('/home');
    
    const error = req.session.error;
    const success = req.session.success;
    delete req.session.error;
    delete req.session.success;
    
    res.render('login', { title: 'Iniciar Sesión', error, success });
};

authController.showRegistro = (req, res) => {
    if (req.session.usuario) return res.redirect('/home');
    
    const error = req.session.error;
    delete req.session.error;
    
    res.render('registro', { title: 'Registro de Usuario', error });
};

authController.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        if (!correo || !contrasena) {
            req.session.error = 'Debe completar todos los campos.';
            return res.redirect('/auth/login');
        }

        const [usuarios] = await db.query(`
            SELECT u.*, o.nombre_organizacion 
            FROM usuario u
            INNER JOIN organizacion o ON u.id_organizacion = o.id_organizacion
            WHERE u.correo = ? AND u.activo = 1
        `, [correo]);

        if (usuarios.length === 0) {
            req.session.error = 'Credenciales inválidas.';
            return res.redirect('/auth/login');
        }

        const usuario = usuarios[0];

        // Verificar bloqueo
        if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
            req.session.error = 'Usuario bloqueado. Intente más tarde.';
            return res.redirect('/auth/login');
        }

        const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!passwordValida) {
            const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
            await db.query('UPDATE usuario SET intentos_fallidos = ? WHERE id_usuario = ?', 
                [nuevosIntentos, usuario.id_usuario]);
            
            req.session.error = 'Credenciales inválidas.';
            return res.redirect('/auth/login');
        }

        // Login exitoso
        await db.query('UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?', [usuario.id_usuario]);

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            id_organizacion: usuario.id_organizacion,
            nombre_completo: usuario.nombre_completo,
            correo: usuario.correo,
            rol: usuario.rol,
            nombre_organizacion: usuario.nombre_organizacion
        };

        res.redirect('/home');
    } catch (error) {
        console.error(error);
        req.session.error = 'Error interno del servidor.';
        res.redirect('/auth/login');
    }
};

authController.registrarUsuario = async (req, res) => {
    const { nombre_organizacion, rut_organizacion, nombre_completo, correo, contrasena, telefono } = req.body;

    // Validación básica
    if (!nombre_organizacion || !rut_organizacion || !nombre_completo || !correo || !contrasena) {
        req.session.error = 'Todos los campos son obligatorios.';
        return res.redirect('/auth/registro');
    }

    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        // 1. Crear Organización
        const [orgResult] = await connection.query(
            'INSERT INTO organizacion (nombre_organizacion, rut_organizacion, activo) VALUES (?, ?, 1)',
            [nombre_organizacion, rut_organizacion]
        );
        const id_organizacion = orgResult.insertId;

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(contrasena, salt);

        // 3. Crear Usuario Administrador vinculado
        await connection.query(`
            INSERT INTO usuario (id_organizacion, nombre_completo, correo, contrasena, rol, telefono, activo) 
            VALUES (?, ?, ?, ?, 'administrador', ?, 1)`,
            [id_organizacion, nombre_completo, correo, passwordHash, telefono || null]
        );

        await connection.commit();
        req.session.success = 'Empresa y administrador registrados exitosamente.';
        res.redirect('/auth/login');

    } catch (error) {
        await connection.rollback();
        console.error(error);
        req.session.error = 'Error al registrar. Asegúrese de que el correo no esté duplicado.';
        res.redirect('/auth/registro');
    } finally {
        connection.release();
    }
};

authController.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/auth/login'));
};

module.exports = authController;