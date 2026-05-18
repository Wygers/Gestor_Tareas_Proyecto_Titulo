const db=require('../conexion');

const tareasController={};

tareasController.listar=async(req,res)=>{

try{

const[tareas]=await db.query(`
SELECT 
tareas.*,
proyectos.nombre_proyecto,
categorias_tarea.nombre_categoria,
prioridades_tarea.nombre_prioridad,
estados_tarea.nombre_estado,
CONCAT(usuarios.nombre,' ',usuarios.apellido) AS responsable
FROM tareas
LEFT JOIN proyectos
ON tareas.id_proyecto=proyectos.id_proyecto
LEFT JOIN categorias_tarea
ON tareas.id_categoria=categorias_tarea.id_categoria
INNER JOIN prioridades_tarea
ON tareas.id_prioridad=prioridades_tarea.id_prioridad
INNER JOIN estados_tarea
ON tareas.id_estado=estados_tarea.id_estado
LEFT JOIN tarea_responsables
ON tareas.id_tarea=tarea_responsables.id_tarea
LEFT JOIN usuarios
ON tarea_responsables.id_usuario=usuarios.id_usuario
ORDER BY tareas.id_tarea DESC
`);

return res.status(200).json({
ok:true,
tareas
});

}catch(error){

console.log(error);

return res.status(500).json({
ok:false,
mensaje:'Error al listar tareas.'
});

}

};

tareasController.guardar=async(req,res)=>{

try{

const{
id_proyecto,
id_categoria,
id_prioridad,
id_estado,
id_usuario,
titulo,
descripcion,
ubicacion_referencial,
fecha_inicio,
fecha_limite
}=req.body;

if(!id_prioridad||!id_estado||!titulo){

return res.status(400).json({
ok:false,
mensaje:'Campos obligatorios incompletos.'
});

}

const[resultado]=await db.query(`
INSERT INTO tareas(
id_proyecto,
id_categoria,
id_prioridad,
id_estado,
id_usuario_creador,
titulo,
descripcion,
ubicacion_referencial,
fecha_inicio,
fecha_limite
)
VALUES(?,?,?,?,?,?,?,?,?,?)
`,[
id_proyecto||null,
id_categoria||null,
id_prioridad,
id_estado,
req.session.usuario.id_usuario,
titulo,
descripcion||null,
ubicacion_referencial||null,
fecha_inicio||null,
fecha_limite||null
]);

if(id_usuario){

await db.query(`
INSERT INTO tarea_responsables(
id_tarea,
id_usuario,
tipo,
asignado_por
)
VALUES(?,?,?,?)
`,[
resultado.insertId,
id_usuario,
'principal',
req.session.usuario.id_usuario
]);

}

return res.status(201).json({
ok:true,
mensaje:'Tarea creada correctamente.',
id_tarea:resultado.insertId
});

}catch(error){

console.log(error);

return res.status(500).json({
ok:false,
mensaje:'Error al crear tarea.'
});

}

};

tareasController.obtenerPorId=async(req,res)=>{

try{

const{id}=req.params;

const[tareas]=await db.query(`
SELECT *
FROM tareas
WHERE id_tarea=?
`,[id]);

if(tareas.length===0){

return res.status(404).json({
ok:false,
mensaje:'Tarea no encontrada.'
});

}

return res.status(200).json({
ok:true,
tarea:tareas[0]
});

}catch(error){

console.log(error);

return res.status(500).json({
ok:false,
mensaje:'Error al obtener tarea.'
});

}

};

tareasController.actualizar=async(req,res)=>{

try{

const{id}=req.params;

const{
titulo,
descripcion,
id_estado,
id_prioridad,
fecha_limite,
porcentaje_avance,
observaciones
}=req.body;

const[tareaExiste]=await db.query(`
SELECT id_tarea
FROM tareas
WHERE id_tarea=?
`,[id]);

if(tareaExiste.length===0){

return res.status(404).json({
ok:false,
mensaje:'La tarea no existe.'
});

}

await db.query(`
UPDATE tareas
SET
titulo=?,
descripcion=?,
id_estado=?,
id_prioridad=?,
fecha_limite=?,
porcentaje_avance=?,
observaciones=?,
fecha_actualizacion=NOW()
WHERE id_tarea=?
`,[
titulo,
descripcion,
id_estado,
id_prioridad,
fecha_limite,
porcentaje_avance||0,
observaciones||null,
id
]);

return res.status(200).json({
ok:true,
mensaje:'Tarea actualizada correctamente.'
});

}catch(error){

console.log(error);

return res.status(500).json({
ok:false,
mensaje:'Error al actualizar tarea.'
});

}

};

tareasController.eliminar=async(req,res)=>{

try{

const{id}=req.params;

const[tareaExiste]=await db.query(`
SELECT id_tarea
FROM tareas
WHERE id_tarea=?
`,[id]);

if(tareaExiste.length===0){

return res.status(404).json({
ok:false,
mensaje:'La tarea no existe.'
});

}

await db.query(`
DELETE FROM tareas
WHERE id_tarea=?
`,[id]);

return res.status(200).json({
ok:true,
mensaje:'Tarea eliminada correctamente.'
});

}catch(error){

console.log(error);

return res.status(500).json({
ok:false,
mensaje:'Error al eliminar tarea.'
});

}

};

module.exports=tareasController;