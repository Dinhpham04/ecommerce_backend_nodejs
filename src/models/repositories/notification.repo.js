const notification = require('../notification.model')

const createNotification = async (
    { type, content, senderId, receivedId, options }
) => {
    return await notification.create({
        noti_type: type,
        noti_content: content,
        noti_senderId: senderId,
        noti_receivedId: receivedId,
        noti_options: options,
    })
}

const getNotification = async ({ match = {} }) => {
    return await notification.aggregate([
        {
            $match: match
        },
        {
            $project: {
                noti_type: 1,
                noti_content: {
                    $concat: [
                        {
                            $substr: ['$noti_options.shop_name', 0, -1]
                        },
                        ' vừa thêm một sản phẩm mới: ',
                        {
                            $substr: ['$noti_options.product_name', 0, -1]
                        }
                    ]
                },
                noti_senderId: 1,
                noti_receivedId: 1,
                noti_options: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])
}

module.exports = {
    createNotification,
    getNotification
}