const mongoose = require("mongoose");

const ProveedoresSchema = new mongoose.Schema({
        codigo_proveedor: {
            type: String,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        nit: Number,
        is_active: {
            type: Boolean,
            default: true
        },
        descripcion: {
            type: String,
            required: true
        },
        direccion: {
            type: String,
            required: true
        },
        telefono: {
            type: String,
            required: true
        },
        cod_estado: {
            type: String,
            required: true
        },
    }, { timestamps: true }

);

const Proveedores = mongoose.model("Proveedores", ProveedoresSchema);

module.exports = Proveedores;
