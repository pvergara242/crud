const mongoose = require("mongoose");

const InventarioDiarioSchema = new mongoose.Schema({
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Productos'
        },
        cantidad: {
            type: Number,
            required: true
        },
        fecha: {
            type: Date,
            required: true
        }
    }, { timestamps: true }

);

const inventarioDiario = mongoose.model("inventarioDiario", InventarioDiarioSchema);

module.exports = inventarioDiario;
