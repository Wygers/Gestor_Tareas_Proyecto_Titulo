const express = require('express');
const router = express.Router();
const db = require('../db/conexion');


router.get('/', async (req, res) => {
    try {
        const [organizaciones] = await db.query('SELECT * FROM organizacion');
        res.render('ListaOrganizaciones', {
            title: 'Gestión de Organizaciones',
            organizaciones,
            usuario: req.session.usuario || null 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar organizaciones');
    }
});
router.post('/guardar', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        return res.status(403).send('Acceso denegado');
    }
    const { id_organizacion, nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activo } = req.body;
    const activoVal = activo ? 1 : 0;

    try {
        if (id_organizacion) {
            await db.query(
                `UPDATE organizacion SET nombre_organizacion = ?, rut_organizacion = ?, correo_contacto = ?, telefono = ?, direccion = ?, activo = ?, fecha_modificacion = NOW() WHERE id_organizacion = ?`,
                [nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activoVal, id_organizacion]
            );
        } else {
            await db.query(
                `INSERT INTO organizacion (nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activo, fecha_registro, fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activoVal]
            );
        }
        res.redirect('/organizaciones');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar la organización');
    }
});
router.delete('/api/:id', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        return res.status(403).json({ error: 'No autorizado' });
    }

    try {
        await db.query('DELETE FROM organizacion WHERE id_organizacion = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar en la base de datos' });
    }
});

module.exports = router;