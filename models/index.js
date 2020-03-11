const mongoose = require("mongoose");
const dburl = `mongodb+srv://Paola_Veragara:pao940816ap@cluster0-4bfxu.mongodb.net/Nova_stock?retryWrites=true&w=majority`
const User = require("./User");
const Proveedores = require("./Proveedores");

mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    !err ? console.log("conexion exitosa") : console.log(err);
})

module.exports = {
    User,
    Proveedores
};