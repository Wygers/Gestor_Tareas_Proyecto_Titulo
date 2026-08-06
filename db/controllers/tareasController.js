const db = require('../conexion');
const tareasController = {};



tareasController.listar = async (req, res) => {
    try {
        const [tareas] = await db.query(`
            SELECT 
                tareas.*,
                cat.nombre_categoria,
                prio.nombre_prioridad,
                prio.color_css AS color_prioridad,
                est.nombre_estado,
                est.color_css AS color_estado,
                u_creador.nombre_completo AS creador,
                u_asignado.nombre_completo AS responsable
            FROM tarea tareas
            LEFT JOIN categoria_tarea cat ON tareas.id_categoria = cat.id_categoria
            INNER JOIN prioridad_tarea prio ON tareas.id_prioridad = prio.id_prioridad
            INNER JOIN estado_tarea est ON tareas.id_estado = est.id_estado
            INNER JOIN usuario u_creador ON tareas.id_usuario_creador = u_creador.id_usuario
            INNER JOIN usuario u_asignado ON tareas.id_usuario_asignado = u_asignado.id_usuario
            ORDER BY tareas.id_tarea DESC
        `);

        const [categorias] = await db.query('SELECT * FROM categoria_tarea WHERE activo = 1');
        const [prioridades] = await db.query('SELECT * FROM prioridad_tarea WHERE activo = 1');
        const [estados] = await db.query('SELECT * FROM estado_tarea WHERE activo = 1');
        const [organizaciones] = await db.query('SELECT * FROM organizacion WHERE activo = 1');
        const [usuarios] = await db.query('SELECT id_usuario, id_organizacion, nombre_completo, rol FROM usuario WHERE activo = 1');

        return res.render('ListaTareas', {
            title: 'Listado y Gestión de Tareas Operativas',
            tareas,
            categorias,
            prioridades,
            estados,
            organizaciones,
            usuarios,
            error_msg: null,
            usuario: req.session.usuario || null
        });

    } catch (error) {
        console.error('Error al listar tareas:', error);
        return res.status(500).render('ListaTareas', {
            title: 'Listado de Tareas',
            tareas: [],
            categorias: [],
            prioridades: [],
            estados: [],
            organizaciones: [],
            usuarios: [],
            error_msg: 'Error al listar las tareas desde la base de datos.',
            usuario: req.session.usuario || null
        });
    }
};


tareasController.mostrarCrear = async (req, res) => {
    try {
        const [categorias] = await db.query('SELECT * FROM categoria_tarea WHERE activo = 1');
        const [prioridades] = await db.query('SELECT * FROM prioridad_tarea WHERE activo = 1');
        const [estados] = await db.query('SELECT * FROM estado_tarea WHERE activo = 1');
        const [organizaciones] = await db.query('SELECT * FROM organizacion WHERE activo = 1');
        const [usuarios] = await db.query('SELECT id_usuario, id_organizacion, nombre_completo, rol FROM usuario WHERE activo = 1');

        return res.render('Tarea', {
            title: 'Registrar Nueva Tarea',
            categorias,
            prioridades,
            estados,
            organizaciones,
            usuarios,
            error_msg: null,
            usuario: req.session.usuario || null
        });
    } catch (error) {
        console.error('Error al cargar formularios:', error);
        return res.redirect('/ListaTareas');
    }
};


tareasController.guardar = async (req, res) => {
    try {
        const {
            id_organizacion,
            id_categoria,
            id_prioridad,
            id_estado,
            id_usuario_asignado,
            titulo,
            descripcion,
            ubicacion_referencial,
            fecha_inicio,
            fecha_limite,
            porcentaje_avance,
            observaciones
        } = req.body;

        if (!id_organizacion || !id_categoria || !id_prioridad || !id_estado || !id_usuario_asignado || !titulo || !fecha_inicio || !fecha_limite) {
            return res.status(400).send('Faltan campos obligatorios para registrar la tarea.');
        }

        let id_usuario_creador = req.session.usuario ? req.session.usuario.id_usuario : null;
        
        if (!id_usuario_creador) {
            const [adminUser] = await db.query("SELECT id_usuario FROM usuario WHERE rol = 'administrador' LIMIT 1");
            id_usuario_creador = adminUser.length > 0 ? adminUser[0].id_usuario : 1;
        }

        await db.query(`
            INSERT INTO tarea (
                codigo_tarea, id_organizacion, id_categoria, id_prioridad, id_estado, 
                id_usuario_creador, id_usuario_asignado, titulo, descripcion, 
                ubicacion_referencial, fecha_inicio, fecha_limite, porcentaje_avance, 
                observaciones, id_usuario_modificador
            ) VALUES ('', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_organizacion,
            id_categoria,
            id_prioridad,
            id_estado,
            id_usuario_creador,
            id_usuario_asignado,
            titulo,
            descripcion,
            ubicacion_referencial,
            fecha_inicio,
            fecha_limite,
            porcentaje_avance || 0.00,
            observaciones || 'Sin observaciones',
            id_usuario_creador
        ]);

        return res.redirect('/ListaTareas');

    } catch (error) {
        console.error('Error al guardar tarea:', error);
        return res.status(500).send('Error interno al guardar la tarea.');
    }
};

module.exports = tareasController;