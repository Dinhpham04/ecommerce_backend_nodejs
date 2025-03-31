'use strict';

const { SuccessResponse } = require("../core/success.response");
const { createResource } = require("../services/rbac.service");
/**
 * @description Create a new resource
 * @param {string} name 
 * @param {string} slug 
 * @param {string} description 
 */
const newRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'Created new Role',
        metadata: await createResource(req.body)
    }).send(res);
}

module.exports = {
    newRole
}