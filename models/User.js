const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
        tipoDeDocumento: {
            type: String,
            required: true
        },
        numeroDocumento: Number,
        is_active: {
            type: Number,
            required: true
        },
        fechaNacimiento: {
            type: Date,
            required: true
        },
        genero: {
            type: String,
            required: trues
        },
        nombres: {
            type: String,
            required: true
        },

        apellidos: {
            type: String,
            required: true
        },
        telefonoFijo: {
            type: Number,
            required: true
        },
        celular: {
            type: Number,
            required: true
        },
        correo: {
            type: String,
            required: true
        },
        contraseña: {
            type: Number,
            required: true
        },
        confirmarContraseña: {
            type: Number,
            required: true
        },
        rol: {
            type: String,
            required: true
        },

    }, { timestamps: true }

);

const User = mongoose.model("User", UserSchema);

module.exports = User;