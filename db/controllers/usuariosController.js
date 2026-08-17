const db = require('../conexion');
const usuariosController = {};


usuariosController.listar = async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT id_usuario, id_organizacion, nombre_completo, correo, rol, activo 
            FROM usuario 
            ORDER BY id_usuario DESC
        `);

        
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({
                success: true,
                usuarios
            });
        }

        return res.render('ListaUsuarios', {
            title: 'Listado de Usuarios - Gestor de Tareas',
            usuarios,
            error_msg: null,
            usuario: req.session.usuario || null
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);
        
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error al cargar los usuarios desde la base de datos.' });
        }

        return res.status(500).render('ListaUsuarios', {
            title: 'Listado de Usuarios',
            usuarios: [],
            error_msg: 'Error al cargar los usuarios desde la base de datos.',
            usuario: req.session.usuario || null
        });
    }
};


usuariosController.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, correo, rol, id_organizacion } = req.body;

        await db.query(`
            UPDATE usuario 
            SET nombre_completo = ?, correo = ?, rol = ?, id_organizacion = ?
            WHERE id_usuario = ?
        `, [nombre_completo, correo, rol, id_organizacion, id]);

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({
                success: true,
                message: 'Usuario actualizado exitosamente'
            });
        }

        return res.redirect('/usuarios');

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error interno al actualizar el usuario.' });
        }

        return res.status(500).send('Error interno al actualizar el usuario.');
    }
};


usuariosController.eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        }

        return res.redirect('/usuarios');

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error interno al eliminar el usuario.' });
        }

        return res.status(500).send('Error interno al eliminar el usuario.');
    }
};

module.exports = usuariosController;