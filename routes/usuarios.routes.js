const express = require('express');
const router = express.Router();
const usuariosController = require('../db/controllers/usuariosController');

router.get('/', usuariosController.listar);
router.post('/actualizar/:id', usuariosController.actualizar);
router.get('/eliminar/:id', usuariosController.eliminar);

module.exports = router;