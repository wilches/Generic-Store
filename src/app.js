//construcción del servidor con Express.
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

//Uso de sesiones:
const session = require('express-session');


//Conexión a base de datos: NO ELIMINAR, DE ÉL DEPENDE EL ACCESO A LA BASE DE DATOS
const mongoose = require('./db');


//Parsear en json entradas:  a partir de la version 4.16.x de express ya viene como dependencia.
//const bodyParser = require('body-parser');
app.use(express.json());
app.use(express.urlencoded({extended: false}));


//Uso de sesiones:
app.use(session({
    secret: "key123",
    resave: false,
    saveUninitialized: false
}));


//Motor de vistas ejs:
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//Carpeta de recursos:
app.use(express.static(__dirname + '/public'));


//=======================================
//Manejo de rutas:

app.get('/', (req,res)=>{
    //Si ya existe una sessión redireccionelo al main, de lo contrario permitale el acceso:
    if( req.session.info ) res.redirect('main');
    else res.render('login', {lang: 'es'});
});

app.get('/main', (req,res)=>{
    //Si existen sessiones dejelo ingresar, de lo contrario, redireccione al login:
    if( req.session.info ) res.render('main', {session: req.session.info});
    else res.redirect('/');
});

app.get('/killSession', (req,res)=>{ delete req.session.info; res.redirect('/'); });

app.use('/clientes', require('./router/clientes'));
app.use('/consolidacion', require('./router/consolidacion'));
app.use('/productos', require('./router/productos').router);
app.use('/ventas', require('./router/ventas'));
app.use('/usuarios', require('./router/usuarios'));
app.use('/reportes', require('./router/reportes'));
//========================================



//Para páginas que no encuentre.
app.use( (req, res, next)=>{
    res.status(404).render('404');
});

app.listen(port, ()=>{
    console.log('Servidor activado en el puerto ',port);
})