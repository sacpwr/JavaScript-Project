var express = require('express');
var router = express.Router();
let User = require('../models/user');
const mongoose = require('mongoose');
let FUNC = require('../utils/functions');
    
router.post('/login', async function (req, res, next) {
    try {

        let request = req.body;
        let username = request.username;
        let password = request.password;

        /* encode password */
        let encodedPassword = FUNC.encodedPassword(password);

        let user = await User.findOne({
            "username": username,
            "password": encodedPassword
        });

        if (user) {

            /* generate auth token */
            let token = FUNC.generateToken(user);

            /* response */
            res.status(200).json({
                succes: true,
                message: "Login SuccessFully",
                token: token
            })
        } else {
            throw { msg: "Invalid Credentials" };
        }

    } catch (err) {
        /* response */
        res.status(200).json({
            succes: false,
            message: err.msg == undefined ? "Something Went Wrong" : err.msg
        })
    }
})

module.exports = router;