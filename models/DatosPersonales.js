const mongoose = require("mongoose");


const DatosPersonalesSchema = new mongoose.Schema({
        tipoDocumento: {
            type: String,
            required: true
        },
        numeroDocumento: {
            type: String,
            required: true
        },
        nombres: {
            type: String,
            required: true
        },
        apellidos: {
            type: String,
            required: true
        },
        fechaNacimiento: {
            type: Date,
            required: true
        },
        genero: {
            type: String,
            required: true
        },
        telefonoFijo: {
            type: String,
            required: true
        },
        direccion: {
            type: String,
            required: true
        },
        correo: {
            type: String,
            required: true
        },
        celular: {
            type: String,
            required: true
        }
    }, { timestamps: true }

);

const DatosPersonales = mongoose.model("DatosPersonales", DatosPersonalesSchema);

module.exports = DatosPersonales;