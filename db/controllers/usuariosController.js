const db = require('../conexion');
const usuariosController = {};

usuariosController.listar = async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT id_usuario, id_organizacion, nombre_completo, correo, rol, activo 
            FROM usuario 
            ORDER BY id_usuario DESC
        `);

        return res.render('ListaUsuarios', {
            title: 'Listado de Usuarios - Gestor de Tareas',
            usuarios,
            error_msg: null,
            usuario: req.session.usuario || null
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);
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

        return res.redirect('/usuarios');

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).send('Error interno al actualizar el usuario.');
    }
};
usuariosController.eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

        return res.redirect('/usuarios');

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).send('Error interno al eliminar el usuario.');
    }
};

module.exports = usuariosController;