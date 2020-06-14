const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
        proveedor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedores'
        },
        nombre: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
            required: true
        },
        tipo: {
            type: String,
            required: true
        },
        precio: {
            type: Number,
            required: true
        },
        estado: {
            type: String,
            required: true
        }
    }, { timestamps: true }

);

const productos = mongoose.model("productos", ProductoSchema);

module.exports = productos;
