//Plantilla de modelos:
const moongoose = require('mongoose');
const schema = moongoose.Schema;

//Definición de modelo:
const clienteSchema = new schema({
    id_number: Number,
    name: String,
    address: String,
    phone: Number,
    email: String,
    ubication: String,
});

module.exports = moongoose.model('client', clienteSchema);