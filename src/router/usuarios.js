const express = require('express');
const router = express.Router();

//Modelo:
const User = require('../model/user');

//Cuando el usuario desee logearse:
router.get('/login', (req, res)=>{ 
    //Validamos que no tenga una sesión abierta:
    if( req.session.info ) res.redirect('main');
    else res.redirect('/');
});

router.post('/login', async(req, res) => {
    //Validamos que no tenga una sesión abierta:
    if( req.session.info ) return res.sendStatus(404);

    //Valores traidos:
    let name = req.body.name;
    let password = req.body.password;
    let ubication = req.body.ubication;

    //Respuesta json:
    const response = {
        title: 'Ha ocurrido un error.',
        msj: 'Ha ocurrido un error desconocido.',
        value: false
    }

    //validamos que exista nombre, password y ubicación
    if(!name || !password || !ubication) response.msj = 'Falta completar los campos.';
    else{
        try
        {
            //Buscamos dicho usuario:
            const user = await User.findOne({name: name, password: password});

            //Si no existe, retornamos la respuesta:
            if(!user) response.msj = 'Nombre y/o contraseña, verifique.';
            else if( user.ubication != 'all' && user.ubication != ubication ) response.msj = 'Verifique la localidad del usuario.';
            else{
                //Si existe, entonces generamos las session:
                req.session.info = {
                    id : user._id,
                    name : user.name,
                    ubication : ubication,
                    role : user.role,
                    lang : 'es'
                };
                //Valor de éxito, 1:
                response.title = 'Logueo con éxito.';
                response.msj = 'Felicitaciones, en un segundo será redireccionado.';
                response.success = 1;
            }
        }
        catch(e){ response.msj = 'Error encontrado al buscar usuario: '+e; }
    }
    //Imprimimos respuesta:
    res.json(response);
});

module.exports = router;