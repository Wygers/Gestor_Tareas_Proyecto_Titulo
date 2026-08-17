const express = require('express');
const router = express.Router();
const db = require('../db/conexion');


router.get('/', async (req, res) => {
    try {
        const [organizaciones] = await db.query('SELECT * FROM organizacion');
        
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, organizaciones });
        }

        res.render('ListaOrganizaciones', {
            title: 'Gestión de Organizaciones',
            organizaciones,
            usuario: req.session.usuario || null 
        });
    } catch (err) {
        console.error(err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error al cargar organizaciones' });
        }
        res.status(500).send('Error al cargar organizaciones');
    }
});

router.post('/', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(403).json({ success: false, error: 'Acceso denegado' });
        }
        return res.status(403).send('Acceso denegado');
    }

    const { nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activo } = req.body;
    const activoVal = activo ? 1 : 0;

    try {
        const [result] = await db.query(
            `INSERT INTO organizacion (nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activo, fecha_registro, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activoVal]
        );

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(201).json({ success: true, id_organizacion: result.insertId, message: 'Organización creada exitosamente' });
        }

        res.redirect('/organizaciones');
    } catch (err) {
        console.error(err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error al guardar la organización' });
        }
        res.status(500).send('Error al guardar la organización');
    }
});
router.put('/:id', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(403).json({ success: false, error: 'Acceso denegado' });
        }
        return res.status(403).send('Acceso denegado');
    }

    const { id } = req.params;
    const { nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activo } = req.body;
    const activoVal = activo ? 1 : 0;

    try {
        await db.query(
            `UPDATE organizacion SET nombre_organizacion = ?, rut_organizacion = ?, correo_contacto = ?, telefono = ?, direccion = ?, activo = ?, fecha_modificacion = NOW() WHERE id_organizacion = ?`,
            [nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activoVal, id]
        );

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Organización actualizada exitosamente' });
        }

        res.redirect('/organizaciones');
    } catch (err) {
        console.error(err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, error: 'Error al actualizar la organización' });
        }
        res.status(500).send('Error al actualizar la organización');
    }
});
router.delete('/:id', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    try {
        await db.query('DELETE FROM organizacion WHERE id_organizacion = ?', [req.params.id]);
        res.json({ success: true, message: 'Organización eliminada exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error al eliminar en la base de datos' });
    }
});

module.exports = router;