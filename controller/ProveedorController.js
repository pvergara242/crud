const Proveedores = require("../models/Proveedores");

let ProveedorController = {
	all: async (req, res) => {
		var params;

        if (req.query.includeInactive && req.query.includeInactive === 'true') {
            params = {};
        } else {
            params = { estado: "Activo" };
        }

        Proveedores.find(params)
            .then(result => {
                res.status(200).send(result);
            })
            .catch(err => {
                res.status(404).send(err);
            });
	},
	new: async (req, res) => {
		req.body.estado = "Activo";
        const newProveedores = new Proveedores(req.body);
        newProveedores.save((err, response) => {
            !err ? res.status(200).send(response) : res.status(400).send(err);
        });
	},
	find: async(req, res) => {
		Proveedores.findById(req.params.Proveedoresid, (err, response) => {
            !err ? res.status(200).send(response) : res.status(404).send(err);
        });
	},
	update: async(req, res) => {
		Proveedores.findByIdAndUpdate(req.params.Proveedoresid, { $set: req.body }, { new: false }, (err, response) => {
            !err ? res.status(204).send() : res.status(404).send(err);
        });
	},
	delete: async(req, res) => {
		Proveedores.findByIdAndUpdate(req.params.proveedorId, { $set: { estado: "Inactivo" } }, { new: false }, (err, response) => {
            !err ? res.status(204).send() : res.status(404).send(err);
        });
	},
	activate: async(req, res) => {
		Proveedores.findByIdAndUpdate(req.params.Proveedoresid, { $set: { estado: 'Activo' } }, { new: false }, (err, response) => {
            !err ? res.status(204).send(response) : res.status(404).send(err);
        });
	}
}

module.exports = ProveedorController;