const mongoose = require("mongoose");

const ProveedoresSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        document: Number,
        is_active: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true }

);

const Proveedores = mongoose.model("Proveedores", ProveedoresSchema);

module.exports = Proveedores;