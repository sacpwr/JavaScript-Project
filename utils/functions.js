let CONSTANTS = require('./constant');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

let encodedPassword = (password) => {
    const cipher = crypto.createCipher(CONSTANTS.CIPHER_ALGO_NAME, CONSTANTS.CIPHER_PASSWORD);
    var encrypted = cipher.update(password, CONSTANTS.CIPHER_INPUT_ENCODING, CONSTANTS.CIPHER_OUTPUT_ENCODING);
    encrypted += cipher.final(CONSTANTS.CIPHER_OUTPUT_ENCODING);
    return encrypted;
}

let decodedPassword = (password) => {
    const decipher = crypto.createDecipher(CONSTANTS.CIPHER_ALGO_NAME, CONSTANTS.CIPHER_PASSWORD);
    var decrypted = decipher.update(password, CONSTANTS.CIPHER_OUTPUT_ENCODING, CONSTANTS.CIPHER_INPUT_ENCODING);
    decrypted += decipher.final(CONSTANTS.CIPHER_INPUT_ENCODING);
    console.log(decrypted);
    return encrypted;
}

let verifyToken = (token) => {
    return jwt.verify(token, CONSTANTS.JWT_SECRET, function (err, decoded) {
        if (err) {
            throw (err);
        } else {
            return (decoded);
        }
    });
}

let generateToken = (body) => {
    var token = jwt.sign({
        // exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        data: {
            access: true,
            info: body
        }
    }, CONSTANTS.JWT_SECRET);
    return token;
};

let authChecker = (req, res, next) => {
    if (req.path == "/login") {
        next();
    } else {

        /**
         *validate token before entering routes
         *here token come from three  ways :
         *1.if post method :- req.body.token
         *2.if get method :- req.query.token
         *3.if token come from header with specific key :- req.headers['x_access_token'] 
         */
        var token = req.body.token || req.query.token || req.headers['x_access_token'];

        // decode token
        //if token have any value then it go for check token verification process
        //otherwise else and response with 401:'No token provided.'
        if (token) {

            let decoded = this.verifyToken(token)
            let user = decoded.data.info;

            let reqUrl = req.originalUrl;

            let adminAllowedUrls = [
                '/category/insert',
                '/category/update',
                '/category/delete',
                '/category/get-category-details',
                '/category/fetch-categories',
                '/category/fetch-sub-categories',
                '/category/fetch-all-categories',
                // '/product/insert',
                // '/product/update',
                // '/product/delete',
                '/product/get-product-details',
                '/product/fetch-products',
                '/product/fetch-product-by-category',
                '/user/insert',
                '/user/update',
                '/user/delete',
                '/user/get-user-details',
                '/user/fetch-users'
            ];
            let supervisorAllowedUrls = [
                '/category/insert',
                '/category/update',
                '/category/delete',
                '/category/get-category-details',
                '/category/fetch-categories',
                '/category/fetch-sub-categories',
                '/category/fetch-all-categories',
                '/product/insert',
                '/product/update',
                '/product/delete',
                '/product/get-product-details',
                '/product/fetch-products',
                '/product/fetch-product-by-category',
                // '/user/insert',
                // '/user/update',
                // '/user/delete',
                // '/user/get-user-details',
                // '/user/fetch-users'
            ];

            if (user.role == CONSTANTS.ADMIN) {
                req.body.userRole = CONSTANTS.ADMIN;

                checkArray = adminAllowedUrls;

            } else if (user.role == CONSTANTS.SUPERVISOR) {
                req.body.userRole = CONSTANTS.SUPERVISOR;

                checkArray = supervisorAllowedUrls;
            }

            let url = checkArray.find(function (val, index) {
                return reqUrl.indexOf(val) != -1;
            });
            if (url) {
                next()
            } else {
                res.status(401).send({
                    success: false,
                    msg: 'This url is not accessible'
                });
            }

        } else {

            // if there is no token
            // return an error
            //FUNC.InfoLogger("No Token Provided");
            res.status(401).send({
                success: false,
                msg: 'No token provided.'
            });

        }
    }
}

exports.encodedPassword = encodedPassword;
exports.decodedPassword = decodedPassword;
exports.verifyToken = verifyToken;
exports.generateToken = generateToken;
exports.authChecker = authChecker;