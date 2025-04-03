'use strict';
const { newOtp } = require('./otp.service');
const { getTemplate } = require('./template.service');
const transport = require('../dbs/init.nodemailer')
const { NotFoundError } = require('../core/error.response');
const { replacePlaceholder } = require('../utils');

const sendEmailLinkVerify = ({
    html,
    toEmail,
    subject = 'Vui lòng xác nhận địa chỉ email đăng ký',
    text = 'Xác nhận tài khoản này là của bạn'
}) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER || `<shopdev.dinhpham@gmail.com>`,
            to: toEmail,
            subject,
            text,
            html
        }
        const info = transport.sendMail(mailOptions, (error, info) => {
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
    { email = null }
) => {
    try {
        // 1. get token 
        const token = await newOtp({ email })
        if (!token) {
            throw new NotFoundError('token not found')
        }
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
                link_verify: `http://localhost:3052/cgp/welcome-back?token=${token.otp_token}`,
            }
        )
        //4. send email 
        sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui lòng xác nhận địa chỉ email đăng ký'
        })

        return 1
    } catch (error) {
        console.error(`error send email`, error)
        return error
    }
}

module.exports = {
    sendEmailToken
}