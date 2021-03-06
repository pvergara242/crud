const mongoose = require("mongoose");

const ProveedoresSchema = new mongoose.Schema({
        nombre: {
            type: String,
            required: true
        },
        nit: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        telefono: {
            type: String,
            required: true
        },
        direccion: {
            type: String,
            required: true
        },
        estado: {
            type: String,
            required: true
        }
    }, { timestamps: true }

);

const Proveedores = mongoose.model("Proveedores", ProveedoresSchema);

module.exports = Proveedores;
