
'use strict';
const winston = require('winston');
const { createLogger, format, transports, } = require('winston');
const { combine } = format
require('winston-daily-rotate-file')
const { v4: uuidv4 } = require('uuid')

class Mylogger {
    constructor() {
        const formatPrint = format.printf(
            ({ level, message, context, requestId, timestamp, metadata }) => {
                return `${timestamp}::[${context}]::${level}::${requestId}::${message}::${JSON.stringify(metadata)}`
            }
        )

        this.logger = createLogger({
            format: combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS A' }),
                formatPrint
            ),
            transports: [
                new transports.Console(),
                new transports.DailyRotateFile({
                    dirname: 'src/logs',
                    filename: 'application-%DATE%.info.log',
                    datePattern: 'YYYY-MM-DD-HH-mm',
                    zippedArchive: false, // luu tru file zip truoc khi xoa
                    maxSize: '20m', // dung luong file
                    maxFiles: '14d', // neu dat qua 14 ngay thi xoa
                    format: combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS A' }),
                        formatPrint
                    ),
                    level: 'info',
                }),
                new transports.DailyRotateFile({
                    dirname: 'src/logs',
                    filename: 'application-%DATE%.error.log',
                    datePattern: 'YYYY-MM-DD-HH-mm',
                    zippedArchive: false, // luu tru file zip truoc khi xoa
                    maxSize: '20m', // dung luong file
                    maxFiles: '14d', // neu dat qua 14 ngay thi xoa
                    format: combine(
                        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS A' }),
                        formatPrint
                    ),
                    level: 'error',
                })
            ]

        })
    }

    commonParams(params) {
        let context, req, metadata
        if (!Array.isArray(params)) {
            context = params
        } else {
            [context, req, metadata] = params
        }

        const requestId = req?.requestId || uuidv4()

        return {
            context,
            requestId,
            metadata
        }
    }

    log(message, params) {
        const paramsLog = this.commonParams(params)
        const logObject = Object.assign({
            message
        }, paramsLog)
        this.logger.log(logObject)
    }

    info(message, params) {
        const paramsLog = this.commonParams(params)
        const logObject = Object.assign({
            message
        }, paramsLog)
        this.logger.info(logObject)
    }

    error(message, params) {
        const paramsLog = this.commonParams(params)
        const logObject = Object.assign({
            message
        }, paramsLog)
        this.logger.error(logObject)
    }

}

module.exports = new Mylogger()