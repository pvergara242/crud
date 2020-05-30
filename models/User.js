const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
        clave: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            required: true
        },
        estado: {
            type: String,
            required: true
        },
        correo: {
            type: String,
            required: true
        },
        datosPersonales: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DatosPersonales'
        },

    }, { timestamps: true }

);

const User = mongoose.model("Usuarios", UserSchema);

module.exports = User;