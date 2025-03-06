'use strict';

const { NotFoundError } = require("../core/error.response");
const { createNewComment,
    getMaxRightValueComment,
    findCommentById,
    updateManyComments,
    findAllChildrentComments,
    findRootComments,
    deleteManyComments
} = require("../models/repositories/comment.repo");
const { getProductById } = require("../models/repositories/product.repo");

/* 
    key features: comment service 
    + add comment [User Shop]
    + get a list of comments [User Shop]
    + delete a comment [User Shop Admin]
*/
class CommentService {

    // create a comment 
    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        const comment = await createNewComment({
            productId, userId, content, parentCommentId
        })
        let rightValue
        if (parentCommentId) {
            const parentComment = await findCommentById({ commentId: parentCommentId })
            if (!parentComment) throw new NotFoundError('parent comment not found')

            rightValue = parentComment.comment_right
            await updateManyComments({ productId, rightValue, leftValue: rightValue, value: 2 })
        } else {

            const maxRightValue = await getMaxRightValueComment({ productId })
            if (maxRightValue) {
                rightValue = maxRightValue.comment_right + 1
            } else {
                rightValue = 1
            }
        }


        //insert to comment
        comment.comment_left = rightValue
        comment.comment_right = rightValue + 1
        await comment.save();
        return comment
    }

    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0
    }) {
        if (parentCommentId) { // truy cập con 
            const parentComment = await findCommentById({ commentId: parentCommentId })
            if (!parentComment) throw new NotFoundError('parent comment not found')
            const commentLeft = parentComment.comment_left, commentRight = parentComment.comment_right
            const comments = await findAllChildrentComments({ productId, commentLeft, commentRight, limit, offset })
            return comments
        } else {
            return await findRootComments({ productId, limit, offset })
        }
    }

    static async deleteComment({ commentId, productId }) {
        // check the product exits in the database 
        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError('product not found')
        // 1. xac dinh gia tri left, right cua comment 
        const comment = await findCommentById({ commentId })
        if (!comment) throw new NotFoundError('comment not found')

        const rightValue = comment.comment_right
        const leftValue = comment.comment_left
        // 2.tinh width
        const width = rightValue - leftValue + 1
        // 3. xoa tat ca commentId con 
        await deleteManyComments({ productId, leftValue, rightValue })
        await updateManyComments({ productId, rightValue, leftValue, value: -width })
        return true
    }
}

module.exports = CommentService