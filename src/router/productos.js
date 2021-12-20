//Rutas:
const express = require('express');
const router = express.Router();

//Modelo:
const Product = require('../model/product');

//--------------------------------------
//Manejo de archivos:
const multer = require('multer'); //subir archivo
const csv = require('csvtojson'); //pasar de csv a json.

//Config lugar y nombre de archivos:
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'src/public/uploads');
    },

    filename: function(req, file, cb){
        //cb(null, file.fieldname + '-' + Date.now());
        cb(null, 'file.csv');
    },
});

//Pasamos propiedades:
const upload = multer({storage});
//--------------------------------------


router.get('/', (req, res) => {
    if( !req.session.info || req.session.info.role !==0 ) res.redirect('/');
    else res.render('productos', {session: req.session.info});
});


const getProduct = async function(code, ubication){ return await Product.findOne({code, ubication}) }


router.post('/search', async(req, res) => {
    if( !req.session.info ) return res.sendStatus(404);

    let json = {success:0, title:'Error en la consulta'};
    
    if( !req.body.id ) json.msj = 'No puede consultarse un producto si no se declara el id.';
    else{
        let code = req.body.id;
        const product = await getProduct(code, req.session.info.ubication);

        if(product){
            json = {
                success: 1,
                product: {
                    name: product.name,
                    price: product.price_sale,
                    iva: product.iva
                }
            }
        }
        else json.msj = 'No se ha encontrado un producto con el código ingresado.';
    }

    res.json(json);
});


//Cargue de archivos:
router.post('/', upload.single('file_csv'), async(req, res) => {
    //Validamos que la sesión esté habilitada y tenga rol de adm:
    if( !req.session.info || req.session.info.role !== 0) return res.sendStatus(404);

    //Lista de tipos de archivos validos:
    const whitelist = ['application/vnd.ms-excel'];

    //Template de respuesta:
    let json = {success:0, msj:'Error desconocido'};

    //Este archivo no está incluido dentro de los permitidos:
    if( !whitelist.includes(req.file.mimetype) ) json.msj = 'Tipo de extensión no valida.';
    else
    {
        let infoRebotada = [];
        csv().fromFile(req.file.path).then( (data)=>{ infoRebotada = setProducts(data) } );
        //Luego vemos como guardar la información: if( infoRebotada ) 
        json.success = 1
        json.msj = 'Cargue éxitoso.';
    }
    res.render('productos', {session: req.session.info, response: json});
});



/**
 * La siguiente función realiza lo siguiente por cada registro de la información traida:
 * > valida que contenga todos los campos necesarios.
 * > valida que ya no exista ese producto (de estarlo, sumaremos la cantidad añadida)
 * > aquello que en las validaciones dió error se retorna en un json con la observación.
 * @param {ArrayJsObject} data contiene un arreglo con objetos json de cada producto.
 * @return {ArrayJsObject} retorna la información rebotada.
 */
function setProducts(data){
    let infoRebotada = [];
    data.forEach( async (json)=>{
        let msj = '';
        if( 
            typeof json.codigo_producto != 'undefined' &&
            typeof json.nombre_producto != 'undefined' &&
            typeof json.nitproveedor != 'undefined' &&
            typeof json.precio_compra != 'undefined' &&
            typeof json.ivacompra != 'undefined' &&
            typeof json.precio_venta != 'undefined'
        ){
            //Cambiamos los nombres de los atributos:
            json = {
                'code': json.codigo_producto,
                'name': json.nombre_producto,
                'nitVendor': json.nitproveedor,
                'price_buy': json.precio_compra,
                'iva': json.ivacompra,
                'price_sale': json.precio_venta
            }
            try{
                const product_search = await Product.findOne({code: json.code});
                
                if( !product_search ) Product.create(json, (err,data)=>{ if(err) msj=err; });
                else Product.updateOne({_id:product_search._id}, { $set: {json} });
            }
            catch(e){ msj=e.message; }
        }
        else msj = 'Faltan campos, revise que contenga: codigo_producto, nombre_producto, nitproveedor, precio_compra, ivacompra, precio_venta';
        
        if( msj != '' ){
            //añado el producto que rebotó y la observación:
            infoRebotada.push( json );
            infoRebotada[ infoRebotada.length - 1 ].msj = msj;
        }
    });
    return infoRebotada;
}

module.exports = {
    router,
    getProduct
};