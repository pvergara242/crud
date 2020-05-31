const auth = {};

auth.secret = process.env.AUTH_KEY || 'secret';

module.exports = auth;