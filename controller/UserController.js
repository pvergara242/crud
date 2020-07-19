const User = require("../models/User");
const DatosPersonales = require("../models/DatosPersonales");
const auth = require("../configuration/auth");
const errorValidation = require("../util/errorValidationTransformer");
const {
    body
} = require('express-validator');

let UserController = {
    all: async(req, res) => {
        var params;

        if (req.query.includeInactive && req.query.includeInactive === 'true') {
            params = {};
        } else {
            params = {
                estado: "Activo"
            };
        }

        User.find(params).populate('datosPersonales')
            .then(result => {
                res.status(200).send(result);
            })
            .catch(err => {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar usuarios'
                });
            });
    },
    new: async(req, res) => {
        const errors = errorValidation.validateRequest(req);

        if (errors.length > 0) {
            return res.status(400).send({
                errors: errors
            });
        }

        findAndCreateDatosPersonales(req, res, funcCreateUsuario);
    },
    find: async(req, res) => {
        User.findById(req.params.Userid, (err, response) => {
            if (response && response !== null) {
                res.status(200).send(response);
            } else if (err) {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar usuario'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al consultar usuario'
                });
            }
        }).populate('datosPersonales');
    },
    update: async(req, res) => {
    	const errors = errorValidation.validateRequest(req);

        if (errors.length > 0) {
            return res.status(400).send({
                errors: errors
            });
        }
        
        findAndUpdateDatosPersonales(req, res);
    },
    delete: async(req, res) => {
        User.findByIdAndUpdate(req.params.Userid, {
            $set: {
                estado: "Inactivo"
            }
        }, {
            new: false
        }, (err, response) => {
        	console.log('response: ', response);
        	if (response && response !== null) {
        		res.status(204).send();
            } else if (err) {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al inactivar usuario'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al inactivar usuario'
                });
            }
        });
    },
    activate: async(req, res) => {
        User.findByIdAndUpdate(req.params.Userid, {
            $set: {
                estado: 'Activo'
            }
        }, {
            new: false
        }, (err, response) => {
            if (response && response !== null) {
        		res.status(204).send();
            } else if (err) {
            	console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al activar usuario'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al activar usuario'
                });
            }
        });
    },
    signIn: async(req, res) => {
        const errors = errorValidation.validateRequest(req);

        if (errors.length > 0) {
            return res.status(400).send({
                errors: errors
            });
        }

        var params = {
            numeroDocumento: req.body.numeroDocumento
        };

        DatosPersonales.findOne(params)
            .then(datoPersonal => {

                if (datoPersonal && datoPersonal !== null) {
                    var userParams = {
                        estado: "Activo",
                        datosPersonales: datoPersonal._id
                    };

                    User.findOne(userParams)
                        .then(result => {

                            if (result && result !== null) {
                                result.comparePassword(req.body.pwd, (err, matches) => {
                                    if (!err && err !== null) {
                                        console.log(err);
                                        res.status(500).send({
                                            codigo: "50002",
                                            message: 'Error al ejecutar autenticación'
                                        });
                                    } else if (matches) {
                                        auth.generateToken(result)
                                            .then(token => {
                                                res.status(200).send({
                                                    token: token,
                                                    usuario: {
                                                        nombres: datoPersonal.nombres,
                                                        apellidos: datoPersonal.apellidos,
                                                        nombreCompleto: datoPersonal.nombreCompleto,
                                                        rol: result.rol,
                                                        id: result._id
                                                    }
                                                });
                                            })
                                            .catch(onRejected => {
                                                console.log(err);
                                                res.status(500).send({
                                                    codigo: "50003",
                                                    message: 'Error al ejecutar autenticación'
                                                });
                                            });
                                    } else {
                                        res.status(401).send({
                                            message: 'Unauthorized'
                                        });
                                    }
                                })
                            } else {
                                res.status(401).send({
                                    message: 'Unauthorized'
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).send({
                                codigo: "50001",
                                message: 'Error al ejecutar autenticación'
                            });
                        });
                } else {
                    res.status(401).send({
                        message: 'Unauthorized'
                    });
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al ejecutar autenticación'
                });
            });
    },
    validate: (method) => {
        switch (method) {
            case 'nuevoUsuario':
                {
                    return [
                        body('tipoDocumento', '40000').exists(),
                        body('numeroDocumento', '40001').exists(),
                        body('genero', '40002').exists(),
                        body('nombres', '40003').exists(),
                        body('apellidos', '40004').exists(),
                        body('telefonoFijo', '40005').exists(),
                        body('celular', '40006').exists(),
                        body('direccion', '40007').exists(),
                        body('correo', '40008').exists(),
                        body('clave', '40009').exists(),
                        body('rol', '40010').exists(),
                        body('fechaNacimiento', '40011').exists().isISO8601()
                    ];
                }
            case 'actualizarUsuario':
                {
                    return [
                        body('tipoDocumento', '40000').exists(),
                        body('numeroDocumento', '40001').exists(),
                        body('genero', '40002').exists(),
                        body('nombres', '40003').exists(),
                        body('apellidos', '40004').exists(),
                        body('telefonoFijo', '40005').exists(),
                        body('celular', '40006').exists(),
                        body('direccion', '40007').exists(),
                        body('correo', '40008').exists(),
                        body('rol', '40009').exists(),
                        body('fechaNacimiento', '40010').exists().isISO8601()
                    ];
                }
            case 'signIn':
                {
                    return [
                        body('numeroDocumento', '40000').exists(),
                        body('pwd', '40001').exists()
                    ];
                }
        }
    }
}

function funcCreateUsuario(req, res, datosPersonalId) {
    const usuario = {
        clave: req.body.clave,
        rol: req.body.rol,
        estado: req.body.estado,
        correo: req.body.correo,
        datosPersonales: datosPersonalId
    };

    const newUser = new User(usuario);
    newUser.save()
        .then(result => {
            res.status(201).send();
        })
        .catch(err => {
            console.log(err);

            res.status(500).send({
                codigo: "50002",
                message: 'Error al crear usuario'
            });
        });
}

var actualizarUsuario = function funcActualizarUsuario(req, res, datosPersonalId) {
    const usuario = {
        rol: req.body.rol,
        correo: req.body.correo,
        datosPersonales: datosPersonalId
    };

    User.findByIdAndUpdate(req.params.Userid, {
        $set: usuario
    }, {
        new: false
    }, (err, response) => {
        if (!err) {
            res.status(204).send();
        } else {
            console.log(err);

            res.status(500).send({
                codigo: "50002",
                message: 'Error al actualizar usuario'
            });
        }
    });
}

function findAndCreateDatosPersonales(req, res, callback) {
    req.body.estado = 'Activo';

    const datoPersonal = {
        tipoDocumento: req.body.tipoDocumento,
        numeroDocumento: req.body.numeroDocumento,
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        fechaNacimiento: req.body.fechaNacimiento,
        genero: req.body.genero,
        telefonoFijo: req.body.telefonoFijo,
        direccion: req.body.direccion,
        correo: req.body.correo,
        celular: req.body.celular
    };

    const newDatoPersonal = new DatosPersonales(datoPersonal);

    DatosPersonales.find({
            numeroDocumento: req.body.numeroDocumento
        })
        .then(datoPersonalExistente => {
            var datosPersonalId;
            if (!datoPersonalExistente && datoPersonalExistente !== null) {
            	datosPersonalId = datoPersonalExistente._id;
                callback(req, res, datosPersonalId);
            } else {
                newDatoPersonal.save()
                    .then(datoPersonalCreado => {
                        datosPersonalId = datoPersonalCreado._id;
                        callback(req, res, datosPersonalId);
                    })
                    .catch(err => {
                        console.log(err);

                        res.status(500).send({
                            codigo: "50001",
                            message: 'Error al crear usuario'
                        });
                    });
            }
        })
        .catch(err => {
            console.log(err);

            res.status(500).send({
                codigo: "50000",
                message: 'Error al crear usuario'
            });
        });
}

function findAndUpdateDatosPersonales(req, res) {
    const datoPersonal = {
        tipoDocumento: req.body.tipoDocumento,
        numeroDocumento: req.body.numeroDocumento,
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        fechaNacimiento: req.body.fechaNacimiento,
        genero: req.body.genero,
        telefonoFijo: req.body.telefonoFijo,
        direccion: req.body.direccion,
        correo: req.body.correo,
        celular: req.body.celular
    };

    DatosPersonales.findOne({
            numeroDocumento: req.body.numeroDocumento,
            tipoDocumento: req.body.tipoDocumento
        })
        .then(datoPersonalExistente => {
            var datosPersonalId;
            if (datoPersonalExistente && datoPersonalExistente !== null) {
                datosPersonalId = datoPersonalExistente._id;

                DatosPersonales.findByIdAndUpdate(datosPersonalId, {
                        $set: datoPersonal
                    }, {
                        new: false
                    })
                    .then(datoPersonalActualizado => {
                        actualizarUsuario(req, res, datosPersonalId);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send({
                            codigo: "50001",
                            message: 'Error al actualizar usuario'
                        });
                    });
            } else {
                const newDatoPersonal = new DatosPersonales(datoPersonal);
                newDatoPersonal.save()
                    .then(datoPersonalCreado => {
                        datosPersonalId = datoPersonalCreado._id;
                        actualizarUsuario(req, res, datosPersonalId);
                    })
                    .catch(err => {
                        console.log(err);

                        res.status(500).send({
                            codigo: "50003",
                            message: 'Error al actualizar usuario'
                        });
                    });
            }
        })
        .catch(err => {
            console.log(err);

            res.status(500).send({
                codigo: "50000",
                message: 'Error al actualizar usuario'
            });
        });
}

module.exports = UserController;