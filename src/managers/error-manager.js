const errorCodes = require('../constants/error-codes');

const generateErrorResponse = (errorCode) => {
    if(!errorCodes[errorCode]) {
        return errorCodes['INTERNAL_SERVER_ERROR'];
    }

    return errorCodes[errorCode];
};

module.exports = {
    generateErrorResponse
}
