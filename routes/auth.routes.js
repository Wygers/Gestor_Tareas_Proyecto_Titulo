const express=require('express');
const router=express.Router();
const authController=require('../db/controllers/authController');

router.post('/login',authController.login);
router.post('/registro',authController.registrarUsuario);
router.get('/logout',authController.logout);

module.exports=router;