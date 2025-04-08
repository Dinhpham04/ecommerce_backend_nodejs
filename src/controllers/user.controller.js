'use strict';

const { SuccessResponse } = require("../core/success.response");
const { sendEmailVerify, checkLoginEmailTokenService } = require("../services/user.service");

class UserController {

    // new user
    sendEmailVerifyToUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'please check your email to verify your account',
            metadata: await sendEmailVerify(req.body)
        }).send(res)
    }

    // check user token via Email
    checkLoginEmailToken = async (req, res, next) => {
        const { token = null } = req.query
        new SuccessResponse({
            message: 'check login email token success, your account is created',
            metadata: await checkLoginEmailTokenService({ token })
        }).send(res)
    }

}

module.exports = new UserController();