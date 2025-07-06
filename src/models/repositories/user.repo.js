'use strict';

const USER = require('../user.model')

const findUserByEmail = async ({ email, select = null }) => {
    const query = USER.findOne({ email });
    if (select) {
        query.select(select);
    }
    return await query.lean();
}

const findUserById = async (userId) => {
    return await USER.findById(userId).lean()
}

const findUser = async (query, select = null) => {
    const userQuery = USER.findOne(query);
    if (select) {
        userQuery.select(select);
    }
    return userQuery.lean();
}

const createNewUser = async ({
    user_id,
    user_name,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    password,
    gender,
    date_of_birth,
    avatar,
    role = 'customer',
    status = 'pending'
}) => {
    return await USER.create({
        user_id,
        user_name,
        full_name,
        first_name,
        last_name,
        email,
        phone,
        password,
        gender,
        date_of_birth,
        avatar,
        role,
        status
    })
}

const updateUserById = async (userId, updateData) => {
    return await USER.findByIdAndUpdate(userId, updateData, { new: true }).lean()
}

module.exports = {
    findUserByEmail,
    findUserById,
    createNewUser,
    updateUserById,
    findUser
}