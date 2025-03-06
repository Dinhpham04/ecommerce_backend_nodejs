'use strict';

const { createNotification, getNotification } = require("../models/repositories/notification.repo");

const pushNotiToSystem = async ({
    type = 'SHOP-001',
    receivedId = 1,
    senderId = 1,
    options = {}
}) => {
    let noti_content

    if (type === 'SHOP-001') {
        noti_content = `@@@ vừa mới thêm một sản phầm @@@@`
    } else if (type === 'PROMOTION-001') {
        noti_content = `@@@ vừa mới thêm một chương trình khuyến mãi @@@@`
    }

    await createNotification({
        type,
        content: noti_content,
        senderId,
        receivedId,
        options
    })
}

const listNotiByUser = async ({
    userId = 0,
    type = 'ALL',
    isRead = 0
}) => {
    userId = parseInt(userId)
    const match = { noti_receivedId: userId }
    if (type !== 'ALL') {
        match['noti_type'] = type
    }
    return await getNotification({ match })
}


module.exports = {
    pushNotiToSystem,
    listNotiByUser
}