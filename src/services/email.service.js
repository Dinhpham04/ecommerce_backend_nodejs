'use strict';
const { createEmailVerification } = require('./verification.service');
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
    { email = null, target_id = null, target_type = 'user' }
) => {
    // 1. Create email verification record
    const verification = await createEmailVerification({ 
        email,
        target_id,
        target_type,
        expires_in_minutes: 5 
    });
    
    if (!verification) {
        throw new NotFoundError('Cannot create verification token')
    }
    
    // 2. Get email template 
    const template = await getTemplate({
        tem_name: 'HTML EMAIL TOKEN',
    })

    if (!template) {
        throw new NotFoundError('Email template not found')
    }

    // 3. Replace placeholder with verification link
    const content = replacePlaceholder(
        template.tem_html,
        {
            link_verify: `http://localhost:3052/v1/api/user/verify-email?token=${verification.verification_token}`,
            verification_code: verification.verification_code,
            expires_at: verification.expires_at.toLocaleString('vi-VN'),
        }
    )
    
    // 4. Send email 
    sendEmailLinkVerify({
        html: content,
        toEmail: email,
        subject: 'Vui lòng xác nhận địa chỉ email đăng ký'
    })

    return {
        verification_id: verification.verification_id,
        email: verification.email,
        expires_at: verification.expires_at
    };
}

module.exports = {
    sendEmailToken
}