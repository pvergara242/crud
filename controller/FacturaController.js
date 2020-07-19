const ConsecutivoFactura = require("../models/ConsecutivoFactura");
const DetalleFactura = require("../models/DetalleFactura");
const Factura = require("../models/Factura");
const auth = require("../configuration/auth");

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

        Factura.find(params, 'consecutivo fecha total estado').populate('consecutivo')
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
                            consecutivo: newConsecutivo._id,
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
                    DetalleFactura.find({ factura: resultFactura[0]._id }).populate('inventario')
                        .then(resultDetallesFactura => {
                            var facturaEncontrada = {
                                numero: resultFactura[0].consecutivo.numero,
                                fecha: resultFactura[0].fecha,
                                total: resultFactura[0].total,
                                estado: resultFactura[0].estado,
                                detalles: resultDetallesFactura
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
    }
}

function FacturaException(message, code, httpCode) {
    this.message = message;
    this.code = code;
    this.name = 'FacturaException';
    this.httpCode = httpCode;
}

module.exports = FacturaController;