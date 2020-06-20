const {
    validationResult
} = require('express-validator');
const errorValidation = {};

errorValidation.validateRequest = (req) => {
    const result = [];
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const map = new Map();
        for (const item of errors.array()) {
            if (!map.has(item.msg)) {
                map.set(item.msg, true);
                result.push({
                    codigo: item.msg,
                    message: 'Parámetro inválido'
                });
            }
        }
    }

    return result;
}

module.exports = errorValidation;