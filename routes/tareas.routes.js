const express = require('express');
const router = express.Router();
const tareasController = require('../db/controllers/tareasController');


router.get('/', tareasController.listar);
router.get('/crear', tareasController.mostrarCrear);
router.post('/guardar', tareasController.guardar);

module.exports = router;