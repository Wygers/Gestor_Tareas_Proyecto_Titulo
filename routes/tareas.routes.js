const express=require('express');

const router=express.Router();
const tareasController=require('../db/controllers/tareasController');

router.get('/',tareasController.listar);
router.post('/guardar',tareasController.guardar);
router.get('/:id',tareasController.obtenerPorId);
router.put('/actualizar/:id',tareasController.actualizar);
router.delete('/eliminar/:id',tareasController.eliminar);

module.exports=router;