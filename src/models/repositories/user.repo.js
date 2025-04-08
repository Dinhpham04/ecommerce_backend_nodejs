'use strict';

const USER = require('../user.model')

const findUserByEmail = async ({ email }) => {
    return await USER.findOne({ usr_email: email }).lean()
}

const createNewUser = async ({
    usrId,
    usrSlug,
    usrName,
    usrPassword,
    usrSalt,
    usrEmail,
    usrPhone,
    usrSex,
    usrAvatar,
    usrDateOfBirth,
    usrRole,
    usrStatus
}) => {
    return await USER.create({
        usr_id: usrId,
        usr_slug: usrSlug,
        usr_name: usrName,
        usr_password: usrPassword,
        usr_salt: usrSalt,
        usr_email: usrEmail,
        usr_phone: usrPhone,
        usr_sex: usrSex,
        usr_avatar: usrAvatar,
        usr_date_of_birth: usrDateOfBirth,
        usr_role: usrRole,
        usr_status: usrStatus
    })
}

module.exports = {
    findUserByEmail,
    createNewUser
}