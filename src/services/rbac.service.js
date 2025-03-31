'use strict';
const RESOURCE = require('../models/resource.model')
const ROLE = require('../models/role.model')
/**
 * new resource
 * @param {string} name // ten resource
 * @param {string} slug 
 * @param {string} description
 */
const createResource = async ({ name = 'profile', slug = 'p00001', description = '' }) => {
    // 1. check name or slug exists

    // 2. create resource 
    const resource = await RESOURCE.create({
        src_name: name,
        src_slug: slug,
        src_description: description
    })

    return resource;
}

const resourceList = async ({
    userId = 0, // admin
    limit = 30,
    offset = 0,
    search = '',
}) => {
    // 1. check admin ? middle function

    // 2. get list of resources 
    const resources = await RESOURCE.aggregate([
        {
            $project: {
                _id: 0,
                name: '$src_name',
                slug: '$src_slug',
                description: '$src_description',
                resourceId: '$_id',
                createdAt: 1
            }
        }
    ])
    return resources;
}

const createRole = async ({
    name = 'shop',
    slug = 's00001',
    description = 'extend from shop or user',
    grants = []
}) => {
    // 1. check role exit 

    // 2. create new role 
    const role = await ROLE.create({
        rol_name: name,
        role_slug: slug,
        role_description: description,
        role_grants: grants
    })

    return role
}

const roleList = async ({
    userId = 0, // admin
    limit = 30,
    offset = 0,
    search = '',
}) => {

}

module.exports = {
    createResource,
    resourceList,
    createRole,
    roleList,
}