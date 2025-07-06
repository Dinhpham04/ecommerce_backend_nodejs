'use strict';
const {
    findUserByEmail,
} = require('../models/repositories/user.repo')
const { ConflictRequestError, NotFoundError, BadRequestError, AuthFailureError } = require('../core/error.response');
const { sendEmailToken } = require('./email.service');


module.exports = {
    userSignUp,
    verifyUserEmail,
    loginUser,
    resendEmailVerification
}