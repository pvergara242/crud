const mongoose = require("mongoose");

const DetalleFacturaSchema = new mongoose.Schema({
        factura: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'factura'
        },
        inventario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'inventario'
        },
        cantidad: {
            type: Number,
            required: true
        },
        precio: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }, { timestamps: true }

);

const detalleFactura = mongoose.model("detalleFactura", DetalleFacturaSchema);

module.exports = detalleFactura;
