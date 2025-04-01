'use strict';

const express = require('express');
const router = express.Router();
const { apiKey, permission } = require('../auth/checkAuth');
const { pushToLogDiscord } = require('../middlewares/index')
// add log to discord 
router.use(pushToLogDiscord)
router.use('/v1/api/test', require('./test'))
// check apiKey 
router.use(apiKey)
// check permission
router.use(permission('0000'))

// routers
router.use('/v1/api/rbac', require('./rbac'))
router.use('/v1/api/upload', require('./upload'))
router.use('/v1/api/notify', require('./notify'))
router.use('v1/api/inventory', require('./inventory'))
router.use('/v1/api/checkout', require('./checkout'))
router.use('/v1/api/cart', require('./cart'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api/comment', require('./comment'))
router.use('/v1/api', require('./access'))

module.exports = router