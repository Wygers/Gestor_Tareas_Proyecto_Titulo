const express = require('express');
const router = express.Router();
const tareasController = require('../db/controllers/tareasController');


// Rutas RESTful para tareas
router.get('/', tareasController.listar);           
router.get('/crear', tareasController.mostrarCrear); 
router.post('/', tareasController.uploadMiddleware, tareasController.guardar); 

module.exports = router;