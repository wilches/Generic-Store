//Plantilla de modelos:
const moongoose = require('mongoose');
const schema = moongoose.Schema;

//Definición de modelo:
const reporteSchema = new schema({
    id_number: Number,
    name: String,
    totalSale: String,
    ubication: String
});

module.exports = moongoose.model('report', reporteSchema);