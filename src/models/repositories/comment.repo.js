'use strict';

const Comment = require('../comment.model')

const createNewComment = async ({
    productId, userId, content, parentCommentId = null
}) => {
    return await Comment.create({
        comment_productId: productId,
        comment_userId: userId,
        comment_content: content,
        comment_parentId: parentCommentId,
    })
}

const getMaxRightValueComment = async ({ productId }) => {
    return await Comment.findOne({
        comment_productId: productId,
    }, 'comment_right')
        .sort({ comment_right: -1 })
        .limit(1)
}

const findCommentById = async ({ commentId }) => {
    return await Comment.findById(commentId)
}

const updateManyComments = async ({ productId, rightValue, leftValue, value }) => {
    await Comment.updateMany({
        comment_productId: productId,
        comment_right: { $gte: rightValue }
    }, {
        $inc: { comment_right: value }
    })

    await Comment.updateMany({
        comment_productId: productId,
        comment_left: { $gt: leftValue }
    }, {
        $inc: { comment_left: value }
    })
}

const findAllChildrentComments = async ({ productId, commentLeft, commentRight, limit = 50, offset = 0 }) => {
    return await Comment.find({
        comment_productId: productId,
        comment_left: { $gte: commentLeft },
        comment_right: { $lte: commentRight }
    })
        .select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1,
            comment_userId: 1
        })
        .sort({ comment_left: 1 })
        .limit(limit)
        .skip(offset)
}

const findRootComments = async ({ productId, limit = 50, offset = 0 }) => {
    return await Comment.find({
        comment_productId: productId,
        comment_parentId: null
    })
        .select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1,
            comment_userId: 1
        })
        .sort({ comment_left: 1 })
        .limit(limit)
        .skip(offset)
}

const deleteManyComments = async ({ productId, leftValue, rightValue }) => {
    await Comment.deleteMany({
        comment_productId: productId,
        comment_left: { $gte: leftValue },
        comment_right: { $lte: rightValue }
        // comment_left: { $gte: leftValue, $lte: rightValue }
    })
}


module.exports = {
    createNewComment,
    getMaxRightValueComment,
    findCommentById,
    updateManyComments,
    findAllChildrentComments,
    findRootComments,
    deleteManyComments
}