const mongoose = require("mongoose");

const InventarioSchema = new mongoose.Schema({
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Productos'
        },
        cantidad: {
            type: Number,
            required: true
        },
        codigoBarras: {
            type: String,
            required: true
        },
        lote: {
            type: String,
            required: true
        },
        fechaVencimiento: {
            type: Date,
            required: true
        }
    }, { timestamps: true }

);

const inventario = mongoose.model("inventario", InventarioSchema);

module.exports = inventario;
