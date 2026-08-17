const express = require('express');
const router = express.Router();
const usuariosController = require('../db/controllers/usuariosController');


router.get('/', usuariosController.listar);         // GET /usuarios (Listar)
router.put('/:id', usuariosController.actualizar);  // PUT /usuarios/:id (Actualizar por recurso)
router.delete('/:id', usuariosController.eliminar); // DELETE /usuarios/:id (Eliminar por recurso)

module.exports = router;