const Proveedores = require("../models/Proveedores");
const {
    body
} = require('express-validator');
const errorValidation = require("../util/errorValidationTransformer");

let ProveedorController = {
    all: async(req, res) => {
        var params;

        if (req.query.includeInactive && req.query.includeInactive === 'true') {
            params = {};
        } else {
            params = {
                estado: "Activo"
            };
        }

        Proveedores.find(params)
            .then(result => {
                res.status(200).send(result);
            })
            .catch(err => {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar proveedores'
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

        Proveedores.find({
                nit: req.body.nit
            })
            .then(result => {
                if (result && result.length === 0) {
                    req.body.estado = "Activo";
                    const newProveedores = new Proveedores(req.body);
                    newProveedores.save((err, response) => {
                        if (!err) {
                            res.status(201).send();
                        } else {
                            console.log(err);

                            res.status(500).send({
                                codigo: "50001",
                                message: 'Error al crear proveedor'
                            });
                        }
                    });
                } else {
                    res.status(400).send({
                        codigo: "40005",
                        message: 'Error al crear proveedor'
                    });
                }
            })
            .catch(err => {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar proveedores'
                });
            });


    },
    find: async(req, res) => {
        Proveedores.findById(req.params.Proveedoresid, (err, response) => {
            if (response && response !== null) {
                res.status(200).send(response);
            } else if (err) {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar proveedor'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al consultar proveedor'
                });
            }
        });
    },
    update: async(req, res) => {
        const errors = errorValidation.validateRequest(req);

        if (errors.length > 0) {
            return res.status(400).send({
                errors: errors
            });
        }

        var proveedorActual;

        Proveedores.findById(req.params.Proveedoresid)
            .then(result => {
                if (!result || result === null) {
                    throw new ProveedorException('Error al actualizar proveedor', "40400", 404);
                }
                return result;
            })
            .then(result => {
                proveedorActual = result;
                return Proveedores.find({
                    nit: req.body.nit
                });
            })
            .then(response => {
                if (response && response.length > 0 && response[0]._id != req.params.Proveedoresid) {
                    throw new ProveedorException('Error al actualizar proveedor', "40005", 400);
                }
                return proveedorActual;
            })
            .then(result => {
                Proveedores.findByIdAndUpdate(req.params.Proveedoresid, {
                    $set: req.body
                }, {
                    new: false
                }, (err, response) => {
                    if (response && response !== null) {
                        res.status(204).send();
                    } else if (err) {
                        console.log(err);

                        res.status(500).send({
                            codigo: "50000",
                            message: 'Error al actualizar proveedor'
                        });
                    }
                });
            })
            .catch(err => {
                if (err.name === 'ProveedorException') {

                    res.status(err.httpCode).send({
                        codigo: err.code,
                        message: err.message
                    });
                } else {
                    console.log(err);

                    res.status(500).send({
                        codigo: "50001",
                        message: 'Error al actualizar proveedor'
                    });
                }
            });
    },
    delete: async(req, res) => {
        Proveedores.findByIdAndUpdate(req.params.proveedorId, {
            $set: {
                estado: "Inactivo"
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
                    message: 'Error al inactivar proveedor'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al inactivar proveedor'
                });
            }
        });
    },
    activate: async(req, res) => {
        Proveedores.findByIdAndUpdate(req.params.Proveedoresid, {
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
                    message: 'Error al activar proveedor'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al activar proveedor'
                });
            }
        });
    },
    validate: (method) => {
        switch (method) {
            case 'nuevoProveedor':
                {
                    return [
                        body('nombre', '40000').exists(),
                        body('nit', '40001').exists(),
                        body('email', '40002').exists().isEmail(),
                        body('telefono', '40003').exists(),
                        body('direccion', '40004').exists()
                    ]
                }
            case 'actualizarProveedor':
                {
                    return [
                        body('nombre', '40000').exists(),
                        body('nit', '40001').exists(),
                        body('email', '40002').exists().isEmail(),
                        body('telefono', '40003').exists(),
                        body('direccion', '40004').exists()
                    ]
                }
        }
    }
}

function ProveedorException(message, code, httpCode) {
    this.message = message;
    this.code = code;
    this.name = 'ProveedorException';
    this.httpCode = httpCode;
}

module.exports = ProveedorController;