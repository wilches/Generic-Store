const express = require('express');
const router = express.Router();

//Modelo:
const Sale = require('../model/sale');

router.get('/', async(req, res) => {
    if( req.session.info ) res.render('ventas', {session: req.session.info});
    else res.redirect('/');
});

/**
 * Función usada en router->/getConsecutive y router->create
 * Retorna el consecutivo de la factura.
 */
async function getConsecutive(ubication){ return await Sale.count({ubication})+1; }

router.get('/getConsecutive', async function(req, res) {
    if( !req.session.info ) res.redirect('/');
    else res.send( String( await getConsecutive(req.session.info.ubication) ) );
});


router.post('/create', async function(req, res) {
    if( !req.session.info ) return res.sendStatus(404);
    if( !req.body.id_client || !req.body.products ) return res.json({success:0, msj:'Información traida incompleta, verifique que declaró al menos un producto, y el cliente'});
    
    //Valores principales:
    const sale = {
        cedula_client: req.body.id_client,
        ubication: req.session.info.ubication,
        code_sale: await getConsecutive(req.session.info.ubication),
        totalSale: 0,
        ivaSale: 0,
        details_sale: []
    };
    
    //Para trabajar con los productos:
    const getProduct = require('./productos').getProduct;   //Función para pedir productos
    let products = JSON.parse(req.body.products);           //Productos traidos.

    //Para todos los productos ingresados vamos a guardarlos en details_sale.
    //y además iremos obteniendo el precio final de venta e iva:
    let size = products.length;
    let ubication = req.session.info.ubication;
    for(i=0; i<size; i++){
        info = products[i];
        let product = await getProduct(info.code, ubication);
        
        let details = {
            code_product: info.code,
            amount_product: info.amount,
        };
        details.totalSale = Number( (product.price_sale * details.amount_product).toFixed(2) ),
        details.ivaSale = Number( ((product.iva/100) * details.totalSale).toFixed(2) ),
        details.valueSale = details.ivaSale + details.totalSale

        sale.details_sale.push(details);
        sale.totalSale += details.totalSale;
        sale.ivaSale += details.ivaSale;
    }

    //Total a pagar:
    sale.valueSale = sale.ivaSale + sale.totalSale;

    //Creamos esa factura:
    Sale.create(sale, (err,data)=>{
        let resJson = {success:1, msj:'Registro creado con éxito'};
        if(err) resJson = {success:0, msj:err};

        res.json(resJson);
    });
});


module.exports = router;