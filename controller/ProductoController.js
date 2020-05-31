const Productos = require("../models/Productos");

let ProductoController = {
	all: async (req, res) => {
		var params;

        if (req.query.includeInactive && req.query.includeInactive === 'true') {
            params = {};
        } else {
            params = { estado: "Activo" };
        }

        Productos.find(params).populate('proveedor')
            .then(result => {
                res.status(200).send(result);
            })
            .catch(err => {
                res.status(404).send(err);
            });
	},
	new: async (req, res) => {
		req.body.estado = "Activo";
        const newProducto = new Productos(req.body);
        newProducto.save((err, response) => {
            !err ? res.status(200).send(response) : res.status(400).send(err);
        });
	},
	find: async(req, res) => {
		Productos.findById(req.params.ProductoId, (err, response) => {
            !err ? res.status(200).send(response) : res.status(404).send(err);
        }).populate('proveedor');
	},
	update: async(req, res) => {
    	Productos.findByIdAndUpdate(req.params.productoId, { $set: req.body }, { new: false }, (err, response) => {
            !err ? res.status(204).send() : res.status(404).send(err);
        });
	},
	delete: async(req, res) => {
	    Productos.findByIdAndUpdate(req.params.productoId, { $set: { estado: "Inactivo" } }, { new: false }, (err, response) => {
            !err ? res.status(204).send() : res.status(404).send(err);
        });
	},
	activate: async(req, res) => {
		Productos.findByIdAndUpdate(req.params.productoId, { $set: { estado: 'Activo' } }, { new: false }, (err, response) => {
            !err ? res.status(204).send(response) : res.status(404).send(err);
        });
	}
}

module.exports = ProductoController;