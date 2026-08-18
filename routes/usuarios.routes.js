const express = require('express');
const router = express.Router();
const usuariosController = require('../db/controllers/usuariosController');
const ExcelJS = require('exceljs');
const conexion = require('../db/conexion'); // CONEXIÓN MYSQL
// RUTA PARA EL LISTADO DE USUARIOS 
router.get('/', usuariosController.listar);        
// RUTA EXPORTAR A EXCEL
router.get('/exportar-excel', async (req, res) => {
    try {
        const [usuarios] = await conexion.query(`
            SELECT 
                u.id_usuario,
                u.id_organizacion,
                u.nombre_completo,
                u.correo,
                u.rol,
                u.activo,
                u.telefono,
                u.fecha_creacion
            FROM usuario u
            ORDER BY u.id_usuario DESC
        `);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema Gestor de Tareas';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Usuarios', {
            properties: { tabColor: { argb: '1E3A8A' } },
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });
        // TITULO DE ESTE REPORTE GENERADO
        worksheet.mergeCells('A1:G1');
        const titleRow = worksheet.getCell('A1');
        titleRow.value = 'REPORTE GENERAL DE USUARIOS - SISTEMA GESTOR DE TAREAS';
        titleRow.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
        titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;
        // FECHA DE GENERACIÓN DEL REPORTE
        worksheet.mergeCells('A2:G2');
        const dateRow = worksheet.getCell('A2');
        dateRow.value = 'Fecha de generación: ' + new Date().toLocaleString('es-CL');
        dateRow.font = { italic: true, size: 10 };
        dateRow.alignment = { horizontal: 'center' };
        // COLUMNAS DEL EXCEL EXPORTADO
        worksheet.columns = [
            { header: 'ID USUARIO', key: 'id_usuario', width: 12 },
            { header: 'ID ORG', key: 'id_organizacion', width: 10 },
            { header: 'NOMBRE COMPLETO', key: 'nombre_completo', width: 25 },
            { header: 'CORREO REGISTRADO', key: 'correo', width: 30 },
            { header: 'ROL', key: 'rol', width: 15 },
            { header: 'ESTADO', key: 'estado', width: 12 },
            { header: 'FECHA CREACIÓN', key: 'fecha_creacion', width: 20 }
        ];
        const headerRow = worksheet.getRow(4);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25;

        if (usuarios && usuarios.length > 0) {
            usuarios.forEach(u => {
                worksheet.addRow({
                    id_usuario: u.id_usuario,
                    id_organizacion: u.id_organizacion,
                    nombre_completo: u.nombre_completo || 'N/A',
                    correo: u.correo || 'N/A',
                    rol: (u.rol || '').toUpperCase(),
                    estado: (u.activo == 1 || u.activo === true) ? 'Activo' : 'Inactivo',
                    fecha_creacion: u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleString('es-CL') : 'N/A'
                });
            });
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber > 4) {
                    if (rowNumber % 2 === 0) {
                        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
                    }
                    const estadoCell = row.getCell(6);
                    if (estadoCell.value === 'Activo') {
                        estadoCell.font = { color: { argb: '198754' }, bold: true };
                    } else {
                        estadoCell.font = { color: { argb: 'DC3545' }, bold: true };
                    }
                }
            });
        }
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
        res.setHeader('Content-Disposition', 'attachment; filename=usuarios_' + new Date().toISOString().split('T')[0] + '.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al exportar usuarios a Excel:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:id', usuariosController.actualizar);
router.delete('/:id', usuariosController.eliminar); 


module.exports = router;