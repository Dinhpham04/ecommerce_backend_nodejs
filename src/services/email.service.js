'use strict';
const { newOtp } = require('./otp.service');
const { getTemplate } = require('./template.service');
const transport = require('../dbs/init.nodemailer')
const { NotFoundError } = require('../core/error.response');
const { replacePlaceholder } = require('../utils');

const sendEmailLinkVerify = ({
    html,
    toEmail,
    subject = 'Xác nhận email đăng ký',
    text = 'Xác nhận'
}) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER || `<shopdev.dinhpham@gmail.com>`,
            to: toEmail,
            subject,
            text,
            html
        }
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error)
            }

            console.log('Message sent::', info.messageId)
        })
    } catch (error) {
        console.error(`error send email,`, error)
        return error;
    }
}
const sendEmailToken = async (
    email = null
) => {
    try {
        // 1. get token 
        const token = await newOtp({ email })
        // 2. get email template 
        const template = await getTemplate({
            tem_name: 'HTML EMAIL TOKEN',
        })

        if (!template) {
            throw new NotFoundError('template not found')
        }

        // 3. replace placeholder
        const content = replacePlaceholder(
            template.tem_html,
            {

            }
        )
        // 4. send email 
        sendEmailLinkVerify({
            html,
            toEmail: email,
            subject: 'Vui lòng xác nhận địa chỉ email đăng ký'
        })
    } catch (error) {

    }
}

module.exports = {
    sendEmailToken
}