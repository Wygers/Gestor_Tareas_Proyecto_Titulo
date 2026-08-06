const express = require('express');
const router = express.Router();
const tareasController = require('../db/controllers/tareasController');


router.get('/crear', tareasController.mostrarCrear);
router.post('/guardar', tareasController.guardar);
router.get('/', tareasController.listar);

module.exports = router;