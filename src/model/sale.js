//Plantilla de modelos:
const moongoose = require('mongoose');
const schema = moongoose.Schema;

//Definición de modelo:
const saleSchema = new schema({
    cedula_client: Number,
    code_sale: Number,
    details_sale: [{
        code_product: Number,
        amount_product: Number,
        ivaSale: Number,
        totalSale: Number,
        valueSale: Number,
    }],
    ivaSale: Number,
    totalSale: Number,
    valueSale: Number,
    ubication: String
});

module.exports = moongoose.model('sale', saleSchema);