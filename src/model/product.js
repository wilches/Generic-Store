//Plantilla de modelos:
const moongoose = require('mongoose');
const schema = moongoose.Schema;

//Definición de modelo:
const productSchema = new schema({
    code: Number,
    name: String,
    nitVendor: Number,
    price_buy: Number,
    iva: Number,
    price_sale: Number
});

module.exports = moongoose.model('products', productSchema);