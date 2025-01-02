'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();

// signUp 
router.post('/shop/signup', accessController.signUp)
router.get('/shop/getInfo', (req, res) => {
    res.status(200).json({
        code: '20001',
        metadata: { userId: 1 }
    })
})
module.exports = router