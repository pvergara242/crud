const mongoose = require("mongoose");

const FacturaSchema = new mongoose.Schema({
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuarios'
        },
        consecutivo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'consecutivoFactura'
        },
        fecha: {
            type: Date,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        estado: {
            type: String,
            required: true
        }
    }, { timestamps: true }

);

const factura = mongoose.model("factura", FacturaSchema);

module.exports = factura;
