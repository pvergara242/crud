const jwt = require('jsonwebtoken');
const auth = {};

auth.secret = process.env.AUTH_KEY || 'secret';

auth.authorize = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).end();
    }

    var payload;
    try {
        payload = jwt.verify(token, auth.secret);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return res.status(401).end();
        }
        return res.status(400).end();
    }
    return next();
}

auth.refresh = (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).end();
    }

    var payload;
    try {
        payload = jwt.verify(token, jwtKey);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return res.status(401).end();
        }
        return res.status(400).end();
    }

    const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
    if (payload.exp - nowUnixSeconds > 60) {
        return res.status(204).end();
    }

    const newToken = jwt.sign({
        correo: payload.correo,
        id: payload.id
    }, auth.secret, {
        algorithm: "HS256",
        expiresIn: 60 * 60,
    });

    res.status(200).send({
        token: newToken
    });
}

auth.generateToken = async function(user) {
    return jwt.sign({
        correo: user.correo,
        id: user._id
    }, auth.secret, {
        algorithm: "HS256",
        expiresIn: 60 * 60,
    });
}

auth.parseToken = (authorization) => {
    const token = authorization;

    if (!token) {
        return null;
    }

    var payload;
    try {
        payload = jwt.verify(token, auth.secret);
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return null;
        }
        return null;
    }

    const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
    if (payload.exp - nowUnixSeconds < 60) {
        return null;
    }

    return payload;
}

module.exports = auth;