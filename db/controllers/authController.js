const db = require('../conexion');
const bcrypt = require('bcryptjs');
const authController = {};

authController.showLogin = (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/home');
    }
    
    
    const error = req.session.error;
    const success = req.session.success;
    
    
    delete req.session.error;
    delete req.session.success;
    
    res.render('login', {
        title: 'Iniciar Sesión',
        error: error || null,
        success: success || null
    });
};
authController.showRegistro = async (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/home');
    }
    
    const error = req.session.error;
    const success = req.session.success;
    
    delete req.session.error;
    delete req.session.success;
    
    try {
        const [organizaciones] = await db.query(`
            SELECT id_organizacion, nombre_organizacion, rut_organizacion 
            FROM organizacion 
            WHERE activo = 1
        `);
        
        res.render('registro', {
            title: 'Registro de Usuario',
            organizaciones: organizaciones,
            error: error || null,
            success: success || null
        });
    } catch (error) {
        console.error(error);
        res.render('registro', {
            title: 'Registro de Usuario',
            organizaciones: [],
            error: 'Error al cargar organizaciones',
            success: null
        });
    }
};
authController.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        if (!correo || !contrasena) {
            req.session.error = 'Debe completar todos los campos.';
            return res.redirect('/auth/login');
        }

        const [usuarios] = await db.query(`
            SELECT 
                u.id_usuario,
                u.id_organizacion,
                u.nombre_completo,
                u.correo,
                u.contrasena,
                u.rol,
                u.activo,
                u.intentos_fallidos,
                u.bloqueado_hasta,
                o.nombre_organizacion
            FROM usuario u
            INNER JOIN organizacion o ON u.id_organizacion = o.id_organizacion
            WHERE u.correo = ? AND u.activo = 1
        `, [correo]);

        if (usuarios.length === 0) {
            req.session.error = 'Correo o contraseña incorrectos.';
            return res.redirect('/auth/login');
        }

        const usuario = usuarios[0];

        if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
            req.session.error = 'Usuario bloqueado temporalmente. Intente más tarde.';
            return res.redirect('/auth/login');
        }

        const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!passwordValida) {
            const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
            if (nuevosIntentos >= 5) {
                await db.query(`
                    UPDATE usuario 
                    SET intentos_fallidos = ?, bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                    WHERE id_usuario = ?
                `, [nuevosIntentos, usuario.id_usuario]);
            } else {
                await db.query(`
                    UPDATE usuario 
                    SET intentos_fallidos = ?
                    WHERE id_usuario = ?
                `, [nuevosIntentos, usuario.id_usuario]);
            }
            req.session.error = 'Correo o contraseña incorrectos.';
            return res.redirect('/auth/login');
        }

        await db.query(`
            UPDATE usuario 
            SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW()
            WHERE id_usuario = ?
        `, [usuario.id_usuario]);

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            id_organizacion: usuario.id_organizacion,
            nombre_completo: usuario.nombre_completo,
            correo: usuario.correo,
            rol: usuario.rol,
            nombre_organizacion: usuario.nombre_organizacion
        };

        req.session.success = `Bienvenido ${usuario.nombre_completo}`;
        res.redirect('/home');

    } catch (error) {
        console.log(error);
        req.session.error = 'Error interno del servidor.';
        res.redirect('/auth/login');
    }
};
authController.registrarUsuario = async (req, res) => {
    const {
        nombre_completo,
        correo,
        contrasena,
        telefono,
        rol,
        id_organizacion
    } = req.body;

    try {
        if (!nombre_completo || !correo || !contrasena || !rol || !id_organizacion) {
            req.session.error = 'Todos los campos obligatorios deben ser completados.';
            return res.redirect('/auth/registro');
        }

        const rolesValidos = ['administrador', 'supervisor', 'tecnico', 'visualizador'];
        if (!rolesValidos.includes(rol)) {
            req.session.error = 'Rol no válido.';
            return res.redirect('/auth/registro');
        }

        const [organizacionExiste] = await db.query(`
            SELECT id_organizacion FROM organizacion WHERE id_organizacion = ? AND activo = 1
        `, [id_organizacion]);

        if (organizacionExiste.length === 0) {
            req.session.error = 'Organización no válida.';
            return res.redirect('/auth/registro');
        }

        const [usuarioExistente] = await db.query(`
            SELECT id_usuario FROM usuario WHERE correo = ?
        `, [correo]);

        if (usuarioExistente.length > 0) {
            req.session.error = 'El correo ya está registrado.';
            return res.redirect('/auth/registro');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(contrasena, salt);

        await db.query(`
            INSERT INTO usuario (
                id_organizacion,
                nombre_completo,
                correo,
                contrasena,
                rol,
                telefono,
                activo
            ) VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [id_organizacion, nombre_completo, correo, passwordHash, rol, telefono || null]);

        req.session.success = 'Usuario registrado correctamente. Ya puedes iniciar sesión.';
        res.redirect('/auth/login');

    } catch (error) {
        console.log(error);
        req.session.error = 'Error interno del servidor.';
        res.redirect('/auth/registro');
    }
};

authController.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};

module.exports = authController;