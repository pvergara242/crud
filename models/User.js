const mongoose = require("mongoose");
var bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
        clave: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            required: true
        },
        estado: {
            type: String,
            required: true
        },
        correo: {
            type: String,
            required: true
        },
        datosPersonales: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DatosPersonales'
        },

    }, { timestamps: true }

);

UserSchema.pre('save', function (next) {
    var usuario = this;
    if (!usuario.isModified('clave')) {return next()};
    bcrypt.hash(usuario.clave, 10).then((hashedPassword) => {
        usuario.clave = hashedPassword;
        next();
    })
}, function (err) {
    next(err)
});

UserSchema.methods.comparePassword = function(candidatePassword, next){    
    bcrypt.compare(candidatePassword, this.clave, function(err,isMatch){
        if (err) return next('Unauthorization error');
        return next(null, isMatch);
    });
};

const User = mongoose.model("Usuarios", UserSchema);

module.exports = User;