const { json } = require('body-parser');
const express = require('express');
const router = express.Router();

//Modelo:
const Client = require('../model/client');

router.get('/', (req, res) => {
    if( !req.session.info || req.session.info.role != 0 || req.session.info.ubication === 'all' ) res.redirect('/');
    else res.render('clientes', {session: req.session.info});
});

async function getClient(id_number, ubication){ return await Client.findOne({id_number, ubication}) }

async function createAndUpdate(req, method){
    if(
        !req.body.id_number || !req.body.name ||
        !req.body.address || !req.body.phone ||
        !req.body.email
    ) return {success:0, msj:'Campos vacios, verifique que todos los campos están diligenciados.'};

    else
    {
        let client = req.body;
        client.ubication = req.session.info.ubication;
        
        switch( method ){
            case 'create':
                if( await getClient(client.id_number, client.ubication) ) return {success:0, msj: 'El cliente ya se encuentra en la base de datos, eliminelo o editelo.'};
                else {
                    Client.create(client);
                    return {success:1, msj:'Cliente creado con éxito.'}
                }

            case 'update':
                try{
                    let client_update = await Client.findOneAndUpdate({id_number: client.id_number, ubication: client.ubication}, client);
                    if(client_update) return {success:1, msj:'Cliente actualizado con éxito.'}
                    else return {success:0, msj:'No puede actualizar un cliente que no existe.'}
                }
                catch(e){ return {success:0, msj:'Error: '+e} }

        }
    }
}

router.post('/create', async(req, res) => {
    if( !req.session.info || req.session.info.role != 0 || req.session.info.ubication === 'all') return res.sendStatus(404);
    res.json( await createAndUpdate(req, 'create') );
});


router.post('/update', async(req, res) =>{
    if( !req.session.info || req.session.info.role != 0 || req.session.info.ubication === 'all') return res.sendStatus(404);
    res.json( await createAndUpdate(req, 'update') );
});


router.post('/search', async (req, res) => {
    //Validamos que tenga una sessión abierta y los valores ingresados:
    if( !req.session.info || req.session.info.ubication === 'all') return res.sendStatus(404);
    
    //respuesta del servidor:
    let json = { success: 0 };
    
    if( !req.body.id ){ 
        json.msj = 'Falta declarar el número de documento del cliente.'; 
        return res.json(json);
    }

    try{
        //Buscamos el cliente con esa id y que exista en la ubicación especificada:
        let client = await getClient(req.body.id, req.session.info.ubication);

        if( !client ) json.msj = 'El cliente ingresado no existe.';
        else {
            json.success = 1;
            json.client = client;
        }
    }
    catch(e){ json.msj = 'Error encontrado: '+e; }
    res.json(json);
});

router.post('/delete', async(req, res) => {
    if(!req.session.info || req.session.info.role != 0 || req.session.info.ubication === 'all') return res.sendStatus(404);

    let client = await Client.findOneAndRemove({id_number: req.body.id, ubication: req.session.info.ubication});
    if(client) res.json({success:1, msj:'Cliente eliminado con éxito'});
    else res.json({success:0, msj:'No se puede eliminar un cliente inexistente.'});
});

module.exports = router;