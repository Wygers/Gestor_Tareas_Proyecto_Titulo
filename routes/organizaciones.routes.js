const express = require('express');
const router = express.Router();
const db = require('../db/conexion');
const ExcelJS = require('exceljs');

// RUTA EXPORTAR A EXCEL (Debe ir antes de las rutas con parámetros como /:id)
router.get('/exportar-excel', async (req, res) => {
    try {
        const [organizaciones] = await db.query(`
            SELECT 
                o.id_organizacion,
                o.nombre_organizacion,
                o.rut_organizacion,
                o.correo_contacto,
                o.telefono,
                o.direccion,
                o.activo,
                o.fecha_registro
            FROM organizacion o
            ORDER BY o.id_organizacion DESC
        `);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema Gestor de Tareas';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Organizaciones', {
            properties: { tabColor: { argb: '1E3A8A' } },
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        // Título del reporte
        worksheet.mergeCells('A1:G1');
        const titleRow = worksheet.getCell('A1');
        titleRow.value = 'REPORTE GENERAL DE ORGANIZACIONES - SISTEMA GESTOR DE TAREAS';
        titleRow.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
        titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;

        // Fecha de generación
        worksheet.mergeCells('A2:G2');
        const dateRow = worksheet.getCell('A2');
        dateRow.value = 'Fecha de generación: ' + new Date().toLocaleString('es-CL');
        dateRow.font = { italic: true, size: 10 };
        dateRow.alignment = { horizontal: 'center' };

        // Columnas
        worksheet.columns = [
            { header: 'ID', key: 'id_organizacion', width: 8 },
            { header: 'NOMBRE ORGANIZACIÓN', key: 'nombre_organizacion', width: 25 },
            { header: 'RUT', key: 'rut_organizacion', width: 15 },
            { header: 'CORREO CONTACTO', key: 'correo_contacto', width: 25 },
            { header: 'TELÉFONO', key: 'telefono', width: 15 },
            { header: 'DIRECCIÓN', key: 'direccion', width: 25 },
            { header: 'ESTADO', key: 'activo', width: 12 }
        ];

        // Estilos de cabecera
        const headerRow = worksheet.getRow(4);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25;

        if (organizaciones && organizaciones.length > 0) {
            organizaciones.forEach(org => {
                worksheet.addRow({
                    id_organizacion: org.id_organizacion,
                    nombre_organizacion: org.nombre_organizacion || 'N/A',
                    rut_organizacion: org.rut_organizacion || 'N/A',
                    correo_contacto: org.correo_contacto || 'N/A',
                    telefono: org.telefono || 'N/A',
                    direccion: org.direccion || 'N/A',
                    activo: (org.activo == 1 || org.activo === true) ? 'Activo' : 'Inactivo'
                });
            });

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber > 4) {
                    if (rowNumber % 2 === 0) {
                        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
                    }
                    const estadoCell = row.getCell(7);
                    if (estadoCell.value === 'Activo') {
                        estadoCell.font = { color: { argb: '198754' }, bold: true };
                    } else {
                        estadoCell.font = { color: { argb: 'DC3545' }, bold: true };
                    }
                }
            });
        }

        // Bordes de celda
        for (let i = 4; i <= worksheet.rowCount; i++) {
            worksheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'CCCCCC' } },
                    left: { style: 'thin', color: { argb: 'CCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
                    right: { style: 'thin', color: { argb: 'CCCCCC' } }
                };
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=organizaciones_' + new Date().toISOString().split('T')[0] + '.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error al exportar organizaciones a Excel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ruta Listar
router.get('/', async (req, res) => {
    try {
        const [organizaciones] = await db.query('SELECT * FROM organizacion ORDER BY id_organizacion DESC');
        
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

// Ruta Crear
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

        return res.status(201).json({ success: true, id_organizacion: result.insertId, message: 'Organización creada exitosamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Error al guardar la organización' });
    }
});

// Ruta Actualizar (PUT)
router.put('/:id', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }

    const { id } = req.params;
    const { nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activo } = req.body;
    const activoVal = activo ? 1 : 0;

    try {
        await db.query(
            `UPDATE organizacion SET nombre_organizacion = ?, rut_organizacion = ?, correo_contacto = ?, telefono = ?, direccion = ?, activo = ?, fecha_modificacion = NOW() WHERE id_organizacion = ?`,
            [nombre_organizacion, rut_organizacion, correo_contacto, telefono, direccion, activoVal, id]
        );

        return res.json({ success: true, message: 'Organización actualizada exitosamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Error al actualizar la organización' });
    }
});
// Ruta Eliminar (DELETE)
router.delete('/:id', async (req, res) => {
    if (!req.session.usuario || req.session.usuario.rol !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    try {
        await db.query('DELETE FROM organizacion WHERE id_organizacion = ?', [req.params.id]);
        return res.json({ success: true, message: 'Organización eliminada exitosamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Error al eliminar en la base de datos' });
    }
});

module.exports = router;