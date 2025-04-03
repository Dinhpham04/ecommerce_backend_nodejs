'use strict';

const { SuccessResponse } = require("../core/success.response");
const { newUser } = require("../services/user.service");

class UserController {

    // new user
    newUserAccount = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new user successfully',
            metadata: await newUser(req.body)
        }).send(res)
    }

    // check user token via Email
    checkRegisterEmailToken = async () => {

    }

}

module.exports = new UserController();