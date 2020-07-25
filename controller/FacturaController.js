const ConsecutivoFactura = require("../models/ConsecutivoFactura");
const DetalleFactura = require("../models/DetalleFactura");
const Factura = require("../models/Factura");
const Inventario = require("../models/Inventario");
const InventarioDiario = require("../models/InventarioDiario");
const auth = require("../configuration/auth");
const errorValidation = require("../util/errorValidationTransformer");

const {
    body
} = require('express-validator');

let FacturaController = {
    findByUser: async(req, res) => {

        var payload = auth.parseToken(req.headers.authorization);

        if (payload === null || payload.id != req.params.userId) {
            return res.status(403).send({
                    codigo: "40300",
                    message: 'Error al consultar factura'
                });
        }

        var params = {
            usuario: req.params.userId,
            estado: 'PENDIENTE'
        };

        Factura.find(params, 'numero fecha total estado').populate('consecutivo')
            .then(resultFactura => {

                if (!resultFactura || resultFactura === null || resultFactura.length === 0) {

                    let session = null;
                    var nuevaFactura = null;
                    var newConsecutivo = null;
                    ConsecutivoFactura.find({}).sort({
                            "numero": -1
                        }).limit(1)
                    .then(resultConsecutivo => {

                        if (resultConsecutivo && resultConsecutivo !== null && resultConsecutivo.length > 0) {
                            newConsecutivo = new ConsecutivoFactura(resultConsecutivo[0]);
                            newConsecutivo.numero += 1;
                        } else {
                            return ConsecutivoFactura.createCollection()
                                .then(collection => {
                                    newConsecutivo = new ConsecutivoFactura({
                                        numero: 1
                                    });
                                })
                                .catch(err => {
                                    console.log(err);

                                    throw new FacturaException('Error al consultar factura', "50002", 500);
                                })
                        }
                        return newConsecutivo;
                    })
                    .then(resultNewConsecutivo => Factura.createCollection())
                    .then(() => 
                        Factura.startSession()
                    )
                    .then(_session => {
                        session = _session;
                        session.startTransaction();

                        return newConsecutivo.save({
                            session: session
                        });
                    })
                    .then(collection => {

                        var newFactura = {
                            usuario: req.params.userId,
                            numero: newConsecutivo.numero,
                            fecha: new Date(),
                            total: 0,
                            estado: 'PENDIENTE'
                        };

                        nuevaFactura = new Factura(newFactura);

                        return nuevaFactura.save({
                            session: session
                        });
                    })
                    .then(() => session.commitTransaction())
                    .then(() => session.endSession())
                    .then(() => {
                        var facturaEncontrada = {
                                numero: newConsecutivo.numero,
                                fecha: nuevaFactura.fecha,
                                total: nuevaFactura.total,
                                estado: nuevaFactura.estado,
                                detalles: []
                            };

                        res.status(201).send(facturaEncontrada);
                    })
                    .catch(err => {
                        console.log(err);

                        if (session && session !== null) {
                            session.abortTransaction();
                        }

                        if (err.name === 'FacturaException') {

                            res.status(err.httpCode).send({
                                codigo: err.code,
                                message: err.message
                            });
                        } else {
                            console.log(err);

                            res.status(500).send({
                                codigo: "50001",
                                message: 'Error al consultar factura'
                            });
                        }
                    });
                } else {
                    DetalleFactura.find({ factura: resultFactura[0]._id })
                        .populate({ path: 'inventario', populate: { path: 'producto' }})
                        .then(resultDetallesFactura => {

                            var detalles = [];

                            for(let j = 0, lengthDetallesFactura = resultDetallesFactura.length; j < lengthDetallesFactura; j++){
                                var detalle = {
                                    cantidadCompra: resultDetallesFactura[j].cantidad,
                                    cantidad: resultDetallesFactura[j].inventario.cantidad,
                                    codigoBarras: resultDetallesFactura[j].inventario.codigoBarras,
                                    producto: {
                                        id: resultDetallesFactura[j].inventario.producto._id,
                                        nombre: resultDetallesFactura[j].inventario.producto.nombre
                                    }
                                }
                                detalles.push(detalle);
                            }

                            var facturaEncontrada = {
                                numero: resultFactura[0].numero,
                                fecha: resultFactura[0].fecha,
                                total: resultFactura[0].total,
                                estado: resultFactura[0].estado,
                                detalles: detalles
                            };

                            res.status(200).send(facturaEncontrada);
                        })
                        .catch(err => {
                            console.log(err);

                            res.status(500).send({
                                codigo: "50003",
                                message: 'Error al consultar factura'
                            });
                        });
                }
            })
            .catch(err => {
                console.log("Error al consultar factura: ", err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al consultar factura'
                });
            });
    },
    addDetalleFactura: async(req, res) => {

        const errors = errorValidation.validateRequest(req);

        if (errors.length > 0) {
            return res.status(400).send({
                errors: errors
            });
        }

        var payload = auth.parseToken(req.headers.authorization);

        if (payload === null || payload.id != req.params.userId) {
            return res.status(403).send({
                    codigo: "40300",
                    message: 'Error al agregar producto a la factura'
                });
        }

        let numeroFactura = parseInt(req.params.numeroFactura);

        var params = {
            numero: numeroFactura,
            usuario: req.params.userId,
            estado: 'PENDIENTE'
        };

        Factura.find(params, '_id numero')
            .then(resultFactura => {

                if (!resultFactura || resultFactura === null || resultFactura.length === 0) {
                    res.status(404).send({
                        codigo: "40400",
                        message: 'Error al agregar producto a la factura'
                    });
                    
                } else {
                    let inventarioEncontrado = null;
                    Inventario.findOne({ codigoBarras: req.body.codigoBarras }).populate('producto')
                    .then(resultInventario => {
                        if (resultInventario && resultInventario !== null) {
                            return resultInventario;
                        }

                        throw new FacturaException('Error al agregar producto a la factura', "40001", 400);
                    })
                    .then(inventario => {
                        inventarioEncontrado = inventario;

                        return DetalleFactura.findOne({
                            factura: resultFactura[0]._id,
                            inventario: inventario._id
                        })
                    })
                    .then(detalleFactura => {

                        var nuevoDetalleFactura = detalleFactura;

                        if (nuevoDetalleFactura && nuevoDetalleFactura !== null) {
                            nuevoDetalleFactura.cantidad = nuevoDetalleFactura.cantidad + 1; 
                        } else {
                            nuevoDetalleFactura = {
                                factura: resultFactura[0]._id,
                                inventario: inventarioEncontrado._id,
                                cantidad: 1,
                                precio: inventarioEncontrado.producto.precio,
                                subtotal: inventarioEncontrado.producto.precio
                            };
                        }

                        return new DetalleFactura(nuevoDetalleFactura).save();
                    })
                    .then(nuevoDetalleFactura => {
                        var responseDetalleFactura = {
                            cantidadCompra: nuevoDetalleFactura.cantidad,
                            cantidad: inventarioEncontrado.cantidad,
                            codigoBarras: inventarioEncontrado.codigoBarras,
                            producto: {
                                id: inventarioEncontrado.producto._id,
                                nombre: inventarioEncontrado.producto.nombre
                            }
                        };

                        res.status(201).send(responseDetalleFactura);
                    })
                    .catch(err => {
                        console.log(err);

                        if (err.name === 'FacturaException') {

                            res.status(err.httpCode).send({
                                codigo: err.code,
                                message: err.message
                            });
                        } else {

                            res.status(500).send({
                                codigo: "50001",
                                message: 'Error al agregar producto a la factura'
                            });
                        }
                    });
                }
            })
            .catch(err => {
                console.log("Error al consultar factura: ", err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al agregar producto a la factura'
                });
            });
    },
    pagarFactura: async(req, res) => {

        var payload = auth.parseToken(req.headers.authorization);

        if (payload === null || payload.id != req.params.userId) {
            return res.status(403).send({
                    codigo: "40300",
                    message: 'Error al agregar producto a la factura'
                });
        }

        let numeroFactura = parseInt(req.params.numeroFactura);

        var params = {
            numero: numeroFactura,
            usuario: req.params.userId,
            estado: 'PENDIENTE'
        };

        Factura.find(params, '_id numero')
            .then(resultFactura => {

                if (!resultFactura || resultFactura === null || resultFactura.length === 0) {
                    res.status(404).send({
                        codigo: "40400",
                        message: 'Error al pagar la factura'
                    });
                    
                } else {
                    var detallesFactura = null;
                    DetalleFactura.find({ factura: resultFactura[0]._id })
                        .populate({ path: 'inventario', populate: { path: 'producto' }})
                        .then(resultDetallesFactura => {

                            if (!resultDetallesFactura || resultDetallesFactura === null || resultDetallesFactura.length === 0) {
                                throw new FacturaException('Error al pagar la factura', "40000", 400);
                            }

                            detallesFactura = resultDetallesFactura;

                            var productos = [];

                            for(let j = 0, lengthDetallesFactura = resultDetallesFactura.length; j < lengthDetallesFactura; j++){
                                productos.push(resultDetallesFactura[j].inventario.producto._id);
                            }

                            return InventarioDiario.find({ producto: { $in: productos}, cantidad: { $gt: 0} })
                            .populate('producto')
                            .sort({
                                "fecha": -1
                            });
                        })
                        .then(inventariosDiario => {
                            
                            for(let j = 0, length2 = detallesFactura.length; j < length2; j++){
                                for(let k = 0, length3 = inventariosDiario.length; k < length3; k++){
                                    if (detallesFactura[j].inventario.producto._id.toString() === inventariosDiario[k].producto._id.toString()) {
                                        inventariosDiario[k].cantidad = inventariosDiario[k].cantidad - detallesFactura[j].cantidad;

                                        var inventarioDiarioActualizado = new InventarioDiario(inventariosDiario[k]);

                                        inventarioDiarioActualizado.save((err, result) => {
                                            if (err) {
                                                console.log(err);

                                                throw new FacturaException('Error al pagar la factura', "50002", 500);
                                            }
                                        });
                                        break;
                                    }
                                }
                            }         
                        })
                        .then(() => {
                            resultFactura[0].estado = 'PROCESADO';

                            resultFactura[0].save();
                        })
                        .then(() => {
                            var detalles = [];

                            for(let j = 0, lengthDetallesFactura = detallesFactura.length; j < lengthDetallesFactura; j++){
                                var detalle = {
                                    cantidadCompra: detallesFactura[j].cantidad,
                                    codigoBarras: detallesFactura[j].inventario.codigoBarras,
                                    producto: {
                                        id: detallesFactura[j].inventario.producto._id,
                                        nombre: detallesFactura[j].inventario.producto.nombre
                                    }
                                }
                                detalles.push(detalle);
                            }

                            var facturaEncontrada = {
                                numero: resultFactura[0].numero,
                                fecha: resultFactura[0].fecha,
                                total: resultFactura[0].total,
                                estado: resultFactura[0].estado,
                                detalles: detalles
                            };

                            res.status(200).send(facturaEncontrada);
                        })
                        .catch(err => {
                            console.log(err);

                            if (err.name === 'FacturaException') {

                                res.status(err.httpCode).send({
                                    codigo: err.code,
                                    message: err.message
                                });
                            } else {

                                res.status(500).send({
                                    codigo: "50001",
                                    message: 'Error al pagar la factura'
                                });
                            }
                        });
                }
            })
            .catch(err => {
                console.log("Error al consultar factura: ", err);

                res.status(500).send({
                    codigo: "50000",
                    message: 'Error al pagar la factura'
                });
            });
    },
    validate: (method) => {
        switch (method) {
            case 'nuevoDetalleFactura':
                {
                    return [
                        body('codigoBarras', '40000').exists().trim().isLength({ min: 1 })
                    ]
                }
        }
    }
}

function FacturaException(message, code, httpCode) {
    this.message = message;
    this.code = code;
    this.name = 'FacturaException';
    this.httpCode = httpCode;
}

module.exports = FacturaController;