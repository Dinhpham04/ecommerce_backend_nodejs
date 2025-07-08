'use strict';

const express = require('express');
const router = express.Router();
const { pushToLogDiscord } = require('../middlewares/index')

// add log to discord 
router.use(pushToLogDiscord)

// Public routes (no authentication required)
router.use('/v1/api/test', require('./test'))

// JWT Authentication routes
// Protected routes (will use JWT authentication middleware)
router.use('/v1/api/auth', require('./access'))
// router.use('/v1/api/auth/oauth2', require('./oauth2'))
router.use('/v1/api/user', require('./user'))
router.use('/v1/api/email', require('./email'))
router.use('/v1/api/rbac', require('./rbac'))
router.use('/v1/api/upload', require('./upload'))
router.use('/v1/api/notify', require('./notify'))
router.use('v1/api/inventory', require('./inventory'))
router.use('/v1/api/checkout', require('./checkout'))
router.use('/v1/api/cart', require('./cart'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api/comment', require('./comment'))

module.exports = router