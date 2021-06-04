const jwt = require('jsonwebtoken');

const decodeJWT = (token, saltKey, publicKey) => {
    const decoded = jwt.verify(token, saltKey + publicKey, (err, decoded) => {
        if ( err ) {
            console.log(err);
            decoded = false;
            return decoded;
        } else {
            decoded = true;
            return decoded;
        }
    });
    return decoded;
};

module.exports = decodeJWT;