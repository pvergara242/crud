const User = require("../models/User");
const DatosPersonales = require("../models/DatosPersonales");
const auth = require("../configuration/auth");
const jwt = require("jsonwebtoken");

let UserController = {
	all: async (req, res) => {
		var params;

	    if (req.query.includeInactive && req.query.includeInactive === 'true') {
	        params = {};
	    } else {
	        params = { estado: "Activo" };
	    }

		User.find(params).populate('datosPersonales')
		.then(result => {
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(404).send(err);
        });
	},
	new: async (req, res) => {
		findAndCreateDatosPersonales(req, res, funcCreateUsuario);
	},
	find: async (req, res) => {
		User.findById(req.params.Userid, (err, response) => {
	        !err ? res.status(200).send(response) : res.status(400).send(err);
	    }).populate('datosPersonales');
	},
	update: async (req, res) => {
		findAndUpdateDatosPersonales(req, res);
	},
	delete: async (req, res) => {
		User.findByIdAndUpdate(req.params.Userid, { $set: { estado: "Inactivo" } }, { new: false }, (err, response) => {
	        !err ? res.status(204).send() : res.status(400).send(err);
	    });
	},
	activate: async (req, res) => {
		User.findByIdAndUpdate(req.params.Userid, { $set: { estado: 'Activo' } }, { new: false }, (err, response) => {
	        !err ? res.status(204).send(response) : res.status(400).send(err);
	    });
	},
	signIn: async (req, res) => {
		var params = { 
			estado: "Activo",
			correo: req.body.correo
		};

		User.findOne(params).populate('datosPersonales')
			.then(result => {
				if (result && result !== null) {
					result.comparePassword(req.body.pwd, (err, matches) => {
						if (!err && err !== null) {
							console.log(err);
							res.status(500).send({ message: 'Error autenticando usuario' }); 
						} else if (matches) {
							generateToken(result)
								.then(token => {
									res.status(200).send(
										{ 
											token: token,
											usuario: {
												nombres: result.datosPersonales.nombres,
												apellidos: result.datosPersonales.apellidos,
												nombreCompleto: result.datosPersonales.nombreCompleto,
												rol: result.rol
											}
										}
									);
								})
								.catch(onRejected => {
									console.log(err);
				            		res.status(500).send(err);
								});
						} else {
							res.status(401).send({ message: 'Unauthorized' });
						}
					})
				} else {
					res.status(401).send({ message: 'Unauthorized' });
				}
	        })
	        .catch(err => {
	        	console.log(err);
	            res.status(500).send(err);
	        });
	}
}

async function generateToken(user) {
	return jwt.sign({ correo: user.correo }, auth.secret, {
		algorithm: "HS256",
		expiresIn: 60 * 60,
	});
}

function funcCreateUsuario (req, res, datosPersonalId) {
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
            res.status(200).send(result);
        })
        .catch(err => {
            res.status(400).send(err);
        });
}

var actualizarUsuario = function funcActualizarUsuario (req, res, datosPersonalId) {
    const usuario = {
    clave: req.body.clave,
    rol: req.body.rol,
    estado: req.body.estado,
    correo: req.body.correo,
    datosPersonales: datosPersonalId
    };
    
    const newUser = new User(usuario);
    User.findByIdAndUpdate(req.params.Userid, { $set: usuario }, { new: false }, (err, response) => {
        !err ? res.status(204).send() : res.status(400).send(err);
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

    DatosPersonales.find({ numeroDocumento: req.body.numeroDocumento })
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
	            res.status(500).send(err);
	        });
        }
    })
    .catch(err => {
        res.status(400).send(err);
    });
}

function findAndUpdateDatosPersonales(req, res) {
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

    DatosPersonales.findOne({ numeroDocumento: req.body.numeroDocumento, tipoDocumento: req.body.tipoDocumento })
    .then(datoPersonalExistente => {
    	var datosPersonalId;
        if (datoPersonalExistente && datoPersonalExistente !== null) {
            datosPersonalId = datoPersonalExistente._id;
            console.log('datosPersonalId: ', datosPersonalId);
            console.log('datoPersonalExistente: ', datoPersonalExistente);

            DatosPersonales.findByIdAndUpdate(datosPersonalId, { $set: datoPersonal }, { new: false })
            .then(datoPersonalActualizado => {
            	actualizarUsuario(req, res, datosPersonalId);
	        })
	        .catch(err => {
	        	console.log(err);
	            res.status(500).send('Error actualizando usuario');
	        });
        } else {
        	const newDatoPersonal = new DatosPersonales(datoPersonal);
            newDatoPersonal.save()
            .then(datoPersonalCreado => {
	            datosPersonalId = datoPersonalCreado._id;
            	actualizarUsuario(req, res, datosPersonalId);
	        })
	        .catch(err => {
	            res.status(500).send(err);
	        });
        }
    })
    .catch(err => {
        res.status(400).send(err);
    });
}

module.exports = UserController;