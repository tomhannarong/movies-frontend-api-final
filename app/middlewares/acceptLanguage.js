const acceptLanguage = async (req, res, next) => {
    const lang = req.headers['accept-language'];
    if ( lang == 'EN' || lang == 'En' || lang == 'en' || lang == 'eN' ) {
        req.dataPrivate.lang = '_en';
    } else {
        req.dataPrivate.lang = '';
    }
    next();
};

module.exports = {
    acceptLanguage
};