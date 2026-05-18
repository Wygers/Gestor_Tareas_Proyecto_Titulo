const db=require('../conexion');
const bcrypt=require('bcryptjs');

const authController={};

authController.login=async(req,res)=>{

const{correo,password}=req.body;

try{

if(!correo||!password){

return res.status(400).json({
ok:false,
mensaje:'Debe completar todos los campos.'
});

}

const[usuarios]=await db.query(`
SELECT usuarios.*,roles.nombre_rol
FROM usuarios
INNER JOIN roles
ON usuarios.id_rol=roles.id_rol
WHERE usuarios.correo=?
AND usuarios.activo=1
`,[correo]);

if(usuarios.length===0){

return res.status(401).json({
ok:false,
mensaje:'Correo o contraseña incorrectos.'
});

}

const usuario=usuarios[0];

const passwordValida=await bcrypt.compare(
password,
usuario.password
);

if(!passwordValida){

return res.status(401).json({
ok:false,
mensaje:'Correo o contraseña incorrectos.'
});

}

await db.query(`
UPDATE usuarios
SET ultimo_login=NOW()
WHERE id_usuario=?
`,[usuario.id_usuario]);

req.session.usuario={
id_usuario:usuario.id_usuario,
nombre:usuario.nombre,
apellido:usuario.apellido,
correo:usuario.correo,
id_rol:usuario.id_rol,
rol:usuario.nombre_rol
};

res.status(200).json({
ok:true,
mensaje:'Login exitoso.',
usuario:req.session.usuario
});

}catch(error){

console.log(error);

res.status(500).json({
ok:false,
mensaje:'Error interno del servidor.'
});

}

};

authController.registrarUsuario=async(req,res)=>{

const{
nombre,
apellido,
correo,
password,
telefono,
id_rol
}=req.body;

try{

if(
!nombre||
!apellido||
!correo||
!password||
!id_rol
){

return res.status(400).json({
ok:false,
mensaje:'Todos los campos son obligatorios.'
});

}

const[usuarioExistente]=await db.query(`
SELECT id_usuario
FROM usuarios
WHERE correo=?
`,[correo]);

if(usuarioExistente.length>0){

return res.status(409).json({
ok:false,
mensaje:'El correo ya está registrado.'
});

}

const salt=await bcrypt.genSalt(10);

const passwordHash=await bcrypt.hash(
password,
salt
);

await db.query(`
INSERT INTO usuarios(
id_rol,
nombre,
apellido,
correo,
password,
telefono,
activo
)
VALUES(?,?,?,?,?,?,1)
`,[
id_rol,
nombre,
apellido,
correo,
passwordHash,
telefono||null
]);

res.status(201).json({
ok:true,
mensaje:'Usuario registrado correctamente.'
});

}catch(error){

console.log(error);

res.status(500).json({
ok:false,
mensaje:'Error interno del servidor.'
});

}

};

authController.logout=(req,res)=>{

req.session.destroy(()=>{

res.status(200).json({
ok:true,
mensaje:'Sesión cerrada correctamente.'
});

});

};

module.exports=authController;