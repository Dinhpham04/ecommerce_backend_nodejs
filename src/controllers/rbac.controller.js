'use strict';

const { SuccessResponse } = require("../core/success.response");
const {
    createResource,
    createRole,
    roleList,
    resourceList
} = require("../services/rbac.service");

/**
 * @description Create a new resource
 * @param {string} name 
 * @param {string} slug 
 * @param {string} description 
 */
const newRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'Created new Role',
        metadata: await createRole(req.body)
    }).send(res);
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const newResource = async (req, res, next) => {
    new SuccessResponse({
        message: 'Created new Resource',
        metadata: await createResource(req.body)
    }).send(res);
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const listRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'get list roles successfully',
        metadata: await roleList(req.body)
    }).send(res);
}

const listResource = async (req, res, next) => {
    new SuccessResponse({
        message: 'get list resource successfully',
        metadata: await resourceList(req.body)
    }).send(res);
}



module.exports = {
    newRole,
    newResource,
    listRole,
    listResource
}