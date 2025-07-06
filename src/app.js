
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');
const app = express();
const { v4: uuidv4 } = require('uuid')
const Mylogger = require('./loggers/mylogger.log')
const { asyncHandler } = require('./helpers/asyncHandler');
const cookieParser = require('cookie-parser');


// init middleware 
app.use(morgan("dev"));
app.use(helmet());
app.use(compression()); // giảm dung lượng vận chuyển
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// register info api to logger
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id']
    req.requestId = requestId ? requestId : uuidv4()
    Mylogger.info(`${req.method}:: input params `, [
        req.path,
        { requestId: req.requestId },
        req.method === 'POST' || 'PUT' || 'PATCH' ? req.body : req.query
    ])
    next()
})

// connect to db if not test env
if (process.env.NODE_ENV !== 'test') {
    // init db 
    require('./dbs/init.mongodb')
}

const redisDB = require('./dbs/init.redis')
redisDB.initRedis()

// ioRedis 
const ioredis = require('./dbs/init.ioredis')
ioredis.init({
    IOREDIS_IS_ENABLE: true
})
// check over load
const { checkOverLoad } = require('./helpers/check.connect');
// checkOverLoad(); // check over load 

// init router
app.use('', require('../src/routers'))

// handling error 
app.use((req, res, next) => { // middleware sử lý trường hợp không bắt được router nào 
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

// catch error and register to logger 
app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    const resMessage = `${error.status}::${Date.now() - error.now}ms -Response: ${JSON.stringify(error)}`
    Mylogger.error(resMessage, [
        req.path,
        { requestId: req.requestId },
        {
            message: error.message
        }
    ])
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        // stack: error.stack,
        message: error.message || `Internal Server Error`
    })
})


module.exports = app