const express=require('express');
const path=require('path');
const session=require('express-session');

const app=express();
const PORT=process.env.PORT||3000;

const db=require('./db/conexion');
const authRoutes=require('./routes/auth.routes');
const tareasRoutes=require('./routes/tareas.routes');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
secret:'gestor_tareas_secret_key',
resave:false,
saveUninitialized:false,
cookie:{
secure:false,
httpOnly:true,
maxAge:1000*60*60*24
}
}));

app.use((req,res,next)=>{

res.locals.usuario=req.session.usuario||null;

next();

});

app.use('/auth',authRoutes);
app.use('/tareas',tareasRoutes);

app.get('/',async(req,res)=>{

try{

const[rows]=await db.query(`
SELECT NOW() AS fecha
`);

res.render('Home',{
title:'Gestor de Tareas Profesional',
fechaServidor:rows[0].fecha
});

}catch(error){

console.error('Error consultando MySQL:',error.message);

res.status(500).render('Home',{
title:'Error',
fechaServidor:null
});

}

});

app.use((req,res)=>{

res.status(404).send('Ruta no encontrada');

});

app.listen(PORT,()=>{

console.log(`Servidor corriendo en http://localhost:${PORT}`);

});