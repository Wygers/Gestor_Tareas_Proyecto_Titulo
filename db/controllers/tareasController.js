const db = require('../conexion');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const tareasController = {};

tareasController.uploadMiddleware = upload.single('archivo_evidencia');

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

        // Consultamos las dependencias activas para mostrar relaciones si se requiere
        const [dependencias] = await db.query(`
            SELECT d.*, t_pred.titulo AS titulo_predecesora, t_suc.titulo AS titulo_sucesora 
            FROM tarea_dependencia d
            INNER JOIN tarea t_pred ON d.id_tarea_predecesora = t_pred.id_tarea
            INNER JOIN tarea t_suc ON d.id_tarea_sucesora = t_suc.id_tarea
            WHERE d.activo = 1
        `);

        const [categorias] = await db.query('SELECT * FROM categoria_tarea WHERE activo = 1');
        const [prioridades] = await db.query('SELECT * FROM prioridad_tarea WHERE activo = 1');
        const [estados] = await db.query('SELECT * FROM estado_tarea WHERE activo = 1');
        const [organizaciones] = await db.query('SELECT * FROM organizacion WHERE activo = 1');
        const [usuarios] = await db.query('SELECT id_usuario, id_organizacion, nombre_completo, rol FROM usuario WHERE activo = 1');

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({
                success: true,
                tareas, categorias, prioridades, estados, organizaciones, usuarios, dependencias
            });
        }
        return res.render('ListaTareas', {
            title: 'Listado y Gestión de Tareas Operativas',
            tareas, categorias, prioridades, estados, organizaciones, usuarios, dependencias,
            error_msg: null,
            usuario: req.session.usuario || null
        });

    } catch (error) {
        console.error('Error al listar tareas:', error);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error al listar las tareas desde la base de datos.' });
        }
        return res.status(500).render('ListaTareas', {
            title: 'Listado de Tareas',
            tareas: [], categorias: [], prioridades: [], estados: [], organizaciones: [], usuarios: [], dependencias: [],
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
        
        // Obtenemos listado de tareas para seleccionarlas como predecesoras
        const [todasTareas] = await db.query('SELECT id_tarea, codigo_tarea, titulo FROM tarea WHERE activo = 1 ORDER BY id_tarea DESC');

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, categorias, prioridades, estados, organizaciones, usuarios, todasTareas });
        }

        return res.render('Tarea', {
            title: 'Registrar Nueva Tarea',
            categorias, prioridades, estados, organizaciones, usuarios, todasTareas,
            error_msg: null,
            usuario: req.session.usuario || null
        });
    } catch (error) {
        console.error('Error al cargar formularios:', error);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error al cargar formularios' });
        }
        return res.redirect('/tareas');
    }
};

tareasController.guardar = async (req, res) => {
    try {
        const {
            id_organizacion, id_categoria, id_prioridad, id_estado,
            id_usuario_asignado, titulo, descripcion, ubicacion_referencial,
            fecha_inicio, fecha_limite, porcentaje_avance, observaciones,
            descripcion_evidencia, id_tarea_predecesora
        } = req.body;

        const archivo = req.file;

        if (!id_organizacion || !id_categoria || !id_prioridad || !id_estado || !id_usuario_asignado || !titulo || !fecha_inicio || !fecha_limite) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(400).json({ success: false, error: 'Faltan campos obligatorios para registrar la tarea.' });
            }
            return res.status(400).send('Faltan campos obligatorios para registrar la tarea.');
        }

        // VALIDACIÓN DE CONDICIONALIDAD: Verificar si la tarea predecesora está finalizada
        if (id_tarea_predecesora) {
            const [predRows] = await db.query(`
                SELECT t.id_tarea, e.es_final 
                FROM tarea t
                INNER JOIN estado_tarea e ON t.id_estado = e.id_estado
                WHERE t.id_tarea = ?
            `, [id_tarea_predecesora]);

            if (predRows.length > 0) {
                const tareaPred = predRows[0];
                if (!tareaPred.es_final) {
                    const mensajeError = 'No se puede registrar la tarea porque depende de una tarea predecesora que aún no se encuentra en un estado finalizado.';
                    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                        return res.status(400).json({ success: false, error: mensajeError });
                    }
                    return res.status(400).send(mensajeError);
                }
            }
        }

        let id_usuario_creador = req.session.usuario ? req.session.usuario.id_usuario : null;
        
        if (!id_usuario_creador) {
            const [adminUser] = await db.query("SELECT id_usuario FROM usuario WHERE rol = 'administrador' LIMIT 1");
            id_usuario_creador = adminUser.length > 0 ? adminUser[0].id_usuario : 1;
        }

        // 1. Insertar la tarea principal
        const [resultado] = await db.query(`
            INSERT INTO tarea (
                codigo_tarea, id_organizacion, id_categoria, id_prioridad, id_estado, 
                id_usuario_creador, id_usuario_asignado, titulo, descripcion, 
                ubicacion_referencial, fecha_inicio, fecha_limite, porcentaje_avance, 
                observaciones, id_usuario_modificador
            ) VALUES ('', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_organizacion, id_categoria, id_prioridad, id_estado,
            id_usuario_creador, id_usuario_asignado, titulo, descripcion,
            ubicacion_referencial, fecha_inicio, fecha_limite,
            porcentaje_avance || 0.00, observaciones || 'Sin observaciones',
            id_usuario_creador
        ]);

        const id_nueva_tarea = resultado.insertId;

        // 2. Registrar la dependencia en la tabla 'tarea_dependencia' si se indicó una predecesora
        if (id_tarea_predecesora) {
            await db.query(`
                INSERT INTO tarea_dependencia (id_tarea_predecesora, id_tarea_sucesora, activo)
                VALUES (?, ?, 1)
            `, [id_tarea_predecesora, id_nueva_tarea]);
        }

        // 3. Registrar el archivo de evidencia si existe
        if (archivo) {
            await db.query(`
                INSERT INTO evidencia_tarea (
                    id_tarea, id_usuario_subida, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, descripcion
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                id_nueva_tarea,
                id_usuario_creador,
                archivo.originalname,
                'Procesado en Memoria (Sin ruta de disco)',
                archivo.mimetype,
                archivo.size,
                descripcion_evidencia || 'Evidencia inicial adjunta'
            ]);
        }

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(201).json({
                success: true,
                message: 'Tarea, dependencias y evidencia creadas exitosamente',
                id_tarea: id_nueva_tarea
            });
        }

        return res.redirect('/tareas');

    } catch (error) {
        console.error('Error al guardar tarea y evidencia:', error);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error interno al guardar la tarea.' });
        }
        return res.status(500).send('Error interno al guardar la tarea.');
    }
};

module.exports = tareasController;