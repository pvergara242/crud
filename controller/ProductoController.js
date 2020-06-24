const Productos = require("../models/Productos");
const Proveedores = require("../models/Proveedores");
const {
    body
} = require('express-validator');
const errorValidation = require("../util/errorValidationTransformer");

let ProductoController = {
    all: async(req, res) => {
        var params;

        if (req.query.includeInactive && req.query.includeInactive === 'true') {
            params = {};
        } else {
            params = {
                estado: "Activo"
            };
        }

        Productos.find(params).populate('proveedor')
            .then(result => {
                res.status(200).send(result);
            })
            .catch(err => {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar productos'
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

        Proveedores.findById(req.body.proveedor)
            .then(result => {
                if (result && result !== null) {
                    return result;
                } else {
                    throw new ProductoException('Error al crear producto', "40004", 400);
                }
            })
            .then(result => {
                req.body.estado = "Activo";
                const newProducto = new Productos(req.body);
                newProducto.save((err, response) => {
                    if (!err) {
                        res.status(201).send();
                    } else {
                        console.log(err);

                        res.status(500).send({
                            codigo: "50000",
                            message: 'Error al crear producto'
                        });
                    }
                });
            })
            .catch(err => {
                if (err.name === 'ProductoException') {

                    res.status(err.httpCode).send({
                        codigo: err.code,
                        message: err.message
                    });
                } else {
                    console.log(err);

                    res.status(500).send({
                        codigo: "50001",
                        message: 'Error al crear producto'
                    });
                }
            });
    },
    find: async(req, res) => {
        Productos.findById(req.params.ProductoId, (err, response) => {
            if (response && response !== null) {
                res.status(200).send(response);
            } else if (err) {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar producto'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Producto no existe'
                });
            }
        }).populate('proveedor');
    },
    update: async(req, res) => {
        const errors = errorValidation.validateRequest(req);

        if (errors.length > 0) {
            return res.status(400).send({
                errors: errors
            });
        }

        Productos.findByIdAndUpdate(req.params.productoId, {
            $set: req.body
        }, {
            new: false
        }, (err, response) => {
            if (!err) {
                res.status(204).send();
            } else {
                console.log(err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al actualizar producto'
                });
            }
        });
    },
    delete: async(req, res) => {
        Productos.findByIdAndUpdate(req.params.productoId, {
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
                    message: 'Error al inactivar producto'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al inactivar producto'
                });
            }
        });
    },
    activate: async(req, res) => {
        Productos.findByIdAndUpdate(req.params.productoId, {
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
                    message: 'Error al activar producto'
                });
            } else {
                res.status(404).send({
                    codigo: "40400",
                    message: 'Error al activar producto'
                });
            }
        });
    },
    validate: (method) => {
        switch (method) {
            case 'nuevoProducto':
                {
                    return [
                        body('proveedor', '40000').exists(),
                        body('nombre', '40001').exists(),
                        body('tipo', '40002').exists(),
                        body('precio', '40003').exists().isFloat().toFloat()
                    ]
                }
            case 'actualizarProducto':
                {
                    return [
                        body('proveedor', '40000').exists(),
                        body('nombre', '40001').exists(),
                        body('tipo', '40002').exists(),
                        body('precio', '40003').exists().isFloat().toFloat()
                    ]
                }
        }
    }
}

function ProductoException(message, code, httpCode) {
    this.message = message;
    this.code = code;
    this.name = 'ProductoException';
    this.httpCode = httpCode;
}

module.exports = ProductoController;