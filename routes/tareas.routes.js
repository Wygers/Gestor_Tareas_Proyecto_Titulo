const express = require('express');
const router = express.Router();
const tareasController = require('../db/controllers/tareasController');

// RUTAS EN APIRESTFULL PARA MAS ORDEN
router.get('/crear', tareasController.mostrarCrear);
router.post('/', tareasController.guardar);          
router.get('/', tareasController.listar);            

module.exports = router;