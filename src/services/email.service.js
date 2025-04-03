'use strict';
const { randomInt } = require('crypto');
const { newOtp } = require('./otp.service');
const { getTemplate } = require('./template.service');

const sendEmailLinkVerify = () => {

}
const sendEmailToken = async (
    email = null
) => {
    // 1. get token 
    const token = await newOtp({ email })
    // 2. get email template 
    const template = await getTemplate({
        tem_name: 'HTML EMAIL TOKEN',
    })

    // 3. send email 
}

module.exports = {
    sendEmailToken
}