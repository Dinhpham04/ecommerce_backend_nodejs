'use strict';

const { SuccessResponse } = require("../core/success.response");
const { createComment, getCommentsByParentId, deleteComment } = require("../services/comment.service");

class CommentController {
    // create a comment 
    addNewComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await createComment(req.body)
        }).send(res);
    }

    // get all children comments by parentId 
    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get all children comments successfully',
            metadata: await getCommentsByParentId(req.query)
        }).send(res);
    }

    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'delete comment successfully',
            metadata: await deleteComment(req.body)
        }).send(res);
    }
}

module.exports = new CommentController()