const express = require("express");
const crud = express();
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const { User, Proveedores, Productos } = require("./models/index")

crud.use(express.urlencoded({ extended: true }));
crud.use(express.json());
crud.use(cors());

//crud usuarios 
crud.post("/api/v1/create/User", (req, res) => {
    req.body.is_active = true;
    const newUser = new User(req.body);
    newUser.save((err, user) => {
        !err ? res.status(200).send(user) : res.status(400).send(err);
    });
});

crud.get("/api/v1/get/Users", (req, res) => {
    User.find({ is_active: true })
        .then(result => {
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

crud.get("/api/v1/get/User/:Userid", (req, res) => {
    User.findById(req.params.Userid, (err, response) => {
        !err ? res.status(200).send(response) : res.status(400).send(err);
    });
});

crud.put("/api/v1/update/User/:Userid", (req, res) => {
    User.findByIdAndUpdate(req.params.Userid, { $set: req.body }, { new: true }, (err, response) => {
        !err ? res.status(200).send(response) : res.status(400).send(err);
    });
});

crud.delete("/api/v1/delete/User/:Userid", (req, res) => {
    User.findByIdAndUpdate(req.params.Userid, { $set: { is_active: false } }, { new: true }, (err, response) => {
        !err ? res.status(200).send({ message: "usuario eliminado" }) : res.status(400).send(err);
    });
});

crud.patch("/api/v1/activate/User/:Userid", (req, res) => {
    User.findByIdAndUpdate(req.params.Userid, { $set: { is_active: true } }, { new: true }, (err, response) => {
        !err ? res.status(200).send(response) : res.status(400).send(err);
    });
});

// Crud de proveedores
crud.post("/api/v1/proveedores", (req, res) => {
    req.body.estado = "Activo";
    const newProveedores = new Proveedores(req.body);
    newProveedores.save((err, response) => {
        !err ? res.status(200).send(response) : res.status(400).send(err);
    });
});

crud.get("/api/v1/proveedores", (req, res) => {
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
});

crud.get("/api/v1/proveedores/:Proveedoresid", (req, res) => {
    Proveedores.findById(req.params.Proveedoresid, (err, response) => {
        !err ? res.status(200).send(response) : res.status(404).send(err);
    });
});

crud.put("/api/v1/proveedores/:Proveedoresid", (req, res) => {
    Proveedores.findByIdAndUpdate(req.params.Proveedoresid, { $set: req.body }, { new: true }, (err, response) => {
        !err ? res.status(204).send() : res.status(404).send(err);
    });
});

crud.delete("/api/v1/proveedores/:proveedorId", (req, res) => {
    Proveedores.findByIdAndUpdate(req.params.proveedorId, { $set: { estado: "Inactivo" } }, { new: true }, (err, response) => {
        !err ? res.status(204).send() : res.status(404).send(err);
    });
});

crud.patch("/api/v1/activate/Proveedores/:Proveedoresid", (req, res) => {
    Proveedores.findByIdAndUpdate(req.params.Proveedoresid, { $set: { is_active: true } }, { new: true }, (err, response) => {
        !err ? res.status(200).send(response) : res.status(404).send(err);
    });
});

// Crud de proveedores
crud.post("/api/v1/productos", (req, res) => {
    req.body.estado = "Activo";
    const newProducto = new Productos(req.body);
    newProducto.save((err, response) => {
        !err ? res.status(200).send(response) : res.status(400).send(err);
    });
});

crud.get("/api/v1/productos", (req, res) => {
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
});

crud.get("/api/v1/productos/:ProductoId", (req, res) => {
    Productos.findById(req.params.ProductoId, (err, response) => {
        !err ? res.status(200).send(response) : res.status(404).send(err);
    }).populate('proveedor');
});

crud.put("/api/v1/productos/:productoId", (req, res) => {
    Productos.findByIdAndUpdate(req.params.productoId, { $set: req.body }, { new: true }, (err, response) => {
        !err ? res.status(204).send() : res.status(404).send(err);
    });
});

crud.delete("/api/v1/productos/:productoId", (req, res) => {
    Productos.findByIdAndUpdate(req.params.productoId, { $set: { estado: "Inactivo" } }, { new: true }, (err, response) => {
        !err ? res.status(204).send() : res.status(404).send(err);
    });
});

crud.listen(PORT, err => {
    if (err) {
        console.log(err)
    } else {
        console.log(`server running on port${PORT}`);
    }
});