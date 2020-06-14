const Inventario = require("../models/Inventario");
const InventarioDiario = require("../models/InventarioDiario");
const Productos = require("../models/Productos");

let InventarioController = {
    new: async(req, res) => {

        var params = {
            _id: req.body.producto,
            estado: 'Activo'
        };

        Productos.findOne(params)
            .then(result => {

                if (result && result !== null) {

                    var inventarioDiarioEncontrado = null;
                    params = {
                        producto: req.body.producto
                    };
                    InventarioDiario.find(params).sort({
                            "fecha": -1
                        }).limit(1)
                        .then(result => {

                            inventarioDiarioEncontrado = result;
                            params = {
                                producto: req.body.producto,
                                codigoBarras: req.body.codigoBarras
                            };
                            return Inventario.findOne(params);
                        })
                        .then(result => {

                            if (result && result !== null) {
                                throw new InventarioException('Error al crear inventario', "40002");
                            }
                            return result;
                        })
                        .then(result => {

                            let session = null;
                            Inventario.startSession().
                            then(_session => {
                                session = _session;
                                session.startTransaction();
                                var newInventario = {
                                    producto: req.body.producto,
                                    cantidad: req.body.cantidad,
                                    codigoBarras: req.body.codigoBarras,
                                    lote: req.body.lote,
                                    fechaVencimiento: req.body.fechaVencimiento
                                };

                                var nuevoInventario = new Inventario(newInventario);

                                return nuevoInventario.save({
                                    session: session
                                });
                            }).
                            then(() => {

                                let date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
                                var newInventarioDiario;

                                if (inventarioDiarioEncontrado && inventarioDiarioEncontrado !== null && inventarioDiarioEncontrado.length > 0) {
                                    
                                    if (dateEquality(inventarioDiarioEncontrado[0].fecha, date)) {
                                        
                                        newInventarioDiario = new InventarioDiario(inventarioDiarioEncontrado[0]);
                                        newInventarioDiario.cantidad = newInventarioDiario.cantidad + req.body.cantidad;
                                    } else {

                                        newInventarioDiario = new InventarioDiario({
                                            producto: req.body.producto,
                                            cantidad: (inventarioDiarioEncontrado[0].cantidad + req.body.cantidad),
                                            fecha: date
                                        });
                                    }
                                } else {

                                    newInventarioDiario = new InventarioDiario({
                                        producto: req.body.producto,
                                        cantidad: req.body.cantidad,
                                        fecha: date
                                    });
                                }
                                
                                return newInventarioDiario.save({
                                    session: session
                                });
                            }).
                            then(() => session.commitTransaction()).
                            then(() => session.endSession()).
                            then(() => res.status(201).send()).
                            catch(err => {
                                
                                console.log("Error al crear inventario: ", err);
                                session.abortTransaction();
                                res.status(500).send({
                                    codigo: "50001",
                                    message: 'Error al crear inventario'
                                });
                            });
                        })
                        .catch(err => {
                            console.log("Error al crear inventario: ", err);

                            if (err.name === 'InventarioException') {

                                res.status(400).send({
                                    codigo: err.code,
                                    message: err.message
                                });
                            } else {

                                res.status(500).send({
                                    codigo: "50002",
                                    message: 'Error al crear inventario'
                                });
                            }
                        });
                } else {
                    res.status(400).send({
                        codigo: "40001",
                        message: 'Error al crear inventario'
                    });
                }
            })
            .catch(err => {
                res.status(404).send({
                    codigo: "50003",
                    message: 'Error al crear inventario'
                });
            });
    }
}

var dateEquality = (date1, date2) => {
    return (date1.getFullYear() === date2.getFullYear()) &&
        (date1.getMonth() === date2.getMonth()) &&
        (date1.getDate() === date2.getDate());
}

function InventarioException(message, code) {
   this.message = message;
   this.code = code;
   this.name = 'InventarioException';
}

module.exports = InventarioController;