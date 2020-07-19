const mongoose = require("mongoose");

const ConsecutivoFacturaSchema = new mongoose.Schema({
        numero: {
            type: Number,
            required: true
        },
    }, { timestamps: true }

);

const consecutivoFactura = mongoose.model("consecutivoFactura", ConsecutivoFacturaSchema);

module.exports = consecutivoFactura;
