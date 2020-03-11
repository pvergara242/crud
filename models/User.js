const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
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

const User = mongoose.model("User", UserSchema);

module.exports = User;