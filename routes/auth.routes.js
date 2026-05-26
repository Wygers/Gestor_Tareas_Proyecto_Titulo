const express = require('express');
const router = express.Router();
const authController = require('../db/controllers/authController');

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/registro', authController.showRegistro);
router.post('/registro', authController.registrarUsuario);
router.get('/logout', authController.logout);

module.exports = router;