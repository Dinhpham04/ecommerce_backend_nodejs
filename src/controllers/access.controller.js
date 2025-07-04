'use strict';

const AccessService = require("../services/access.service");
const { OK, CREATED, SuccessResponse } = require('../core/success.response');
const { NotFoundError } = require("../core/error.response");

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'get tokens success!',
        //     metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
        // }).send(res); 

        //v2 fixed, no need access token 
        new SuccessResponse({
            message: 'get tokens success!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
            }),
        }).send(res);
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout successfully!',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    }

    login = async (req, res, next) => {
        const { email } = req.body
        if (!email) {
            throw new NotFoundError('email not found!')
        }
        new SuccessResponse({
            message: 'Login successfully!',
            metadata: await AccessService.login(req.body),
        }).send(res);
    }

    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Registered OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    }
}

module.exports = new AccessController(); 