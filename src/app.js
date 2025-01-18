
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
const app = express();

// init middleware 
app.use(morgan("dev"));
app.use(helmet());
app.use(compression()); // giảm dung lượng vận chuyển
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// init db 
require('./dbs/init.mongodb')
const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad(); // check over load 
// init router
app.use('', require('../src/routers'))

// handling error 

app.use((req, res, next) => { // middleware
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => { // hàm quản lý lỗi 
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        // stack: error.stack,
        message: error.message || `Internal Server Error`
    })
})


module.exports = app