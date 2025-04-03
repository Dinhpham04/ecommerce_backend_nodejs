'use strict';

const TEMPLATE = require('../models/template.model')

const newTemplate = async ({
    tem_name,
    tem_html
}) => {
    // 1. check if template is existing

    // 2. create a new template 

    const newTem = await TEMPLATE.create({
        tem_name, // unique
        tem_html
    })

    return newTem
}

const getTemplate = async ({
    tem_name
}) => {
    const template = await TEMPLATE.findOne({ tem_name })
}

module.exports = {
    newTemplate,
    getTemplate
}