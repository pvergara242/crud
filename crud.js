const express = require("express");
const crud = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
require("./models/database");
const UserController = require("./controller/UserController");
const ProveedorController = require("./controller/ProveedorController");
const ProductoController = require("./controller/ProductoController");
const InventarioController = require("./controller/InventarioController");
const auth = require("./configuration/auth");

crud.use(express.urlencoded({ extended: true }));
crud.use(express.json());
crud.use(cors());

crud.use('/api/v1/usuarios', auth.authorize);
crud.use('/api/v1/proveedores', auth.authorize);
crud.use('/api/v1/productos', auth.authorize);
crud.use('/api/v1/inventario', auth.authorize);

//Login
crud.post("/api/v1/auth/signin", UserController.validate('signIn'), UserController.signIn);

//crud usuarios 
crud.post("/api/v1/usuarios", UserController.validate('nuevoUsuario'), UserController.new);
crud.get("/api/v1/usuarios", UserController.all);
crud.get("/api/v1/usuarios/:Userid", UserController.find);
crud.put("/api/v1/usuarios/:Userid", UserController.validate('actualizarUsuario'), UserController.update);
crud.delete("/api/v1/usuarios/:Userid", UserController.delete);
crud.patch("/api/v1/usuarios/:Userid/activate", UserController.activate);

// Crud de proveedores
crud.post("/api/v1/proveedores", ProveedorController.validate('nuevoProveedor'), ProveedorController.new);
crud.get("/api/v1/proveedores", ProveedorController.all);
crud.get("/api/v1/proveedores/:Proveedoresid", ProveedorController.find);
crud.put("/api/v1/proveedores/:Proveedoresid", ProveedorController.validate('actualizarProveedor'), ProveedorController.update);
crud.delete("/api/v1/proveedores/:proveedorId", ProveedorController.delete);
crud.patch("/api/v1/proveedores/:Proveedoresid/activate", ProveedorController.activate);

// Crud de proveedores
crud.post("/api/v1/productos", ProductoController.validate('nuevoProducto'), ProductoController.new);
crud.get("/api/v1/productos", ProductoController.all);
crud.get("/api/v1/productos/:ProductoId", ProductoController.find);
crud.put("/api/v1/productos/:productoId", ProductoController.validate('actualizarProducto'), ProductoController.update);
crud.delete("/api/v1/productos/:productoId", ProductoController.delete);
crud.patch("/api/v1/productos/:productoId/activate", ProductoController.activate);

// Crud de inventario
crud.post("/api/v1/inventario", InventarioController.validate('createInventario'), InventarioController.new);

crud.listen(PORT, err => {
    if (err) {
        console.log(err)
    } else {
        console.log(`server running on port ${PORT}`);
    }
});