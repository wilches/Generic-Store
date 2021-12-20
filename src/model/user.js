//Plantilla de modelos:
const moongoose = require('mongoose');
const schema = moongoose.Schema;

//Definición de modelo:
const userSchema = new schema({
    name: String,
    password: String,
    ubication: String,
    //role-> 0 admin, 1-> user
    role: Number
});

module.exports = moongoose.model('user', userSchema);