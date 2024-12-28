
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

// init db 
require('./dbs/init.mongodb')
const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad(); // check over load 
// init router
app.get('/', (req, res, next) => {
    const strCompress = 'Hello Factipjs';
    return res.status(200).json({
        message: "wellcome",
        // metadata: strCompress.repeat(100000)
    })
})
// handling error 
module.exports = app