
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
module.exports = app