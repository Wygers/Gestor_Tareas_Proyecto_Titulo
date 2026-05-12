const express = require('express');
const router = express.Router();

const authController = require('../db/controllers/authController');

/* LOGIN */

router.get('/login', authController.mostrarLogin);
router.post('/login', authController.login);

/* REGISTRO */

router.get('/registro', authController.mostrarRegistro);
router.post('/registro', authController.registrarUsuario);

/* LOGOUT */

router.get('/logout', authController.logout);

module.exports = router;